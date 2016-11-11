import View from './view';

function setActive(item) {
  let itemOrg = item;
  let itemNew;
  if (item.indexOf(':') !== -1) {
    const parts = item.split(':');
    itemOrg = item;
    itemNew = parts.join('\\:');
  }
  window.location.hash = itemOrg;
  $('.active-item').removeClass('active-item');
  $('body').scrollTop($(itemNew).offset().top - 100);
  $(itemNew).addClass('active-item');
}


export default class Vocab extends View {

  initialize() {
    super.initialize();

    function accept(id) { return id.indexOf(':') === -1; }

    const nodes = Array.prototype.map.call(document.querySelectorAll(".rdf-class"), function (el) {
      return accept(el.id) ? {
        name: el.id,
        children: Array.prototype.map.call(el.querySelectorAll('.rdf-subclasses a'), function (el) {
          const ref = el.getAttribute('href')
          return ref[0] === '#' && accept(ref) ? ref.substring(1) : null
        }).filter(function (it) { return it; }),
      } : null
    }).filter(function (it) { return it; });

    let graphView = null;
    let loaded = false;

    const classNav = document.querySelector('nav > section > b')
    classNav.addEventListener('click', function () {
      document.body.classList.toggle('graph')
      if (loaded) {
        return;
      }
      graphView = new GraphView(0.8);
      graphView.viewData({ nodes }, function (d) {
        if (d.name) {
          document.location = `#${d.name}`;
        }
      });
      loaded = true;
    })
    const toggle = document.createElement('div');
    toggle.classList.add('toggle');
    toggle.innerHTML = '&otimes;';
    document.body.appendChild(toggle);
    toggle.addEventListener('click', function () {
      document.body.classList.toggle('graph');
    });

    // Target Navigation
    if (window.location.hash.length > 0) {
      setTimeout(function () {
        setActive(window.location.hash);
      }, 250);
    }

    this.initClicks();
  }

  initClicks() {
    $('body#vocab .menu-col a').click(function (e) {
      e.preventDefault();
      setActive($(this).attr('href'));
      // Log
      const ref = $(this).attr('href').split('#')[1];
      const layoutRef = $('body').attr('id');
      if (typeof(_paq) !== 'undefined') _paq.push(['trackEvent', layoutRef, 'Menu click', ref]);
    });
    $('body#vocab .loc a').click(function (e) {
      e.preventDefault();
      setActive($(this).attr('href'));
      // Log
      const ref = $(this).attr('href').split('#')[1];
      const layoutRef = $('body').attr('id');
      if (typeof(_paq) !== 'undefined') _paq.push(['trackEvent', layoutRef, 'Card click', ref]);
    });
  }
}
