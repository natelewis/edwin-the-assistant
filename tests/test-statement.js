'use strict';

const assert = require('assert');
const sinon = require('sinon');
const mute = require('mute');

const Statement = require('../lib/Statement');

let sandbox;
beforeEach(() => {
  sandbox = sinon.sandbox.create();
});

afterEach(() => {
  sandbox.restore();
});

describe('Statement object', () => {
  it('should be an empty string if not passed some words', () => {
    const statement = new Statement();
    assert.equal(statement.text, '');
  });
});

describe('Statement.logContextDebug()', () => {
  it('should log something to console in debug mode', () => {
    const unmute = mute(process.stdout);
    const spy = sandbox.spy(console, 'log');
    const statement = new Statement('', true);
    statement.logContextDebug('something');
    unmute();
    assert(spy.called);
    spy.restore();
  });
});


describe('Statement.getEverythingAfterWord()', () => {
  it('should return undefined if no start word is given', () => {
    const statement = new Statement('', false);
    assert.equal(statement.getEverythingAfterWord(), undefined);
  });
});

describe('Statement.getNextWordOfTypeAfterWord()', () => {
  it('should log something to console in debug mode', () => {
    const unmute = mute(process.stdout);
    const spy = sandbox.spy(console, 'log');
    const statement = new Statement('one two three four five', true);
    statement.getNextWordOfTypeAfterWord('three', 'NN');
    unmute();
    assert(spy.called);
    spy.restore();
  });
});

describe('Statement.getNextWordOfTypeAfterWord()', () => {
  it('should log "found undefined" to console in debug mode', () => {
    const unmute = mute(process.stdout);
    const spy = sandbox.spy(console, 'log');
    const statement = new Statement('one two three four five', true);
    statement.getNextWordOfTypeAfterWord('noway', 'VB');
    unmute();
    assert(spy.calledWith('getNextWordOfTypeAfterWord: found undefined'));
    spy.restore();
  });
});

describe('Statement.logIntentDebug()', () => {
  it('should log something to console in debug mode', () => {
    const unmute = mute(process.stdout);
    const spy = sandbox.spy(console, 'log');
    const statement = new Statement('', true);
    statement.logIntentDebug('something');
    unmute();
    assert(spy.called);
    spy.restore();
  });
});
