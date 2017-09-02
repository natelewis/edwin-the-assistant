/* Edwin The Assistant

   Copyright 2017 Nate Lewis

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   Test wrappers for unit testing

 */

'use strict';

const assert = require('assert');
const Words = require('./words');
const Statement = require('./statement');
const Edwin = require('./edwin');

let processStatement = function(testPlan, vowsCallback) {
  let debug = testPlan.debug;
  // each statement is shifted from the flow until they are all gone
  if (testPlan.flow && testPlan.flow.length > 0) {
    testPlan.in.statement = testPlan.flow.shift();
    testPlan.in.replyTo = 'testing';
    testPlan.debug && console.log('test: statement tagged:');
    testPlan.debug && console.log(new Words(testPlan.in.statement).tagged);


    debug && console.log('\n' + Array(46).join('='));
    if (typeof testPlan.in.reply !== 'undefined') {
      debug && console.log('* EDWIN : ' + testPlan.in.reply);
      debug && console.log(Array(46).join('='));
    }
    debug && console.log('* USER : ' + testPlan.in.statement);
    debug && console.log(Array(46).join('='));


    // pass the results back into the in obj via the test callback
    testPlan.edwin.converse(
      testPlan.in,
      testPlan.in.statement,
      function(state) {
        testPlan.in = state;
        debug && console.log(state);
        return processStatement(testPlan, vowsCallback);
      }
    );
  } else {
    debug && console.log('\n' + Array(46).join('='));
    debug && console.log('* FINAL :');
    debug && console.log(testPlan.in);
    debug && console.log(Array(46).join('='));
    return vowsCallback(null, testPlan.in);
  }
};

module.exports = {

  // assert the statement chain with no fulfillment
  assertStatement: function(testPlan) {
    let debug = testPlan.debug;
    let edwin = new Edwin();

    // set it fulfillment to testPlan so we don't
    // spam texts or emails or other services
    edwin.fulfillmentType = 'dry-run';

    const statement = new Statement(testPlan.flow[0]);
    debug && console.log(Array(46).join('*'));
    debug && console.log(Array(46).join('-'));
    debug && console.log('* USER INVOCATION : ' + testPlan.flow[0]);
    debug && console.log(Array(46).join('-'));
    debug && console.log('* ACTION: ' + statement.action);
    debug && console.log('* CONTEXT: ' + statement.context);
    debug && console.log(Array(20).join('-') + ' plan ' + Array(20).join('-'));
    debug && console.log('test: testPlan:');
    debug && console.log(testPlan);



    // our vars that will float through the convo
    testPlan.in = {
      replyTo: 'testing',
      session: 'testing',
    };

    testPlan.edwin = edwin;
    //let flowText;
    // var out = {};
    //
    //testPlan = processStatement(testPlan);
    let title = 'Converstation';
    testPlan.flow.forEach(function(statement) {
      // build the flow text for the vows topic
      title += ' -> ' + statement;
    });

    return {
      [title]: {
        'topic': function() {
          processStatement(testPlan, this.callback);
        },
        'The final reply should not be undefined': function(state) {
          // console.log(state);
          assert.notEqual(state.final, undefined);
        },
        ['The action should be "' + testPlan.action + '"']: function(state) {
          assert.equal(state.action, testPlan.action);
        },
        ['The context should be "' + testPlan.context + '"']: function(state) {
          assert.equal(state.context, testPlan.context);
        },
        ['the payload should be "' + testPlan.payload + '"']: function(state) {
          assert.equal(state.payload, testPlan.payload);
        },
      },
    };
  },
};
