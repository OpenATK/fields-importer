import React from 'react';
//import oadaid from '@oada/oada-id-client';
//import devcert from './dev-cert/signed_software_statement.js';
//import udevcert from './dev-cert/unsigned_software_statement.js';
import { Helmet } from 'react-helmet';
import pkg from '../package.json';
import debug from 'debug';
import './App.css';

import Promise from 'bluebird';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import oada from '@oada/oada-cache';
import Dropzone from 'react-dropzone';
import togeojson from '@mapbox/togeojson';
import tree from './tree';
import configFunc from './config'

let config = configFunc(); // This is a promise, you have to await it if you want to use it later

const trace = debug('fields-importer#app:trace');
const info = debug('fields-importer#app:trace');
const error = debug('fields-importer#app:trace');

if (process.env.NODE_ENV !== 'production') {
  info('NOT production, turning on all debugs');
  localStorage.debug = "*";
} else {
  localStorage.debug = "*info*,*warn*,*error*"; // production turn off debugging
}

let con = false;

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

class App extends React.Component {

  constructor(props) {
    super(props);

    let domain = localStorage['oada.domain'] || false;
    if (domain === 'false' || (typeof domain === 'string' && domain.length < 1)) {
      domain = false;
    }
    if (domain && !domain.match(/^http/)) domain = 'https://'+domain;

    this.state = { 
      showlogin: true, // no token by default, show login, componentDidMount will correct if we have token
      showdropzone: false, 
      showapproval: false,
      showcomplete: false,
      message: false,
      jobs: [],
      domain,
      token: false,
    };
  }

  async componentDidMount() {
    // ask OADA if we have a token
    let token = false;
    if (this.state.domain) { 
      token = await oada.getDomainToken(this.state.domain); //localStorage['oada.token'] || false;

      if (token === 'false' || (typeof token === 'string' && token.length < 1)) {
        token = false;
      }
    }

    trace('componentDidMount: Setting state, token = ', JSON.stringify(token));
    this.setState({
      showlogin: !token,
      showdropzone: !!token,
      token,
    });

  }

  async fetchAllRemoteGFF() {
    this.setState({ message: 'Fetching your current fields...'});
    const root = await con.get({path: '/bookmarks/fields'}).then(r => r.data).catch(e => {error('/bookmarks/fields does not exist!'); return false});
    if (!root) return { growers: [], farms: [], fields: [] };

    const { growers, farms, fields } = await Promise.props({
      growers: Promise.reduce(_.keys(root.growers), async (acc,g) => { 
                 const result = await con.get({ path: `/bookmarks/fields/growers/${g}` }).then(r=>r.data).catch(e => {error(`Grower ${g} doesn't exist!`); return false}); 
                 if (result) acc[g] = result;
                 return acc;
               }, {}, { concurrency: 5 } ),
        farms: Promise.reduce(_.keys(root.farms),   async (acc,f) => { 
                 const result = await con.get({ path: `/bookmarks/fields/farms/${f}` }).then(r=>r.data).catch(e => {error(`Farm ${f} doesn't exist!`); return false}); 
                 if (result) acc[f] = result;
                 return acc 
               }, {}, { concurrency: 5 } ),
       fields: Promise.reduce(_.keys(root.fields),  async (acc,f) => { 
                 const result = await con.get({ path: `/bookmarks/fields/fields/${f}` }).then(r=>r.data).catch(e => {error(`Field ${f} doesn't exist!`); return false}); 
                 if (result) acc[f] = result;
                 return acc 
               }, {}, { concurrency: 5 } ),
    });
    return { growers, farms, fields };
  }


  // Expects a feature array (i.e. geojson.features is an array), and expects
  // each item to have propterties with Grower - Name, Farm - Name, Field - Name
  // from SST export
  geoJSONToOADA({geojson, remote}) {
    const { growers, farms, fields } = _.reduce(geojson.features, (acc,f) => {
      // Extract names from the KML:
      const grower = { name: f.properties['Grower - Name'] };
      const farm = { name: f.properties['Farm - Name'] };
      const field = { name: f.properties['Field - Name'], boundary: f.geometry };
  
      // Figure out if we've seen this grower or farm before locally:
      const gkey = _.find(_.keys(acc.growers), k => acc.growers[k].name === grower.name)
      if (gkey) grower.id = gkey;
      const fkey = _.find(_.keys(acc.farms), k => acc.farms[k].name === farm.name);
      if (fkey) farm.id = fkey;
  
      // Figure out if we already have this grower, farm, or field on the remote:
      const rgkey = _.find(_.keys(remote.growers), k => remote.growers[k].name === grower.name)
      if (rgkey) {
        // Store both the key under growers (as id) and the resourceid (as _id)
        grower.id = rgkey;
        grower._id = remote.growers[rgkey]._id;
      }
      let rfkey = _.find(_.keys(remote.farms), k => remote.farms[k].name === farm.name)
      if (rfkey) {
        farm.id = rfkey;
        farm._id = remote.farms[rfkey]._id;
      }
      rfkey = _.find(_.keys(remote.fields), k => remote.fields[k].name === field.name)
      if (rfkey) {
        field.id = rfkey;
        field._id = remote.fields[rfkey]._id;
      }
  
      // Assign new id's where we don't know them
      if (!grower.id) grower.id = uuidv4();
      if (!farm.id) farm.id = uuidv4();
      if (!field.id) field.id = uuidv4();
  
      // Assign the proper links within farm and field to their parent.
      // If the grower or farm does not have an _id, then it is not in the
      // remote and will have to be created. The eventually created link will be at resources/<id>
      // i.e. we will re-use the UUID keys as their resourceid
      farm.grower = { _id: grower._id || `resources/${grower.id}` };
      field.farm = farm.id;
  
      // Store grower, farm, field, in accumulator
      acc.growers[grower.id] = grower;
      acc.farms[farm.id] = farm;
      acc.fields[field.id] = field;
      return acc;
    }, { growers: {}, farms: {}, fields: {} });

    // At this point, anything under growers, farms, or fields that has an _id is 
    // already on the remote server, and anything without an _id is not
    return { growers, farms, fields };
  }

  // expects local.growers, local.farms, local.fields
  async constructJobList(local) {
    // Build a nice array of everything to be done so we can
    // manage concurrency.  i.e. find all the things without
    // an _id key.
    return _.reduce(['growers', 'farms', 'fields'], (acc,lt) => {
      _.each(local[lt], l => {
        if (!l._id) {
          acc.push({ type: lt.replace(/s$/,''), listtype: lt, data: l });
        }
      });
      return acc;
    }, []);
  }

  async putAllJobsToOADA(jobs) {
    info('Have '+jobs.length+' jobs to do, creating all the resources');
    this.setState({ message: 'Creating '+jobs.length+' resources in OADA' });
    let oadaFarms = {};

    const log = [];
    await Promise.each(['growers', 'farms', 'fields'], async lt => {
      const jobsthistype = _.filter(jobs, j => j.listtype === lt);
      await Promise.each(jobsthistype, async j => {
        const data = _.cloneDeep(j.data);
  
        if (j.type === 'field' && data.farm) {
          console.log(data.farm);
          let farmId = oadaFarms[data.farm];
          console.log(farmId);
          data.farm = {_id: farmId.replace('\/resources', 'resources')}
          console.log('creating this link', data.farm)
        }

        const path = `/bookmarks/fields/${j.type}s/${data.id}`;
        let tempid = data.id
        if (data.id) delete data.id; // not included in remote
        if (data.type) delete data.type;
  //      if (data._id) delete data._id; // not included in remote
        trace('Creating resource, job = ', j);
        trace('Putting to path = ', path);
        try {
          let oadaResponse = await con.put({ 
            path, 
            data, 
            tree
          });

          if (j.type === 'farm') {
            oadaFarms[tempid] = oadaResponse.headers['content-location'];
            console.log('found a farm', tempid, oadaFarms[tempid])
          }
        } catch (err) {
          const errors = this.state.errors || [];
          errors.push({ job: j });
          this.setState({ errors });
          error('errored on job ', j, 'error was: ', err) 
        }
        log.push({ resource: path, action: 'create', type: j.type, data });
        this.setState({message: `${log.length} jobs handled so far, ${jobs.length-log.length} left to go.`});
      }, { concurrency: 1 });
    })
    this.setState({ showcomplete: true });
    return log;
  }

  async droppedFiles(files) {
    this.setState({ message: 'Connecting to OADA...' });
    this.setState({ showdropzone: false });

    // Connect using a token from localstorage (should be handled by the cache itself already)
    trace('Reusing token', this.state.token)
    con = await oada.connect({
      token: this.state.token,  // token is cached in lib, use that one
      domain: this.state.domain, 
      cache: false
    });
  
    files.forEach(async f => {
      const { geojson, remote } = await Promise.props({
        // Read and convert local file to geojson
        geojson: new Promise((resolve,reject) => {
          info('Reading local KML file and converting to goejson');
          const reader = new FileReader()
          reader.onabort = () => { error('file reading was aborted'); reject(); }
          reader.onerror = () => { error('file reading has failed');  reject(); }
          reader.onload = async () => {
            const binaryStr = reader.result;
            const domparser = new DOMParser();
            const kml = domparser.parseFromString(binaryStr, 'text/xml');
            const geojson = togeojson.kml(kml);
            trace('kml = ', kml, ', geojson = ', geojson);
            info('Extracting growers, farms, fields locally...');
            resolve(geojson);
          }
          reader.readAsText(f);
        }),
  
        // Fetch current state of all remote resources to match up names/id's
        remote: this.fetchAllRemoteGFF(),
      });
 
      this.setState({ message: 'Comparing KML with what you have to decide if anything is new' });
      info('Harmonizing local GFF with remote GFF, remote = ', remote);
      const local = this.geoJSONToOADA({geojson, remote});
  
      trace('Preparing to update remote, Final local gff = ', local);
      const jobs = await this.constructJobList(local);
      this.setState({
        jobs, showapproval: true, message: false,
      });
      
      info('Done!');
    })

  }

  async doLogin() {
    let domain = this.state.domain;
    if (typeof domain === 'string' && !domain.match(/^http/)) {
      domain = 'https://'+domain;
    }
    localStorage['oada.domain'] = domain;

    const cfg = await config;
    trace('redirect = ', config.redirect);
    // Get new token
    try {
      con = await oada.connect({
        domain: this.state.domain, 
        cache: false,
        options: {
          redirect: cfg.redirect,
          metadata: cfg.metadata,
          scope: cfg.scope,
        },
      });

      let token = con.token;
      this.setState({
        token,
        showlogin: false,
        showdropzone: true,
      });
      trace('Have connection and token: ', token);
    } catch(e) {
      error('Connect failed!  error was: ', e);
      this.setState({message: 'Connection failed, please try again later.'});
    }
  }

  async doLogout() {
    info('Calling resetDomainCache...');
    await oada.resetDomainCache(this.state.domain); // also clears the cached token
    this.setState({ showlogin: true, showdropzone: false, showcomplete: false, showapproval: false, token: false });
  }

  domainChanged(evt) {
    let domain = evt.target.value;
    this.setState({ domain });
  }

  render() {
    const jobs = this.state.jobs || [];
    const approvals = {
      growers: _.filter(jobs, j => j.type === 'grower'),
      farms: _.filter(jobs, j => j.type === 'farm'),
      fields: _.filter(jobs, j => j.type === 'field'),
    };
    
    return (
      <div className="App" style={{ fontFamily: 'arial' }}>
        <Helmet>
          <title>OpenATK Fields Importer - v{pkg.version}</title>
        </Helmet>
        <div style={{ backgroundColor: '#0066CC', color: '#FFFFFF', fontSize: '2em', padding: '5px', textAlign: 'left', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
          <div>OpenAgToolkit Fields Importer</div>
          <div style={{flexGrow: 1}}></div>
          {this.state.showlogin ? '' : 
            <div onClick={() => this.doLogout()} style={{ fontSize: '0.7em', color: '#FFFFFF', textDecoration: 'underline' }}>
              {this.state.token ? 'Logout' : 'Login'}
            </div>
          }
        </div>


        {this.state.message ? <div style={{color: '#00AA00', padding: '5px', margin: '5px' }}>{this.state.message}</div> : null }

        {!this.state.showlogin ? '' : 
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '2em', padding: '20px' }}>Where should I sync fields to?</div>
            <div style={{  }}><input style={{fontSize: '1.0em', width: '250px'}} type="text" value={this.state.domain || ''} onChange={evt => this.domainChanged(evt)} /></div>
            <div style={{ margin : '10px', borderRadius: '3px', border: '1px solid #CCCCCC', width: '250px', backgroundColor: '#3399FF', color: '#FFFFFF', fontSize: '2em', cursor: 'pointer'  }} onClick={() => this.doLogin()}>Connect</div>
          </div>
        }

        {! this.state.showdropzone ? '' : 
          <div>
            <p>Drop a KML from Ag Leader SMS here and it will ensure those growers, farms, and fields exist at your OADA cloud.</p>
            <Dropzone onDrop={f => this.droppedFiles(f)}>
              {({getRootProps, getInputProps}) => (
                <section>
                  <div style={{
                       flex: 1, display: 'flex', 
                       justifyContent: 'center',
                       alignItems: 'center',
                       border: '3px dashed #BBBBBB', 
                       borderRadius: '10px',
                       margin: '5px',
                       padding: '5px',
                       minHeight: '50vh',
                    }} {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p key='thep'>Drop KML files with your fields here.</p>
                  </div>
                </section>
              )}
            </Dropzone>
          </div>
        }

        {!this.state.showapproval ? null : 
          <div>
            { approvals.growers.length < 1 && approvals.farms.length < 1 && approvals.fields.length < 1
              ? <div style={{color: '#00BB00', padding: '5px', margin: '5px'}}>
                  Your remote OADA cloud is up to date with the names in this KML file, nothing new to send!
                </div>
              : <div style={{ padding: '10px' }}>
                  <div style={{ fontSize: '2em' }}>About to add the following items to your remote OADA cloud</div>
                  <div onClick={() => {
                      this.setState({ showapproval: false });
                      this.putAllJobsToOADA(this.state.jobs);
                    }} style={{ backgroundColor: '#3399FF', borderRadius: '3px', color: '#FFFFFF', fontSize: '1.5em', margin: '15px' }}>
                    Click to Approve
                  </div>
                </div>
            }
            {_.map(['growers', 'farms', 'fields'], t => {
              if (approvals[t].length < 1) return null;
              return (
                <div key={t+'-list'}>
                  <div style={{ textAlign: 'left', padding: '5px', fontWeight: 'bold', fontSize: '1.5em' }}>{capitalizeFirstLetter(t)} ({approvals[t].length} new):</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: 'row' }}>
                    {_.map(approvals[t], (f,i) => 
                      <div key={'approval'+t+i} style={{ padding: '5px', margin: '5px', borderRadius: '2px', border: '1px solid #EEEEEE' }}>
                        {f.data.name}
                      </div>)
                    }
                  </div>
                </div>
              );
            })}
          </div>
        }

        {!this.state.errors || this.state.errors.length < 1 ? null :
          <div style={{color: 'red', display: 'flex', flexDirection: 'column' }}>
            There are some errors in processing, please drop your KML again to fix.
            {_.map(this.state.errors, (e,i) => <div key={'error'+i}>{e.job.type}: {e.job.data.name}</div>)}
          </div>
        }

        {!this.state.showcomplete ? null : 
          <div style={{color: 'green' }}>
            Complete!
          </div>
        }


        <div className='footer-bar' style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', flexWrap: 'wrap', position: 'absolute', bottom: '0px', width: '99vw' }}>
          <div className='footer-bar-element'>
            <b>License:</b><br/>Apache 2.0
          </div>
          <div className='footer-bar-element'>
            <a href="http://trellisframework.org">
              <img className='footer-logo' alt='trellis' width='200px' src='/fields-importer/logo-trellis.png'/>
            </a>
          </div>
          <div className='footer-bar-element'>
            <a href="http://oatscenter.org">
              <img className='footer-logo' alt='oats' width='200px' src='/fields-importer/logo-oats.png'/>
            </a>
          </div>
          <div className='footer-bar-element'>
            <a href="http://oatscenter.org">
              <img className='footer-logo' alt='purdue' width='200px' src='/fields-importer/logo-purdue.png'/>
            </a>
          </div>
          <div className='footer-bar-element'>
            Many thanks to key sponsor <br/><a href='https://winfieldunited.com'>Winfield United</a>!
          </div>
        </div>

      </div>
    );
  }
}

export default App;
