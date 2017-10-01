'use strict';

let test = require('../lib/test');
let vows = require('vows');

vows.describe('intent-next'
).addBatch(
  test.assertStatement({
    flow: [
      'next song please',
    ],
    context: 'song',
    action: 'next',
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'play the next song',
    ],
    context: 'song',
    action: 'play',
    debug: false,
  })
).export(module);
