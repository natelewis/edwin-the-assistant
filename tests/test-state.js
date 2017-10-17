const assert = require('assert');
const State = require('../lib/State');

const state = new State();

describe('state.setReplyTo function', function() {
  it('should set to the proper value', () => {
    state.setReplyTo('test');
    assert.equal(state.replyTo, 'test');
  });
});

describe('state.getReplyTo respond with correct value', function() {
  it('should be undefined if not passed anything', () => {
    assert.equal(state.getReplyTo(), 'test');
  });
});

describe('state.setResponseObject function', function() {
  it('should set to the proper value', () => {
    state.setResponseObject('test');
    assert.equal(state.responseObj, 'test');
  });
});

describe('state.getResponseObject respond with correct value', function() {
  it('should be undefined if not passed anything', () => {
    assert.equal(state.getResponseObject(), 'test');
  });
});

describe('state.setSessionId function', function() {
  it('should set to the proper value', () => {
    state.setSessionId('test');
    assert.equal(state.responseObj, 'test');
  });
});

describe('state.getSessionId respond with correct value', function() {
  it('should be undefined if not passed anything', () => {
    assert.equal(state.getSessionId(), 'test');
  });
});
