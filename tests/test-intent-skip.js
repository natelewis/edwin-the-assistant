'use strict';

let test = require('../lib/test');

test.conversation({
  flow: [
    'skip the song',
  ],
  context: 'song',
  action: 'skip',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'skip to the next track',
  ],
  context: 'track',
  action: 'skip',
  topic: 'music',
  debug: false,
});
