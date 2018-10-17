'use strict';

const assert = require('assert');

const Topic = require('../lib/Topic');

describe('Topic.steps()', () => {
  it('should return {} if the topic is not real', () => {
    const topic = new Topic('asdfasdf');
    assert.deepEqual(topic.steps(), {});
  });
});

describe('Topic.getAnnotations()', () => {
  it('should return [] if the topic is not real', () => {
    const topic = new Topic('asdfasdf');
    assert.deepEqual(topic.getAnnotations(), []);
  });
});
