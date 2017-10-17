const assert = require('assert');
const Statement = require('../lib/Statement');

describe('Statement object', function() {
  it('should be an empty string if not passed some words', () => {
    const statement = new Statement();
    assert.equal(statement.text, '');
  });
});
