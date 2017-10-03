import * as _ from 'lodash';

export function saveUserSettings(userObj) {
  localStorage.setItem('user', JSON.stringify(userObj));
}

export function isLoggedIn(userInfo) {
  if (userInfo && userInfo.authorization && userInfo.authorization.length > 0) {
    return true;
  }
  return false;
}

export function loadUserSettings() {
  const fetchedObj = JSON.parse(localStorage.getItem('user'));
  const userInfo = window.userInfo;
  if (fetchedObj) {
    if (isLoggedIn(userInfo) && verifySigel(fetchedObj.currentSigel, userInfo) === false) {
      if (userInfo.authorization && userInfo.authorization.length > 0) {
        fetchedObj.currentSigel = userInfo.authorization[0].sigel;
      }
    }
    return fetchedObj;
  }
  const userObj = {
    resultListType: 'detailed',
    showAppTech: false,
  };
  if (isLoggedIn(userInfo)) {
    userObj.currentSigel = userInfo.authorization[0].sigel;
  }
  saveUserSettings(userObj);
  return userObj;
}

function verifySigel(sigelId, userInfo) {
  if (!userInfo || !userInfo.authorization) {
    return false;
  }
  for (const sigel of userInfo.authorization) {
    if (sigel.sigel === sigelId) {
      return true;
    }
  }
  return false;
}
