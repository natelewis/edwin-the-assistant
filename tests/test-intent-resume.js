'use strict';

let test = require('../lib/test');

test.conversation({
  flow: [
    'resume music',
  ],
  action: 'resume',
  context: 'music',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'resume track',
  ],
  action: 'resume',
  context: 'track',
  topic: 'music',
  debug: false,
});

test.conversation({
  flow: [
    'resume song',
  ],
  action: 'resume',
  topic: 'music',
  context: 'song',
  debug: false,
});
