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

const Edwin = require('../lib/Edwin');
const log = require('../lib/logger');

const Test = function() {
  // shorthand helper for test assert description
  const testExplained = (field, value) => {
    return `-- Should have ${field} of "${value}"`;
  };

  const processStatement = function(sessionId, testPlan, callback) {
    const debug = testPlan.debug;
    // each statement is shifted from the flow until they are all gone
    if (testPlan.flow && testPlan.flow.length > 0) {
      const statement = testPlan.flow.shift();

      testPlan.in.replyTo = 'testing';
      testPlan.debug && log.statement(statement);

      debug && console.log('\n' + Array(46).join('='));
      if (typeof testPlan.in.reply !== 'undefined') {
        debug && console.log('* EDWIN : ' + testPlan.in.reply);
        debug && console.log(Array(46).join('='));
      }
      debug && console.log('* USER : ' + statement);
      debug && console.log(Array(46).join('='));

      let edwin = new Edwin({
        sessionId: sessionId,
        callback: function(state) {
          testPlan.in = state;
          debug && log.state(state);
          return processStatement(sessionId, testPlan, callback);
        },
      });
      edwin.fulfillmentType = 'dry-run';

      // pass the results back into the in obj via the test callback
      edwin.converse(statement);
    } else {
      return callback(testPlan.in);
    }
  };

  const conversation = function(testPlan) {
    // our vars that will float through the convo
    testPlan.in = {
      replyTo: 'testing',
    };

    let title = 'Conversation';
    testPlan.flow.forEach(function(statement) {
      // build the flow text for the vows topic
      title += ' -> ' + statement;
    });

    describe(title, function() {
      it('-- Should have a defined final response', function(done) {
        processStatement(title, testPlan, function(state) {
          assert.notEqual(state.final, undefined);
          done();
        });
      });

      it(testExplained('intent', testPlan.intent), function(done) {
        processStatement(title, testPlan, function(state) {
          assert.equal(state.intent, testPlan.intent);
          done();
        });
      });

      it(testExplained('topic', testPlan.topic), function(done) {
        processStatement(title, testPlan, function(state) {
          assert.equal(state.topic, testPlan.topic);
          done();
        });
      });

      it(testExplained('context', testPlan.context), function(done) {
        processStatement(title, testPlan, function(state) {
          assert.equal(state.context, testPlan.context);
          done();
        });
      });

      it(testExplained('payload', testPlan.payload), function(done) {
        processStatement(title, testPlan, function(state) {
          assert.equal(state.fields.payload, testPlan.payload);
          done();
        });
      });
    });
  };

  return {
    processStatement: processStatement,
    conversation: conversation,
  };
}();

module.exports = Test;
