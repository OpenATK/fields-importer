const SCOPE = 'oada.fields:all';
const OPENATK_METADATA = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6InluMjJ1akJVQ0VlbE5VUnJhOW9na2hlRDJLRVhvbGprc21BVnFGcTBMUGciLCJqd2siOnsia3R5IjoiUlNBIiwia2lkIjoieW4yMnVqQlVDRWVsTlVScmE5b2draGVEMktFWG9samtzbUFWcUZxMExQZyIsIm4iOiJycjM4aUs4RmkwXy1DUkxUdlZLNElJQ2xhcmlpNndWSHBFN3paUFhvRVJsX09vaDY0WW1iUWNSYTVlRncwVVFoVXZFQ2hLdTlObzNqbTdMVzlaY0wxSEtyaGtVVy1PUW9iT1hVbnJDZ29DcGE4VlloX3dSSWRRWWJzdlBRVmo1Tkd1dU5YYVpCX19weEZ5LW5fTzJJTVM4T0dyZXptM2JRSERBZi1qbmdJaFpHWmdMYXZMSnlTSFV5RFFMNEZiUTZEM1F6M0FNT3J4RnZhNEtCSVBDUUtGT21ZWFZuNHp0Z1Q2OGhneU1vYzFLeXR4b1JnelZIbkNkVHBQV1dWcm5NRmNKZWRZRC1MbWswWG81cmpZT3htcThBMWVqZnhQTWVSXzNWNzhBSmsyTERJNHZHYUozZm5hUFpTN0N2VzhGM3BXV2lqX0J5VkdDSS01QnJrcUhfblEiLCJlIjoiQVFBQiJ9fQ.eyJyZWRpcmVjdF91cmlzIjpbImh0dHBzOi8vbG9jYWxob3N0OjMwMDAvZmllbGRzLWltcG9ydGVyL29hdXRoMi9yZWRpcmVjdC5odG1sIiwiaHR0cDovL2xvY2FsaG9zdDozMDAwL2ZpZWxkcy1pbXBvcnRlci9vYXV0aDIvcmVkaXJlY3QuaHRtbCIsImh0dHBzOi8vb3BlbmF0ay5jb20vZmllbGRzLWltcG9ydGVyL29hdXRoMi9yZWRpcmVjdC5odG1sIiwiaHR0cHM6Ly9vcGVuYXRrLmdpdGh1Yi5pby9maWVsZHMtaW1wb3J0ZXIvb2F1dGgyL3JlZGlyZWN0Lmh0bWwiXSwidG9rZW5fZW5kcG9pbnRfYXV0aF9tZXRob2QiOiJ1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXIiLCJncmFudF90eXBlcyI6WyJhdXRob3JpemF0aW9uX2NvZGUiXSwicmVzcG9uc2VfdHlwZXMiOlsidG9rZW4iLCJjb2RlIiwiaWRfdG9rZW4iLCJpZF90b2tlbiB0b2tlbiIsImNvZGUgaWRfdG9rZW4iLCJjb2RlIHRva2VuIiwiY29kZSBpZF90b2tlbiB0b2tlbiJdLCJjbGllbnRfbmFtZSI6Ik9wZW5BVEsgRmllbGRzIEltcG9ydGVyIiwiY2xpZW50X3VyaSI6Imh0dHBzOi8vb3BlbmF0ay5jb20vZmllbGRzLWltcG9ydGVyIiwiY29udGFjdHMiOlsiQWFyb24gQXVsdCA8YXVsdGFjQHB1cmR1ZS5lZHU-Il0sImp3a3MiOnsia2V5cyI6W3sia3R5IjoiUlNBIiwia2lkIjoiZjdmODBkMGRkZTk5NGRjMGFlNzBlYWU1M2E1MzMxYjIiLCJlIjoiQVFBQiIsIm4iOiJ4eTV5YWRKZnpiS1FuYVJGcnJBbmVwWU56Z0VRemtXTE4yRUtSQThFSkplN2F5elFVMWxzOXgwckIxa0YxYWlkUGVSY3E3YVVMLVNIYjNFdlFyRHhaR1BDWElYYzVXWlBEUTRabmduR2JHdU90bHFHV2tIVFZIc1pRYTZjSkZ2U21qN3hCWHVCd1hNMFJ0SFNaSWN5V0ptY0xPWW15Umt4ay1QSFpCYXlMTzgzZ1RnMlBxZmMxVEdpRmN5bUotQk4wTWpjT2NlQ0MyRzB2aEhfWHI0dlktOTQzeHI2eS1meTdvMFQ2S1Y2dm1IaW45Y1R4clRja2U3Y2cwZ2tzNmZtYzhiLWdkdFFpWjBYOHEyMmN3YXJXZFVLV1pOekxSRmpNMzhXb0x3NFFhVlhZaFBJbTc2N3NyVlhGQ1F0MlQ5bnNuTy1UMXYzUUNqTzc4S2pPVFFjSHcifV19fQ.qfFVmPOfVTvvBUzc9Ib7ZUFwsnKeT7XF7t6gr0CiPVR89jyeWDmKcbFAQskR7UeBCD3gNKma3AGvUpZrtlSSy4WYdavES7e5lp5YINB3xPD4FcafLJRLVV7tTLrbRZbDD1-Kg43sjl5mR4Ze-gEdA5ODId4NRWaibeFLJ_lzc7neWNZh4UbqupvautaytbzV_2Z-xs1wLirObm_LsQCBkknyfpwMbDUynxQMB4Qg9bMvN3KFC1LIFPng2xLfP7pPIU8SmmBkLTWX7Wx2vN5GtCM2p1ut0E8Zvq7IeWJ2QZvvy7Ouy_5e6TXux9QD_mrfpe8XhifD71xowkJast24GA";
const LOCALHOST_VIP_METADATA = 'eyJqa3UiOiJodHRwczovL2lkZW50aXR5Lm9hZGEtZGV2LmNvbS9jZXJ0cyIsImtpZCI6ImtqY1NjamMzMmR3SlhYTEpEczNyMTI0c2ExIiwidHlwIjoiSldUIiwiYWxnIjoiUlMyNTYifQ.eyJyZWRpcmVjdF91cmlzIjpbImh0dHA6Ly92aXAzLmVjbi5wdXJkdWUuZWR1OjgwMDAvb2F1dGgyL3JlZGlyZWN0Lmh0bWwiLCJodHRwOi8vbG9jYWxob3N0OjgwMDAvb2F1dGgyL3JlZGlyZWN0Lmh0bWwiXSwidG9rZW5fZW5kcG9pbnRfYXV0aF9tZXRob2QiOiJ1cm46aWV0ZjpwYXJhbXM6b2F1dGg6Y2xpZW50LWFzc2VydGlvbi10eXBlOmp3dC1iZWFyZXIiLCJncmFudF90eXBlcyI6WyJpbXBsaWNpdCJdLCJyZXNwb25zZV90eXBlcyI6WyJ0b2tlbiIsImlkX3Rva2VuIiwiaWRfdG9rZW4gdG9rZW4iXSwiY2xpZW50X25hbWUiOiJPcGVuQVRLIiwiY2xpZW50X3VyaSI6Imh0dHBzOi8vdmlwMy5lY24ucHVyZHVlLmVkdSIsImNvbnRhY3RzIjpbIlNhbSBOb2VsIDxzYW5vZWxAcHVyZHVlLmVkdT4iXSwic29mdHdhcmVfaWQiOiIxZjc4NDc3Zi0zNTQxLTQxM2ItOTdiNi04NjQ0YjRhZjViYjgiLCJyZWdpc3RyYXRpb25fcHJvdmlkZXIiOiJodHRwczovL2lkZW50aXR5Lm9hZGEtZGV2LmNvbSIsImlhdCI6MTUxMjAwNjc2MX0.AJSjNlWX8UKfVh-h1ebCe0MEGqKzArNJ6x0nmta0oFMcWMyR6Cn2saR-oHvU8WrtUMEr-w020mAjvhfYav4EdT3GOGtaFgnbVkIs73iIMtr8Z-Y6mDEzqRzNzVRMLghj7CyWRCNJEk0jwWjOuC8FH4UsfHmtw3ouMFomjwsNLY0';
const REDIRECT_LOCALHOST = 'http://localhost:3000/fields-importer/oauth2/redirect.html';
const REDIRECT_OPENATK = 'http://openatk.com/fields-importer/oauth2/redirect.html';

let METADATA;
let REDIRECT;
let oadaDomain = '';
if (process.env.NODE_ENV !== 'production') {
  console.log('NODE_ENV = ', process.env.NODE_ENV);
  METADATA = LOCALHOST_VIP_METADATA;
  REDIRECT = REDIRECT_LOCALHOST;
  oadaDomain = 'https://localhost';
} else {
  METADATA = OPENATK_METADATA;
  REDIRECT = REDIRECT_OPENATK;
}

let OPTIONS = {
    redirect: REDIRECT,
    metadata: METADATA,
    scope: SCOPE
};

export default {
  OPTIONS,
  REDIRECT,
  METADATA,
  SCOPE,
  oadaDomain
}