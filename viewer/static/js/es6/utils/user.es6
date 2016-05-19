
function saveUserInfo(userObj) {
  localStorage.setItem('user', JSON.stringify(userObj));
}

function fetchUserInfo() {
  const fetchedObj = JSON.parse(localStorage.getItem('user'));
  if (fetchedObj && fetchedObj.username === window.userInfo.username) {
    return fetchedObj;
  }
  const userObj = window.userInfo;
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
  if (key === 'sigel') {
    return user.authorization[0].sigel;
  }
  return null;
}
