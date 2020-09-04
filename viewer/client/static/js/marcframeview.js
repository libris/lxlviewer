var isMarc = document.getElementById('marcframeview');

if (isMarc) {

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
      toggleAttribute('aria-expanded', e.target);
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

