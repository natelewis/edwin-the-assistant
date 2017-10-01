'use strict';

let test = require('../lib/test');
let vows = require('vows');

vows.describe('intent-skip'
).addBatch(
  test.assertStatement({
    flow: [
      'skip the song',
    ],
    context: 'song',
    action: 'skip',
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'skip to the next track',
    ],
    context: 'track',
    action: 'skip',
    debug: false,
  })
).export(module);
