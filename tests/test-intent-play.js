'use strict';

let test = require('./test');

test.conversation({
  flow: [
    'play music in the kitchen',
  ],
  context: 'music',
  intent: 'play',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'play some music in the kitchen',
  ],
  context: 'music',
  topic: 'music',
  intent: 'play',
  debug: false,
});
