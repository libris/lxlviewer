export default function (envLabel) {
  if (envLabel === 'local' || typeof envLabel === 'undefined') {
    return 'http://localhost:3000';
  } else if (envLabel === 'prod') {
    return 'https://id.kb.se';
  } else {
    return `https://id-${ envLabel }.kb.se`;
  }
}