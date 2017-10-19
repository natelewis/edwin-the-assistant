'use strict';

const assert = require('assert');

const Groom = require('../lib/Groom');

describe('Groom.confirmToTrue', function() {
  it('should be an undefined if the intent is not real', () => {
    const groom = new Groom('no');
    assert.equal(groom.confirmToTrue(), 'false');
  });
});
