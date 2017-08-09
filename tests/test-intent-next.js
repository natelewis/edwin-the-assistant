let test = require('../lib/test');
let vows = require('vows');

vows.describe('intent-next'
).addBatch(
  test.assertStatement({
    flow: [
      'next song please',
    ],
    context: 'music',
    action: 'next',
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'play the next song',
    ],
    context: 'music',
    action: 'play',
    debug: false,
  })
).export(module);
