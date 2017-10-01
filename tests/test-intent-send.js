'use strict';

let test = require('../lib/test');
let vows = require('vows');


/* TODO

Have to enable a better way to work with these with mock 3rd party responses

vows.describe('send'
).addBatch(
  test.assertStatement({
    flow: [
      'Send text to Nate', 'quit',
    ],
    action: 'send',
    context: 'text',
    payload: undefined,
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'Send a text',
      'Nate',
      'Tell him I\'m on my way home',
      'yes',
    ],
    action: 'send',
    context: 'text',
    contact: 'nate',
    payload: 'I\'m on my way home',
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'Send a text',
      'Nate',
      'I\'m on my way home',
      'yes',
    ],
    action: 'send',
    context: 'text',
    contact: 'nate',
    payload: 'I\'m on my way home',
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'Send text to Nate pick up milk on your way home',
      'yes',
    ],
    action: 'send',
    context: 'text',
    contact: 'nate',
    payload: 'pick up milk on your way home',
    debug: false,
  })
).export(module);

*/
