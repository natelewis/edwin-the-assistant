'use strict';

let test = require('./test');

test.conversation({
  flow: [
    'pause song',
  ],
  topic: 'music',
  intent: 'pause',
  context: 'song',
  debug: false,
});

test.conversation({
  flow: [
    'pause music',
  ],
  intent: 'pause',
  context: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'pause the music',
  ],
  intent: 'pause',
  context: 'music',
  debug: false,
});
