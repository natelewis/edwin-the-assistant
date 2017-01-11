var vows = require('vows');
var assert = require('assert');
var Edwin = require('../lib/edwin');

vows.describe('edwin').addBatch({
    'An Edwin instance': {
        topic: new (Edwin)(),

        'Gives reply when nothing is passed': function (edwin) {
            var state = edwin.converse(undefined, undefined, function (state) { return state; });
            assert.notEqual(state.final, undefined);
        }
    }
}).export(module);
