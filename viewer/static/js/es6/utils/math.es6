
function getRandomInt(min, max) {
  const iMin = Math.ceil(min);
  const iMax = Math.floor(max);
  return Math.floor(Math.random() * (iMax - iMin)) + iMin;
}

export function getNewRandom(randomArray) {
  let rand = getRandomInt(1000, 10000);
  while (randomArray.indexOf(rand) !== -1) {
    rand = getRandomInt(1000, 10000);
  }
  return rand;
}
