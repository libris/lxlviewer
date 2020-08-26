function toggleAttribute(attr, el) {
  var attrVal = el.getAttribute(attr);
  if (attrVal) {
    if (attrVal === 'true') {
      attrVal = 'false';
    } else {
      attrVal = 'true';
    }
    return el.setAttribute(attr, attrVal);
  }
  return false;
}