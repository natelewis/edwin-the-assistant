'use strict';

let test = require('../lib/test');
let vows = require('vows');

vows.describe('text'
).addBatch(
  test.assertStatement({
    flow: [
      'hey',
      'quit',
    ],
    context: undefined,
    action: undefined,
    payload: undefined,
    debug: true,
  })

/*
).addBatch(
  test.assertStatement({
    flow: [
      'describe statement',
      'yo momma',
    ],
    context: 'sentence',
    action: 'describe',
    payload: 'yo momma',
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'describe sentence yo momma',
    ],
    context: 'sentence',
    action: 'describe',
    payload: 'yo momma',
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'describe a sentence',
      'yo momma',
    ],
    context: 'sentence',
    action: 'describe',
    payload: 'yo momma',
    debug: false,
  })
).addBatch(
  test.assertStatement({
    flow: [
      'describe sentence How long am I',
    ],
    context: 'sentence',
    action: 'describe',
    payload: 'How long am I',
    debug: false,
  })*/
).export(module);
