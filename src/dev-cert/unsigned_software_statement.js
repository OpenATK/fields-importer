module.exports = {
  redirect_uris: [
    'https://localhost:3000/fields-importer/oauth2/redirect.html', 
     'http://localhost:3000/fields-importer/oauth2/redirect.html', 
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
{"kty":"RSA","kid":"f7f80d0dde994dc0ae70eae53a5331b2","e":"AQAB","n":"xy5yadJfzbKQnaRFrrAnepYNzgEQzkWLN2EKRA8EJJe7ayzQU1ls9x0rB1kF1aidPeRcq7aUL-SHb3EvQrDxZGPCXIXc5WZPDQ4ZngnGbGuOtlqGWkHTVHsZQa6cJFvSmj7xBXuBwXM0RtHSZIcyWJmcLOYmyRkxk-PHZBayLO83gTg2Pqfc1TGiFcymJ-BN0MjcOceCC2G0vhH_Xr4vY-943xr6y-fy7o0T6KV6vmHin9cTxrTcke7cg0gks6fmc8b-gdtQiZ0X8q22cwarWdUKWZNzLRFjM38WoLw4QaVXYhPIm767srVXFCQt2T9nsnO-T1v3QCjO78KjOTQcHw"}
    ],
  }
}
