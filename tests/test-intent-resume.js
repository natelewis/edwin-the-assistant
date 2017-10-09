'use strict';

let test = require('../lib/test');

test.conversation({
  flow: [
    'resume music',
  ],
  intent: 'resume',
  context: 'music',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'resume track',
  ],
  intent: 'resume',
  context: 'track',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'resume song',
  ],
  intent: 'resume',
  topic: 'music',
  context: 'song',
  debug: false,
});
