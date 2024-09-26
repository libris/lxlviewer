export function getRandomInt(min, max) {
  const iMin = Math.ceil(min);
  const iMax = Math.floor(max);
  const rand = Math.floor(Math.random() * (iMax - iMin)) + iMin;
  return rand;
}

export function getNewRandom(randomArray) {
  let rand = getRandomInt(1000, 10000);
  while (randomArray.indexOf(rand) !== -1) {
    rand = getRandomInt(1000, 10000);
  }
  return rand;
}

export function getCompactNumber(number) {
  const no = number;
  let compact = '';
  let compactNo = 0;
  if (no > 999 && no < 1000000) {
    compactNo = parseInt(no / 1000);
    compact = `${compactNo}k`;
  } else if (no > 999999) {
    compactNo = Math.round(no / 1000000);
    compact = `${compactNo}M`;
  } else {
    compact = `${no}`;
  }
  return compact;
}
