'use strict';

let test = require('../lib/test');
let vows = require('vows');

vows.describe('play'
).addBatch(
  test.assertStatement({
    flow: [
      'play music in the kitchen',
    ],
    context: 'music',
    action: 'play',
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'play some music in the kitchen',
    ],
    context: 'music',
    action: 'play',
    debug: false,
  })
).export(module);
