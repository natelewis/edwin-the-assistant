'use strict';

let test = require('./test');

test.conversation({
  flow: [
    'next song please',
  ],
  context: 'song',
  intent: 'next',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'play the next song',
  ],
  context: 'song',
  intent: 'play',
  topic: 'music',
  debug: false,
});
