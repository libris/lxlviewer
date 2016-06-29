export function getMarc(json) {
  return new Promise((resolve, reject) => {

    const req = new XMLHttpRequest();
    const url = '/_format?to=application/x-marc-json';

    req.open('POST', url);

  });
}
