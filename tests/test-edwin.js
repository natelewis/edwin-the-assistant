const assert = require('assert');
const Edwin = require('../lib/Edwin');
const State = require('../lib/State');

describe('Edwin object', function() {
  it('should set responseObject when passed in', () => {
    const state = new State();
    new Edwin({responseObject: 'a thing'});
    assert.equal(state.getResponseObject(), 'a thing');
  });
});
