'use strict';

let test = require('../lib/test');

test.conversation({
  flow: [
    'Describe statement yo momma',
  ],
  context: 'statement',
  intent: 'describe',
  payload: 'yo momma',
  topic: 'describe-sentence',
  debug: false,
});

test.conversation({
  flow: [
    'Describe statement yo momma',
  ],
  context: 'statement',
  intent: 'describe',
  payload: 'yo momma',
  topic: 'describe-sentence',
  debug: false,
});

test.conversation({
  flow: [
    'describe statement',
    'yo momma',
  ],
  context: 'statement',
  intent: 'describe',
  payload: 'yo momma',
  topic: 'describe-sentence',
  debug: false,
});

test.conversation({
  flow: [
    'describe sentence yo momma',
  ],
  context: 'sentence',
  intent: 'describe',
  payload: 'yo momma',
  topic: 'describe-sentence',
  debug: false,
});

test.conversation({
  flow: [
    'describe a sentence',
    'yo momma',
  ],
  context: 'sentence',
  intent: 'describe',
  payload: 'yo momma',
  topic: 'describe-sentence',
  debug: false,
});

test.conversation({
  flow: [
    'describe sentence How long am I',
  ],
  context: 'sentence',
  intent: 'describe',
  payload: 'How long am I',
  topic: 'describe-sentence',
  debug: false,
});
