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

// respond to callback we don't use it, we just return it for testing
var testRespondCallback = function (state) {
    return state;
};

module.exports = {

    // assert the statement chain with no fulfillment
    assertStatement: function (testPlan) {
        var edwin = new Edwin();

        // set it fulfillment to testPlan so we don't spam texts or emails or other services
        edwin.fulfillmentType = 'dry-run';

        if (testPlan.debug) {
            const statement = new Statement(testPlan.flow[0]);
            console.log('*************************************************************************');
            console.log('=========================================================================');
            console.log('* USER INVOCATION : ' + testPlan.flow[0]);
            console.log('=========================================================================');
            console.log('* ACTION: ' + statement.action);
            console.log('* CONTEXT: ' + statement.context);
            console.log('================= plan ==================================================');
            console.log('test: testPlan:');
            console.log(testPlan);
        }

        // our vars that will float through the convo
        testPlan.in = {replyTo: 'testing'};
        var flowText;
        // var out = {};

        // go through each part of the flow until we run out of response statements
        testPlan.flow.forEach(function (statement) {
            // each statement is incomming
            testPlan.in.statement = statement;
            testPlan.in.replyTo = 'testing';
            testPlan.debug && console.log('test: statement tagged:');
            testPlan.debug && console.log(new Words(statement).tagged);

            // build the flow tet for the vows topic
            flowText += ' -> ' + testPlan.in.statement;

            if (testPlan.debug) {
                console.log('\n=========================================================================');
                if (typeof testPlan.in.reply !== 'undefined') {
                    console.log('* EDWIN : ' + testPlan.in.reply);
                    console.log('=========================================================================');
                }
                console.log('* USER : ' + testPlan.in.statement);
                console.log('=========================================================================');
            }

            // pass the results back into the in obj via the test callback
            testPlan.in = edwin.converse(testPlan.in, testPlan.in.statement, testRespondCallback);
        });

        return {
            ['Flow: ' + flowText + ' *']: {
                topic: testPlan.in,
                'The final reply should not be undefined': function (topic) {
                    assert.notEqual(topic.final, undefined);
                },
                ['The action should be "' + testPlan.action + '"']: function (topic) {
                    assert.equal(topic.action, testPlan.action);
                },
                ['The context should be "' + testPlan.context + '"']: function (topic) {
                    assert.equal(topic.context, testPlan.context);
                },
                ['the payload should be "' + testPlan.payload + '"']: function (topic) {
                    assert.equal(topic.payload, testPlan.payload);
                }
            }
        };
    }
};
