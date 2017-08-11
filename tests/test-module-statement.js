'use strict';

let vows = require('vows');
let assert = require('assert');
let Statement = require('../lib/statement');

vows.describe('statement').addBatch({
  'the statement "Tell Nate dinner is ready"': {
    'topic': new Statement('Turn up the music'),
    'Should have action of "turn"': function(statement) {
      assert.equal(statement.action, 'turn');
    },
    'Should have context of "music"': function(statement) {
      assert.equal(statement.context, 'music');
    },
  },
}).export(module);
