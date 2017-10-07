'use strict';

let test = require('../lib/test');

test.conversation({
  flow: [
    'stop the music',
  ],
  context: 'music',
  action: 'stop',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'stop playin this song',
  ],
  context: 'song',
  action: 'stop',
  topic: 'music',
  debug: false,
});
