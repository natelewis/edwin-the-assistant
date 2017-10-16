const sinon = require('sinon');
const assert = require('assert');
const log = require('../lib/logger');


it('should log the correct state to console', () => {
  let spy = sinon.spy(console, 'log');
  log.state({final: 'done!'});
  assert(spy.calledWith({final: 'done!'}));
  spy.restore();
});

it('should log the correct statement to console', () => {
  let spy = sinon.spy(console, 'log');
  log.statement('hello?');
  assert(spy.calledWith('    ', [['hello', 'UH'], ['?', '.']]));
  spy.restore();
});

it('should log the correct info to console', () => {
  let spy = sinon.spy(console, 'log');
  log.info({'yo': 'yo'});
  assert(spy.calledWith({'yo': 'yo'}));
  spy.restore();
});

it('should log the correct step to console', () => {
  let spy = sinon.spy(console, 'log');
  log.step({'id': 'step'});
  assert(spy.calledWith({'id': 'step'}));
  spy.restore();
});

