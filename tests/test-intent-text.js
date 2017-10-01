'use strict';

let test = require('../lib/test');
let vows = require('vows');

/* TODO

Have to enable a better way to work with these with mock 3rd party response


vows.describe('text'
).addBatch(
  test.assertStatement({
    flow: [
      'Can you text Nate I\'m on my way home',
      'yes',
    ],
    action: 'text',
    context: 'nate',
    contact: 'nate',
    payload: 'I\'m on my way home',
    debug: true,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'Text to Nate pick up milk on your way home',
      'yes',
    ],
    action: 'text',
    context: 'nate',
    contact: 'nate',
    payload: 'pick up milk on your way home',
    debug: false,
  })
).export(module);
*/
