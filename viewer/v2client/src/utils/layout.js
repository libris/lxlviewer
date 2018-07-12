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

export function scrollTo(position, duration = 200, easing = 'linear', callback) {
  let properPosition = Math.floor(position);
  if (properPosition < 0) {
    properPosition = 0;
  }
  // define timing functions
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
    }
  };

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
    document.documentElement.offsetHeight
  );

  const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
  const destination = documentHeight - properPosition < windowHeight ? documentHeight - windowHeight : properPosition;

  function scroll() {
    const now = Date.now();
    const time = Math.min(1, ((now - startTime) / duration));
    const timeFunction = easings[easing](time);
    body.scrollTop = (timeFunction * (destination - start)) + start;
    if (Math.floor(body.scrollTop) > destination - 10 && Math.floor(body.scrollTop) < destination + 10) {
      callback();
      return;
    }
    requestAnimationFrame(scroll);
  }
  scroll();
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
      for (const binding in KeyBindings[view]) {
        if (KeyBindings[view][binding] === eventName) {
          str = binding.toUpperCase();
          break;
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

export function getOS() {
  let OSName = "Unknown";
  if (window.navigator.userAgent.indexOf("Windows NT 10.0")!= -1) OSName="Windows 10";
  if (window.navigator.userAgent.indexOf("Windows NT 6.2") != -1) OSName="Windows 8";
  if (window.navigator.userAgent.indexOf("Windows NT 6.1") != -1) OSName="Windows 7";
  if (window.navigator.userAgent.indexOf("Windows NT 6.0") != -1) OSName="Windows Vista";
  if (window.navigator.userAgent.indexOf("Windows NT 5.1") != -1) OSName="Windows XP";
  if (window.navigator.userAgent.indexOf("Windows NT 5.0") != -1) OSName="Windows 2000";
  if (window.navigator.userAgent.indexOf("Mac")            != -1) OSName="Mac/iOS";
  if (window.navigator.userAgent.indexOf("X11")            != -1) OSName="UNIX";
  if (window.navigator.userAgent.indexOf("Linux")          != -1) OSName="Linux";
  return OSName;
}

export function showPage(vueInstance) {
  setTimeout(() => {
    vueInstance.initialized = true;
  }, 0);
}

export function getPosition(element) {
  var xPosition = 0;
  var yPosition = 0;

  while(element) {
      xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
      yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
      element = element.offsetParent;
  }

  return { x: xPosition, y: yPosition };
}