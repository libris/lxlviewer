/*
  PUT ALL ADDONS HERE
  This file is merged with modernizr.js into vendor/modernizr/js/modernizr.js
*/

// IE11
Modernizr.addTest('ie11', function() {
  // https://en.wikipedia.org/wiki/Internet_Explorer_11
  'use strict';
  // var ua = navigator.userAgent;
  // var match = /Trident.*rv[\s:]11\./i.test(ua);
  // ('msTransform' in document.body.style)
  var match = (!!document.documentMode &&
                !document.all &&
                (!!window.matchMedia || !!window.msMatchMedia) &&
                !Modernizr.websqldatabase &&
                !Modernizr.cssreflections);
  return match && (window.navigator.userAgent.indexOf('Edge/') == -1)
});
