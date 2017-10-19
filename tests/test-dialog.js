'use strict';

const assert = require('assert');
const mute = require('mute');
const sinon = require('sinon');

const Dialog = require('../lib/Dialog');
const State = require('../lib/State');

let sandbox;
beforeEach(function() {
  sandbox = sinon.sandbox.create();
});

afterEach(function() {
  sandbox.restore();
});

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

describe('Dialog.setInitialIntent()', function() {
  it('should not set intent if implied intent is undefined', function() {
    state.reset();
    state.setStatement('');
    dialog.setInitialIntent(state);
    assert.equal(state.intent, undefined);
  });
});

describe('Dialog.setInitialImpliedContext()', function() {
  it('should not set context if implied intent is undefined', function() {
    state.reset();
    state.setStatement('');
    dialog.setInitialImpliedContext(state);
    assert.equal(state.context, undefined);
  });
});

describe('Dialog.processStep()', function() {
  it('should set final if a module is not real', function() {
    state.reset();
    state.setStatement('who buddy');
    dialog.processStep([{module: 'notAThing'}], state);
    assert.notEqual(state.getFinal(), undefined);
  });
});

describe('Dialog.respondIfInvalidIntent()', function() {
  it('should respond with final if intent is invalid', function() {
    state.reset();
    dialog.respondIfInvalidIntent(state);
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

describe('Dialog.loadModule', function() {
  it('should throw error on module that has errors in it', () => {
    assert.throws(function() {
      dialog.loadModule('../../LICENSE');
    }, Error);
  });

  it('should log not found if the module is missing in debug mode', () => {
    const debugDialog = new Dialog({debug: true});
    const unmute = mute(process.stdout);
    const spy = sandbox.spy(console, 'log');
    debugDialog.loadModule('asdf');
    unmute();
    assert(spy.called);
    spy.restore();
  });
});
