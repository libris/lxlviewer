// NAVBAR

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

// NAV-TABS (SIDEBAR)

var navTabs = document.querySelectorAll(".js-nav-tab");

if (navTabs) {
  function myTabClicks(tabClickEvent) {
    // de-activate all tabs and activate clicked
    for (var i = 0; i < navTabs.length; i++) {
      navTabs[i].classList.remove("active");
    }
    var clickedTab = tabClickEvent.currentTarget;
    clickedTab.classList.add("active");
    tabClickEvent.preventDefault();
  
    // de-activate all panes activate current
    var myContentPanes = document.querySelectorAll(".tab-pane");
  
    for (var j = 0; j < myContentPanes.length; j++) {
      myContentPanes[j].classList.remove("active");
    }
    var anchorReference = tabClickEvent.target;
    var activePaneId = anchorReference.getAttribute("href");
    var activePane = document.querySelector(activePaneId);
    activePane.classList.add("active");
  }

  // add tab click listeners
  for (var i = 0; i < navTabs.length; i++) {
    navTabs[i].addEventListener("click", myTabClicks)
  }
}

// RESPONSIVE NAV-TABS TOGGLE

var toggleNavTabsBtn = document.querySelector('.js-toggle-tabs-btn');

if (toggleNavTabsBtn) {
  toggleNavTabsBtn.addEventListener('click', toggleNavTabs);
  var mainEl = document.querySelector('main.js-nav-tabs');

  function toggleNavTabs(e) {
    var tabContent = document.querySelector('.js-tab-content');

    function clickBtn() {
      toggleNavTabsBtn.click();
      tabContent.removeEventListener('click', clickBtn);
    }

    mainEl.classList.toggle('nav-tabs-open');
    toggleAttribute('aria-expanded', toggleNavTabsBtn);
    if (mainEl.classList.contains('nav-tabs-open')) {
      // add listener to tab content to close it on click
      tabContent.addEventListener('click', clickBtn);
    }
  }
}