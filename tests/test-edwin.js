'use strict';

const assert = require('assert');
const sinon = require('sinon');
const mute = require('mute');

const Edwin = require('../lib/Edwin');
const State = require('../lib/State');

describe('Edwin object', function() {
  it('should set responseObject when passed in', () => {
    const state = new State();
    new Edwin({responseObject: 'a thing'});
    assert.equal(state.getResponseObject(), 'a thing');
  });

  it('should set responseObject with an active conversation', () => {
    const state = new State();
    state.intent='adsf';
    state.topic='adsf';
    const edwin = new Edwin({responseObject: 'a thing'});
    edwin.converse('describe this');
    assert.equal(state.getResponseObject(), 'a thing');
  });
});


describe('Edwin.converse()', function() {
  it('should display error to console if promise chain is broken', (done) => {
    const edwin = new Edwin({responseObject: 'a thing'});
    edwin.callback = function() {
      return new Promise((resolve, reject) => {
        reject('rejected!');
      });
    };
    const unmute = mute(process.stdout);
    const sandbox = sinon.sandbox.create();
    const spy = sandbox.spy(console, 'log');
    edwin.converse('').then(() => {
      unmute();
      assert(spy.calledWith('rejected!'));
      spy.restore();
      sandbox.restore();
      done();
    });
  });
});
