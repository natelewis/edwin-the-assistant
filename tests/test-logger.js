const sinon = require('sinon');
const assert = require('assert');
const log = require('../lib/logger');


it('should log the correct state to console', () => {
  // spy on the log.state
  let spy = sinon.spy(console, 'log');

  log.state({final: 'done!'});
  assert(spy.calledWith({final: 'done!'}));

  log.statement('hello?');
  assert(spy.calledWith('    ', [['hello', 'UH'], ['?', '.']]));

  log.info({'yo': 'yo'});
  assert(spy.calledWith({'yo': 'yo'}));

  log.step({'id': 'step'});
  assert(spy.calledWith({'id': 'step'}));

  // restore the original function
  spy.restore();
});
