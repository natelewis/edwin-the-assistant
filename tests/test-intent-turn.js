'use strict';

let test = require('../lib/test');

test.conversation({
  flow: [
    'turn down music',
  ],
  action: 'turn',
  context: 'music',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'turn down the music in the sun room',
  ],
  action: 'turn',
  context: 'music',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'turn up music in the sun room',
  ],
  action: 'turn',
  context: 'music',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'turn the music down in the kitchen',
  ],
  action: 'turn',
  context: 'music',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'turn up the music in the kitchen',
  ],
  action: 'turn',
  context: 'music',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'turn the music back on',
  ],
  action: 'turn',
  context: 'music',
  topic: 'music',
  debug: false,
});
