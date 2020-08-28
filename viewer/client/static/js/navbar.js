var navbarToggle = document.getElementsByClassName('navbar-toggle')[0],
navbarCollapse = document.getElementsByClassName('navbar-collapse')[0];

function toggleMenu() {
    navbarToggle.classList.toggle('collapsed');
    toggleAttribute('aria-expanded', navbarToggle);

    navbarCollapse.classList.toggle('collapse');
    navbarCollapse.classList.toggle('in');
    toggleAttribute('aria-expanded', navbarCollapse);
}

navbarToggle.addEventListener('click', toggleMenu, false);