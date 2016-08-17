global.chai = require('chai');
global.expect = global.chai.expect;

// Load test suites

// Main files
// require('');

// Utilities
require('./unit/modalUtil.spec.js');
require('./unit/editUtil.spec.js');
require('./unit/vocabUtil.spec.js');

// Components
require('./unit/formComponent.spec.js');

// Views
// require('');
