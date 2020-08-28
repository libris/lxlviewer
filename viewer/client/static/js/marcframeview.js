var isMarc = document.getElementById('marcframeview');

if (isMarc) {
  // NAV-TABS
  var myTabs = document.querySelectorAll(".js-nav-tab");

  function myTabClicks(tabClickEvent) {
    // de-activate all tabs and activate clicked
    for (var i = 0; i < myTabs.length; i++) {
      myTabs[i].classList.remove("active");
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
  for (var i = 0; i < myTabs.length; i++) {
    myTabs[i].addEventListener("click", myTabClicks)
  }

  // RESPONSIVE NAV-TABS TOGGLE
  var marcMain = document.querySelector('.js-marc-main');
  var toggleNavTabsBtn = document.querySelector('.js-toggle-tabs-btn');
  toggleNavTabsBtn.addEventListener('click', toggleNavTabs);
  
  function toggleNavTabs(e) {
    var tabContent = document.querySelector('.js-tab-content');

    function clickBtn() {
      toggleNavTabsBtn.click();
      tabContent.removeEventListener('click', clickBtn);
    }

    marcMain.classList.toggle('nav-tabs-open');
    toggleAttribute('aria-expanded', toggleNavTabsBtn);
    if (marcMain.classList.contains('nav-tabs-open')) {
      // add listener to tab content to close it on click
      tabContent.addEventListener('click', clickBtn);
    }
  }

  // TOGGLE EXAMPLES
  var allExamplesCheckbox = document.getElementById('js-toggle-all-checkbox');
  var toggleExampleButtons = document.querySelectorAll('.js-toggle-example-btn');

  allExamplesCheckbox.addEventListener('click', toggleExamples)
    
  for (var j = 0; j < toggleExampleButtons.length; j++) {
    toggleExampleButtons[j].addEventListener('click', toggleExample);
  }

  function toggleExample(e) {
    if (e.target && e.target.parentElement) {
      var parent = e.target.parentElement;
      // add expanded class
      parent.classList.toggle('expanded');
      e.target.classList.toggle('js-expanded');
      // toggle aria-attributes
      toggleAttribute('aria-expanded', parent);
      var list = parent.querySelector('.js-example-list');
      if (list) {
        toggleAttribute('aria-hidden', list);
      }
    }
  }

  function toggleExamples(e) {
    if (e.target && e.target.checked) {
      // expand all that are closed
      for (var i = 0; i < toggleExampleButtons.length; i++) {
        if (!toggleExampleButtons[i].classList.contains('js-expanded')) {
          toggleExampleButtons[i].click();
        } 
      }
    } else if (e.target && !e.target.checked) {
      // collapse all that are open
      for (var j = 0; j < toggleExampleButtons.length; j++) {
        if (toggleExampleButtons[j].classList.contains('js-expanded')) {
          toggleExampleButtons[j].click();
        }
      }
    }
    return false;
  }
}

