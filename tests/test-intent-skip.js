'use strict';

let test = require('./test');

test.conversation({
  flow: [
    'skip the song',
  ],
  context: 'song',
  intent: 'skip',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'skip to the next track',
  ],
  context: 'track',
  intent: 'skip',
  topic: 'music',
  debug: false,
});
