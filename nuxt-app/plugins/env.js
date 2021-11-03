export default function (envLabel, domain = 'id') {
  if (envLabel === 'local' || typeof envLabel === 'undefined') {
    return 'http://id.kblocalhost.kb.se:5000';
  } else if (envLabel === 'prod') {
    return `https://${domain}.kb.se`;
  } else {
    return `https://${domain}-${ envLabel }.kb.se`;
  }
}