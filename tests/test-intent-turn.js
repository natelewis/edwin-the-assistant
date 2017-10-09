'use strict';

let test = require('../lib/test');

test.conversation({
  flow: [
    'turn down music',
  ],
  intent: 'turn',
  context: 'music',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'turn down the music in the sun room',
  ],
  intent: 'turn',
  context: 'music',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'turn up music in the sun room',
  ],
  intent: 'turn',
  context: 'music',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'turn the music down in the kitchen',
  ],
  intent: 'turn',
  context: 'music',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'turn up the music in the kitchen',
  ],
  intent: 'turn',
  context: 'music',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'turn the music back on',
  ],
  intent: 'turn',
  context: 'music',
  topic: 'music',
  debug: false,
});
