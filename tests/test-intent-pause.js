'use strict';

let test = require('../lib/test');

test.conversation({
  flow: [
    'pause song',
  ],
  topic: 'music',
  action: 'pause',
  context: 'song',
  debug: false,
});

test.conversation({
  flow: [
    'pause music',
  ],
  action: 'pause',
  context: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'pause the music',
  ],
  action: 'pause',
  context: 'music',
  debug: false,
});
