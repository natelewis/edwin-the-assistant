'use strict';

let assert = require('assert');
let Edwin = require('../lib/edwin');
/*
vows.describe('edwin').addBatch({
  'An Edwin instance': {
    'topic': new (Edwin)(),

    'Gives reply when nothing is passed': function(edwin) {
      let state = edwin.converse(undefined, '', function(state) {
        return state;
      });
      assert.notEqual(state.reply, undefined);
    },
  },
}).export(module);
*/
