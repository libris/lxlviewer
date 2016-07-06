export function scrollLock(bool) {
  // Lock scroll of the body, mostly used with modals
  const e = document.body;
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
