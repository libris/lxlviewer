
export function saveUserSettings(userObj) {
  localStorage.setItem('user', JSON.stringify(userObj));
}

export function loadUserSettings() {
  const fetchedObj = JSON.parse(localStorage.getItem('user'));
  const userInfo = window.userInfo;
  if (fetchedObj) {
    if (verifySigel(fetchedObj.currentSigel, userInfo.authorization) === false) {
      fetchedObj.currentSigel = userInfo.authorization[0].sigel;
    }
    return fetchedObj;
  }
  const userObj = {
    currentSigel: userInfo.authorization[0].sigel,
    resultListType: 'detailed',
  };
  saveUserSettings(userObj);
  return userObj;
}

function verifySigel(sigelId, authorizationList) {
  for (const sigel of authorizationList) {
    if (sigel.sigel === sigelId) {
      return true;
    }
  }
  return false;
}
