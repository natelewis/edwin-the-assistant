let test = require('../lib/test');
let vows = require('vows');

vows.describe('text'
).addBatch(
  test.assertStatement({
    flow: [
      'stop the music',
    ],
    context: 'music',
    action: 'stop',
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'stop playin this song',
    ],
    context: 'music',
    action: 'stop',
    debug: false,
  })
).export(module);
