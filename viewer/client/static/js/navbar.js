var navbarToggle = document.getElementsByClassName('navbar-toggle')[0],
navbarCollapse = document.getElementsByClassName('navbar-collapse')[0];

function toggleMenu() {
    navbarToggle.classList.toggle('collapsed');
    toggleAttribute('aria-expanded', navbarToggle)

    navbarCollapse.classList.toggle('collapse');
    navbarCollapse.classList.toggle('in');
    toggleAttribute('aria-expanded', navbarCollapse);
}

function toggleAttribute(attr, el) {
    var attrVal = el.getAttribute(attr)
    if (attrVal) {
        if (attrVal === 'true') {
            attrVal = 'false'
        } else {
            attrVal = 'true'
        }
        return el.setAttribute(attr, attrVal);
    }
    return false;
}

navbarToggle.addEventListener('click', toggleMenu, false);