'use strict';

let test = require('../lib/test');

test.conversation({
  flow: [
    'next song please',
  ],
  context: 'song',
  action: 'next',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'play the next song',
  ],
  context: 'song',
  action: 'play',
  topic: 'music',
  debug: false,
});
