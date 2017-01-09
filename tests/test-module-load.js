var vows = require('vows');
var assert = require('assert');
var load = require('../lib/load');

vows.describe('load').addBatch({
    'should have `load.action()`': function () {
        assert.isFunction(load.action);
    },
    'should have `load.intent()`': function () {
        assert.isFunction(load.intent);
    }
}).export(module);
