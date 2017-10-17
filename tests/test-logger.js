const sinon = require('sinon');
const assert = require('assert');
const mute = require('mute');

const log = require('../lib/logger');

let sandbox;
beforeEach(function() {
  sandbox = sinon.sandbox.create();
});

afterEach(function() {
  sandbox.restore();
});

describe('Logger output', function() {
  it('should log the correct state to console', () => {
    let unmute = mute(process.stdout);
    let spy = sandbox.spy(console, 'log');
    log.state({final: 'done!'});
    spy.restore();
    unmute();
    assert(spy.calledWith({final: 'done!'}));
  });

  it('should log the correct statement to console', () => {
    let unmute = mute(process.stdout);
    let spy = sandbox.spy(console, 'log');
    log.statement('hello?');
    spy.restore();
    unmute();
    assert(spy.calledWith([['hello', 'UH'], ['?', '.']]));
  });

  it('should log the correct info to console', () => {
    let unmute = mute(process.stdout);
    let spy = sandbox.spy(console, 'log');
    log.info({'yo': 'yo'});
    spy.restore();
    unmute();
    assert(spy.calledWith({'yo': 'yo'}));
  });

  it('should log the correct step to console', () => {
    let unmute = mute(process.stdout);
    let spy = sandbox.spy(console, 'log');
    log.step({'id': 'step'});
    spy.restore();
    unmute();
    assert(spy.calledWith({'id': 'step'}));
  });
});
