module.exports = {
  redirect_uris: [
    'https://localhost:3000/oauth2/redirect.html', 
     'http://localhost:3000/oauth2/redirect.html', 
          'https://openatk.com/fields-importer/oauth2/redirect.html', 
    'https://openatk.github.io/fields-importer/oauth2/redirect.html' 
  ],
  token_endpoint_auth_method:
    'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
  grant_types: ['authorization_code'],
  response_types: [
    'token',
    'code',
    'id_token',
    'id_token token',
    'code id_token',
    'code token',
    'code id_token token'
  ],
  client_name: 'OpenATK Fields Importer',
  client_uri: 'https://openatk.com/fields-importer',
  contacts: ['Aaron Ault <aultac@purdue.edu>'],
  jwks: {
    keys: [
       {"kty":"RSA","kid":"8d7debf83de041579db19f8718e12288","e":"AQAB","n":"1hXuN-8EPQKm_lOqzBiJgnb9yo2eot73BN-cibhNcbo_PEXKAe3AbHWPXQy_I4ihi7t3z-9x7U4-ERlf_LqIzUKf-5cu4oyMdYgNOVxz9NUSRVedU-wwfWn12jIE67ycAVqBB_SI1oHmtZkZauwMuk_Kel8vgo7ZTtcvloRquUhDrr8NsP9hvEcKCLK3tWEzIE6kFt33A7HoIMYhRFJjdiQS8h3g3pjkhjniQj9E4Ky87jKpeePQfLXyRt8notgcGdIvhgVyNQmbeZqFMQQKg0vQH6XvW7FvXX67HTtCLP1QCzoNcmvaZUuzhNA5zvyc5NZW19GMtdsRpOuWw4iyYQ"}
    ],
  }
}
