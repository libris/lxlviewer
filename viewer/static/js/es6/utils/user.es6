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
    if (verifySigel(fetchedObj.currentSigel, userInfo.authorization) === false) {
      if (userInfo.authorization && userInfo.authorization.length > 0) {
        fetchedObj.currentSigel = userInfo.authorization[0].sigel;
      }
    }
    return fetchedObj;
  }
  const userObj = {
    resultListType: 'detailed',
  };
  if (userInfo.authorization && userInfo.authorization.length > 0) {
    userObj.currentSigel = userInfo.authorization[0].sigel;
  }
  saveUserSettings(userObj);
  return userObj;
}

function verifySigel(sigelId, authorizationList) {
  if (!authorizationList) {
    return false;
  }
  for (const sigel of authorizationList) {
    if (sigel.sigel === sigelId) {
      return true;
    }
  }
  return false;
}
