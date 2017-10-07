'use strict';

let test = require('../lib/test');

test.conversation({
  flow: [
    'hey',
    'quit',
  ],
  context: 'hey',
  action: 'hey',
  payload: undefined,
  debug: false,
});
