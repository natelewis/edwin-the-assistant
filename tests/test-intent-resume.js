let test = require('../lib/test');
let vows = require('vows');

vows.describe('resume intent'
).addBatch(
  test.assertStatement({
    flow: [
      'resume music',
    ],
    action: 'resume',
    context: 'music',
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'resume track',
    ],
    action: 'resume',
    context: 'music',
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'resume song',
    ],
    action: 'resume',
    context: 'music',
    debug: false,
  })
).export(module);
