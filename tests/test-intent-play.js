'use strict';

let test = require('../lib/test');

test.conversation({
  flow: [
    'play music in the kitchen',
  ],
  context: 'music',
  action: 'play',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'play some music in the kitchen',
  ],
  context: 'music',
  topic: 'music',
  action: 'play',
  debug: false,
});
