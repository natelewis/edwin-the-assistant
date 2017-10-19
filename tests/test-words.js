'use strict';

const assert = require('assert');

const Words = require('../lib/Words');

describe('Words object', function() {
  it('should be an empty string if not passed some words', () => {
    const words = new Words();
    assert.equal(words.text, '');
  });
});

describe('Words.getWordType function', function() {
  it('should be undefined if not passed anything', () => {
    const words = new Words();
    assert.equal(words.getWordType(), undefined);
  });
});

describe('Words.getWordTypeName function', function() {
  it('should be undefined if not passed anything', () => {
    const words = new Words();
    assert.equal(words.getWordTypeName(), undefined);
  });
});
