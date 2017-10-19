'use strict';

const assert = require('assert');

const Topic = require('../lib/Topic');

describe('Topic.steps()', function() {
  it('should return {} if the topic is not real', () => {
    const topic = new Topic('asdfasdf');
    assert.deepEqual(topic.steps(), {});
  });
});

describe('Topic.getAnnotations()', function() {
  it('should return [] if the topic is not real', () => {
    const topic = new Topic('asdfasdf');
    assert.deepEqual(topic.getAnnotations(), []);
  });
});
