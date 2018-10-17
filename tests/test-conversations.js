'use strict';

const fs = require('fs');
const sinon = require('sinon');
const assert = require('assert');
const mute = require('mute');

const test = require('../lib/test');
const testDir = './data/tests';

const testRule = {
  in: {
    replyTo: 'test',
  },
  flow: ['quit'],
  context: undefined,
  intent: undefined,
  payload: undefined,
  topic: undefined,
  debug: true,
};

let sandbox;
beforeEach(() => {
  sandbox = sinon.sandbox.create();
});

afterEach(() => {
  sandbox.restore();
});

const files = fs.readdirSync(testDir);
files.forEach((file) => {
  const json = fs.readFileSync(testDir + '/' + file, 'utf-8');
  const testObj = JSON.parse(json.toString());
  testObj.conversations.forEach((rules) => {
    test.conversation(rules);
  });
});

describe('Test one word, one step conversation in debug mode', () => {
  it('should have user quit in output', function(done) {
    const unmute = mute(process.stdout);
    const spy = sandbox.spy(console, 'log');
    test.processStatement('Debug Mode', testRule, function(state) {
      assert(spy.calledWith('* USER : quit'));
      unmute();
      spy.restore();
      done();
    });
  });
});

describe('Test two step conversation in debug mode', () => {
  it('should have user quit in output', function(done) {
    const unmute = mute(process.stdout);
    const spy = sandbox.spy(console, 'log');
    testRule.flow = ['how are you', 'quit'];
    test.processStatement('Debug Mode', testRule, function(state) {
      assert(spy.calledWith('* USER : quit'));
      unmute();
      spy.restore();
      done();
    });
  });
});
