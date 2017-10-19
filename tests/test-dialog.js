'use strict';

const assert = require('assert');

const Dialog = require('../lib/Dialog');
const State = require('../lib/State');

const state = new State();
const dialog = new Dialog();

describe('Dialog.startConversation()', function() {
  it('should set final if no session is set', function(done) {
    state.sessionId = undefined;

    dialog.startConversation(state, 'yo!').then((state) => {
      assert.notEqual(state.getFinal(), undefined);
      done();
    });
  });
});

describe('Dialog.respondIfEmptyStatement()', function() {
  it('should set final if empty statement is set', function() {
    state.reset();
    state.setStatement('');
    dialog.respondIfEmptyStatement(state);
    assert.notEqual(state.getFinal(), undefined);
  });
});

describe('Dialog.respondIfTrivialResponseRequired()', function() {
  it('should set final if one word trivial statement is set', function() {
    state.reset();
    state.setStatement('yo');
    dialog.respondIfTrivialResponseRequired(state);
    assert.notEqual(state.getFinal(), undefined);
  });
});
