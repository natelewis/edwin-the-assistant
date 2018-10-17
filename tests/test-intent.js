'use strict';

const assert = require('assert');

const Intent = require('../lib/Intent');

describe('Intent.get', () => {
  it('should be an undefined if the intent is not real', () => {
    const intent = new Intent('asdfasdf');
    assert.equal(intent.intentObj, undefined);
  });
});

describe('Intent.updateTopicFromModifiers', () => {
  it('should have undefined topic when phrase does not find a match', () => {
    const intent = new Intent('how');
    const topic = intent.updateTopicFromModifiers({
      statement: 'how you asdf doing',
      context: undefined,
      topic: undefined,
    });
    assert.equal(topic, undefined);
  });
});

describe('Intent.updateContextFromModifiers', () => {
  it('should have undefined topic when phrase does not find a match', () => {
    const intent = new Intent('what');
    const topic = intent.updateContextFromModifiers({
      statement: 'what is your asdf name',
      context: undefined,
      topic: undefined,
    });
    assert.equal(topic, undefined);
  });
});
