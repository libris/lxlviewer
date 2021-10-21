const lxlLogStack = [];

export function lxlLog(...strings) {
  if (lxlLogStack.indexOf(JSON.stringify(strings.join())) === -1) {
    lxlLogStack.push(JSON.stringify(strings.join()));
    return console.log('%c LXL TOOLS ', 'background: #009788; color: #fff;', ...strings);
  }
  return false;
};


const lxlWarnStack = [];

export function lxlWarning(...strings) {
  if (lxlWarnStack.indexOf(JSON.stringify(strings.join())) === -1) {
    lxlWarnStack.push(JSON.stringify(strings.join()));
    return console.warn('%c LXL TOOLS ', 'background: #009788; color: #fff;', ...strings);
  }
  return false;
};

const lxlErrorStack = [];

export function lxlError(...strings) {
  if (lxlErrorStack.indexOf(JSON.stringify(strings.join())) === -1) {
    lxlErrorStack.push(JSON.stringify(strings.join()));
    return console.error('%c LXL TOOLS ', 'background: #a50000; color: #fff;', ...strings);
  }
  return false;
};
