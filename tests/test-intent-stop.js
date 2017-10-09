'use strict';

let test = require('../lib/test');

test.conversation({
  flow: [
    'stop the music',
  ],
  context: 'music',
  intent: 'stop',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'stop playin this song',
  ],
  context: 'song',
  intent: 'stop',
  topic: 'music',
  debug: false,
});
