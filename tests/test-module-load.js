let vows = require('vows');
let assert = require('assert');
let load = require('../lib/load');

vows.describe('load').addBatch({
  'should have `load.module()`': function() {
    assert.isFunction(load.module);
  },
  'should have `load.intent()`': function() {
    assert.isFunction(load.intent);
  },
}).export(module);
