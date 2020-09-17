var vocabBody = document.getElementById('vocab');

if (vocabBody) {
  marcEls = vocabBody.querySelectorAll('.is-marc');
  var toggleMarcCheckbox = document.getElementById('js-toggle-marc');
  toggleMarcCheckbox.addEventListener('change', toggleMarc)

  function toggleMarc(e) {
    for (var i = 0; i < marcEls.length; i++) {
      marcEls[i].classList.toggle('js-hidden');
    }
  }
}
