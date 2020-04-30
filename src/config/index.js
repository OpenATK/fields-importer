export default async function() {
  const oadacert = require('@oada/oada-certs');
  const url = require('url');
  const _ = require('lodash');
  
  let devcert = require('../dev-cert/signed_software_statement.js');
  const udevcert = require('../dev-cert/unsigned_software_statement.js');
 
  // Assumes window.location.href is the root of the website
  const loc = url.parse(window.location.href);
  
  async function getRedirectURIForCurrentLocation(cert)  {
    // If no cert was passed, just create a cert for this origin and return it
    if (!cert) {
      console.log('No cert passed, must be in development mode.  Replacing dev-cert with one for this URL on the fly. loc = ', loc);
      udevcert.redirect_uris = [ loc.href + '/oauth2/redirect.html' ];
      console.log('New redirect_uris = ', udevcert.redirect_uris);
      const key = await oadacert.keys.create();
      devcert = await oadacert.sign(udevcert, key.private);
      console.log('New signed devcert = ', devcert);
      return udevcert.redirect_uris[0];
    }
  
    // Otherwise, look for the current origin+path in the cert that was passed and error if not there
    const index = _.findIndex(udevcert.redirect_uris, r => {
      const ru = url.parse(r);
      // https://localhost:3000 === https://openatk.com/fields-importer
      return (ru.protocol+'//'+ru.host) === (loc.protocol+'//'+loc.host);
    });
    if (index < 0) {
      console.error('ERROR: could not find redirect_uri in developer certificate for this domain!');
      return false;
    }
  
    return udevcert.redirect_uris[index];
  }
  
  
  let metadata = false;
  let redirect = false;
  // If not in production, auto-generate a dev cert based on URL
  if (process.env.NODE_ENV !== 'production') {
    console.log('NODE_ENV = ', process.env.NODE_ENV);
    redirect = await getRedirectURIForCurrentLocation(); // changes global devcert
    metadata = devcert;
  
  // Otherwise, pick dev cert redirect_uri from the cert itself based on our current URL
  } else {
    redirect = await getRedirectURIForCurrentLocation(devcert);
    metadata = devcert;
  }
  
  return {
    redirect, 
    metadata,
    scope: 'oada.fields:all',
  };
}
