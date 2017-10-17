const assert = require('assert');
const Intent = require('../lib/Intent');

describe('Intent.get', function() {
  it('should be an undefined if the intent is not real', () => {
    const intent = new Intent('asdfasdf');
    assert.equal(intent.intentObj, undefined);
  });
});
