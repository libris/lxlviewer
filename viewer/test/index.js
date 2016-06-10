global.chai = require('chai');
global.expect = global.chai.expect;

// Load test suites
require('./unit/modalUtil.spec.js');
require('./unit/editUtil.spec.js');
