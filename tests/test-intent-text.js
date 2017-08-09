let test = require('../lib/test');
let vows = require('vows');

vows.describe('text'
).addBatch(
  test.assertStatement({
    flow: [
      'Can you text Nate I\'m on my way home',
      'yes',
    ],
    action: 'text',
    context: 'text',
    contact: 'nate',
    payload: 'I\'m on my way home',
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'Text to Nate pick up milk on your way home',
      'yes',
    ],
    action: 'text',
    context: 'text',
    contact: 'nate',
    payload: 'pick up milk on your way home',
    debug: false,
  })
).export(module);
