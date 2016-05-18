
function saveUserInfo(userObj) {
  localStorage.setItem('user', JSON.stringify(userObj));
}

function fetchUserInfo() {
  if (localStorage.getItem('user')) {
    return JSON.parse(localStorage.getItem('user'));
  }

  const userObj = { sigel: window.sigelList[0].sigel };
  saveUserInfo(userObj);
  return userObj;
}

export function set(key, val) {
  const user = fetchUserInfo();
  user[key] = val;
  saveUserInfo(user);
}

export function get(key) {
  const user = fetchUserInfo();
  if (user.hasOwnProperty(key)) {
    return user[key];
  }
  return null;
}
