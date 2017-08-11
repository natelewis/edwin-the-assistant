let vows = require('vows');
let assert = require('assert');
let load = require('../lib/load');

vows.describe('load').addBatch({
  'should have `load.module()`': function() {
    assert.isFunction(load.module);
  },
  '`load.module(\'notARealModule\', false)` should be undefined': function() {
    assert.equal(load.module('notARealModule', false), undefined);
  },
  '`load.module(\'./README.md\', false)` should be undefined': function() {
    assert.equal(load.module('./README.md', false), undefined);
  },
}).export(module);
