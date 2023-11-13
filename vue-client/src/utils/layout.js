import KeyBindings from '@/resources/json/keybindings.json';

export function scrollLock(bool) {
  // Lock scroll of the body, mostly used with modals
  const e = document.documentElement;
  const c = 'scroll-lock';
  if (bool) {
    if (e.classList) {
      e.classList.add(c);
    } else {
      e.classList += c;
    }
  } else {
    e.classList.remove(c);
  }
}

/* eslint-disable no-use-before-define */
function handleMouseDownOnce() {
  document.body.classList.remove('user-is-tabbing');
  window.removeEventListener('mousedown', handleMouseDownOnce);
  window.addEventListener('keydown', handleFirstTab);
}
export function enableTabbing() {
  document.body.classList.add('user-is-tabbing');
  window.removeEventListener('keydown', handleFirstTab);
  window.addEventListener('mousedown', handleMouseDownOnce);
}
export function handleFirstTab(e) {
  if (e.keyCode === 9) {
    enableTabbing();
  }
}
/* eslint-enable no-use-before-define */

export function scrollTo(position, duration = 200, easing = 'linear', callback) {
  let properPosition = Math.floor(position);
  if (properPosition < 0) {
    properPosition = 0;
  }
  // define timing functions
  /* eslint-disable no-param-reassign */
  const easings = {
    linear(t) {
      return t;
    },
    easeInQuad(t) {
      return t * t;
    },
    easeOutQuad(t) {
      return t * (2 - t);
    },
    easeInOutQuad(t) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    },
    easeInCubic(t) {
      return t * t * t;
    },
    easeOutCubic(t) {
      return (--t) * t * t + 1;
    },
    easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
    },
    easeInQuart(t) {
      return t * t * t * t;
    },
    easeOutQuart(t) {
      return 1 - (--t) * t * t * t;
    },
    easeInOutQuart(t) {
      return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
    },
    easeInQuint(t) {
      return t * t * t * t * t;
    },
    easeOutQuint(t) {
      return 1 + (--t) * t * t * t * t;
    },
    easeInOutQuint(t) {
      return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
    },
  };
  /* eslint-enable no-param-reassign */

  // Returns document.documentElement for Chrome and Safari
  // document.body for rest of the world
  function checkBody() {
    document.documentElement.scrollTop += 1;
    const body = (document.documentElement.scrollTop !== 0) ? document.documentElement : document.body;
    document.documentElement.scrollTop -= 1;
    return body;
  }

  const body = checkBody();
  const start = body.scrollTop;
  const startTime = Date.now();

  // Height checks to prevent requestAnimationFrame from infinitely looping
  // If the function tries to scroll below the visible document area
  // it should only scroll to the bottom of the document
  const documentHeight = Math.max(
    document.body.scrollHeight,
    document.body.offsetHeight,
    document.documentElement.clientHeight,
    document.documentElement.scrollHeight,
    document.documentElement.offsetHeight,
  );

  const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
  const destination = documentHeight - properPosition < windowHeight ? documentHeight - windowHeight : properPosition;

  function reachedBottom() {
    if (body.scrollHeight - body.scrollTop - body.clientHeight === 0) return true;
    return false;
  }

  function scroll() {
    const now = Date.now();
    const time = Math.min(1, ((now - startTime) / duration));
    const timeFunction = easings[easing](time);
    body.scrollTop = (timeFunction * (destination - start)) + start;
    if (Math.floor(body.scrollTop) > destination - 10 && (Math.floor(body.scrollTop) < destination + 10 || reachedBottom())) {
      callback();
      return;
    }
    requestAnimationFrame(scroll);
  }
  scroll();
}

export function getPosition(element) {
  let curElement = element;
  let xPosition = 0;
  let yPosition = 0;

  while (curElement) {
    xPosition += (curElement.offsetLeft - curElement.scrollLeft + curElement.clientLeft);
    yPosition += (curElement.offsetTop + curElement.clientTop);
    curElement = curElement.offsetParent;
  }

  return { x: xPosition, y: yPosition };
}

export function isElementInViewport(element, viewportPadding = { top: 0, right: 0, bottom: 0, left: 0 }) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 + viewportPadding.top
    && rect.left >= 0 + viewportPadding.left
    && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) - viewportPadding.bottom
    && rect.right <= (window.innerWidth || document.documentElement.clientWidth) - viewportPadding.right
  );
}

export function scrollToElement($el, duration, callback) {
  const topOfElement = getPosition($el).y;
  if (topOfElement > 0) {
    const windowHeight = window.innerHeight
    || document.documentElement.clientHeight
    || document.getElementsByTagName('body')[0].clientHeight;
    const scrollPos = getPosition($el).y - (windowHeight * 0.2);
    scrollTo(scrollPos, duration, 'easeInOutQuad', callback);
  } else {
    callback();
  }
}

export function ensureInViewport(element, viewportPadding = { top: 0, right: 0, bottom: 0, left: 0 }) {
  return new Promise((resolve) => {
    const inViewport = isElementInViewport(element, viewportPadding);
    if (inViewport) {
      resolve();
    } else {
      scrollToElement(element, 1000, () => {
        resolve();
      });
    }
  });
}

export function getOS() {
  let OSName = 'Unknown';
  if (window.navigator.userAgent.indexOf('Windows NT 10.0') !== -1) OSName = 'Windows 10';
  if (window.navigator.userAgent.indexOf('Windows NT 6.2') !== -1) OSName = 'Windows 8';
  if (window.navigator.userAgent.indexOf('Windows NT 6.1') !== -1) OSName = 'Windows 7';
  if (window.navigator.userAgent.indexOf('Windows NT 6.0') !== -1) OSName = 'Windows Vista';
  if (window.navigator.userAgent.indexOf('Windows NT 5.1') !== -1) OSName = 'Windows XP';
  if (window.navigator.userAgent.indexOf('Windows NT 5.0') !== -1) OSName = 'Windows 2000';
  if (window.navigator.userAgent.indexOf('Mac') !== -1) OSName = 'Mac/iOS';
  if (window.navigator.userAgent.indexOf('X11') !== -1) OSName = 'UNIX';
  if (window.navigator.userAgent.indexOf('Linux') !== -1) OSName = 'Linux';
  return OSName;
}

export function getKeybindingText(eventName) {
  let str = '';
  const os = getOS();
  let modkey = '';
  if (os.indexOf('Windows') > -1) {
    modkey = 'Ctrl';
  } else if (os.indexOf('Mac') > -1) {
    modkey = '⌘';
  } else {
    modkey = 'mod';
  }
  if (eventName) {
    for (const view in KeyBindings) {
      if (Object.prototype.hasOwnProperty.call(KeyBindings, view)) {
        for (const binding in KeyBindings[view]) {
          if (Object.prototype.hasOwnProperty.call(KeyBindings[view], binding)) {
            if (KeyBindings[view][binding] === eventName) {
              str = binding.toUpperCase();
              break;
            }
          }
        }
      }
    }
    str = str.replace('MOD', modkey);
    str = str.replace('CTRL', 'Ctrl');
    str = str.replace('ALT', 'Alt');
    str = str.replace('SHIFT', '⇧');
    str = str.replace('MINUS', 'Minus');
    str = str.replace('PLUS', 'Plus');
  }
  return str;
}
