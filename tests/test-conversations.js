'use strict';

const fs = require('fs');
const sinon = require('sinon');
const assert = require('assert');
const mute = require('mute');

const test = require('./test');
const testDir = './data/tests';

const testRule = {
  in: {
    replyTo: 'test',
  },
  flow: ['hello how are you', 'quit'],
  context: undefined,
  intent: undefined,
  payload: undefined,
  topic: undefined,
  debug: true,
};

let sandbox;
beforeEach(function() {
  sandbox = sinon.sandbox.create();
});

afterEach(function() {
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

describe('Test conversation in debug mode', function() {
  it('should have user quit in output', function(done) {
    let unmute = mute(process.stdout);
    let spy = sinon.spy(console, 'log');
    test.processStatement('Debug Mode', testRule, function(state) {
      assert(spy.calledWith('* USER : quit'));
      unmute();
      spy.restore();
      done();
    });
  });
});
