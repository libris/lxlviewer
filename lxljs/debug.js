const PKG_NAME = require('./package.json').name.toUpperCase();

const lxlLogStack = [];

export function lxlLog(...strings) {
  if (process.env.NODE_ENV === 'development' && lxlLogStack.indexOf(JSON.stringify(strings.join())) === -1) {
    lxlLogStack.push(JSON.stringify(strings.join()));
    return console.log(`%c ${PKG_NAME} `, 'background: #009788; color: #fff;', ...strings);
  }
  return false;
}

const lxlWarnStack = [];

export function lxlWarning(...strings) {
  if (process.env.NODE_ENV === 'development' && lxlWarnStack.indexOf(JSON.stringify(strings.join())) === -1) {
    lxlWarnStack.push(JSON.stringify(strings.join()));
    return console.warn(`%c ${PKG_NAME} `, 'background: #009788; color: #fff;', ...strings);
  }
  return false;
}

const lxlErrorStack = [];

export function lxlError(...strings) {
  if (process.env.NODE_ENV === 'development' && lxlErrorStack.indexOf(JSON.stringify(strings.join())) === -1) {
    lxlErrorStack.push(JSON.stringify(strings.join()));
    return console.error(`%c ${PKG_NAME} `, 'background: #a50000; color: #fff;', ...strings);
  }
  return false;
}
