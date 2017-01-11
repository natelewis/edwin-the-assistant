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

   Base converstation handler for Edwin

 */

'use strict';
const Words = require('./words');
const Statement = require('./statement');
const load = require('./load');
const fs = require('fs');
const IntentHandler = require('./intentHandler');
const jsonfile = require('jsonfile');
const path = require('path');

function Edwin (options) {
    this.debug = false;
    this.fulfillmentType = 'production';
    if (typeof (options) !== 'undefined') {
        if (typeof (options.debug) !== 'undefined') {
            this.debug = options.debug;
        }
        if (typeof (options.fulfillmentType) !== 'undefined') {
            this.fulfillmentType = options.fulfillmentType;
        }
    }
}

Edwin.prototype._welcomeResponse = function () {
    var greeting = [
        'What\'s up?',
        'Sup!',
        'Yo!',
        'Hey!'
    ];
    var randomNumber = Math.floor(Math.random() * greeting.length);
    return greeting[randomNumber];
};

// converse engine
Edwin.prototype.converse = function (state, rawInput, callback) {
    // make sure reply/final is undef so we can set it later
    if (typeof (state) !== 'undefined') {
        state.final = undefined;
        state.reply = undefined;
    }

    // ensure we have a state, if not lets make one
    if (typeof (state) === 'undefined' && typeof (rawInput) !== 'undefined') {
        // if we were passed something during invocation lets process it like the first sentence
        if (rawInput.split(' ').length > 0) {
            state = this._process({}, rawInput, this.debug);
        }
    }

    // if we didn't get it from the invocation then lets blank it out
    // and give a welcome response
    if (typeof (state) === 'undefined') {
        state = {};
        state.reply = this._welcomeResponse();
        return callback(state);
    }

    // quit talking to edwin even if your in mid action
    if (rawInput.match(/^(quit|stop|done).*/i)) {
        state.final = 'No problem.';
        state.reply = undefined;
    }

    // if we fell through without processing, return undef and give up

    // if there a query, we have a topic that is being addressed
    // if there isn't a query, its a new intent
    if (typeof (state.query) !== 'undefined') {
        // set the new statement to the state and re-process
        state.statement = rawInput;
        // if we have an action map end it off to the action handler
        var actionHandler = load.action(state.module, this.debug);
        if (typeof (actionHandler) !== 'undefined') {
            return actionHandler.run(state, callback, this.debug);
        }

        // if we are here things didn't work out
        return callback(state);
    } else {
        // new converstation - overwrite action state with a new one based on the new statementactionModule
        state = this._process(state, rawInput, this.debug);
    }

    if (typeof (state) !== 'undefined') {
        // always set the fulfillment type to the action in
        // so we don't spam things during test scripts
        state.fulfillmentType = this.fulfillmentType;

        // try this one first
        var intentJSONFile = path.join(__dirname, '..', 'intent', state.action + '.json');

        // check if json version is present
        if (fs.existsSync(intentJSONFile)) {
            return new IntentHandler(state, callback, jsonfile.readFileSync(intentJSONFile));
        }

        // run the intent as a module if it has one
        var intentModuleHandler = load.intent(state.action, state.context, this.debug);
        if (typeof (intentModuleHandler) !== 'undefined') {
            // pass on the callback to process
            return intentModuleHandler.process(state, callback, this.debug);
        }
    }

    // if we fell through without processing, return undef and give up
    state = {
        reply: 'Not sure I understand',
        replyTo: state.replyTo
    };

    var words = new Words(rawInput);
    fs.appendFile('confused.log', words.tagged.toString() + '\n', (err) => {
        if (err) throw err;
        console.log('edwin: confused: ' + rawInput);
    });

    return callback(state);
};

// process a new converstation
Edwin.prototype._process = function (state, text, debug) {
    // See if we can figure out the right action

    var statement = new Statement(text);

    // if there isn't anything bail,  we are not an action
    if (typeof (statement.action) === 'undefined') {
        this.debug && console.log('edwin: ACTIONS END: no valid actions found');
        return undefined;
    }

    // this is what we know!
    state = {
        action: statement.action.toLowerCase(),
        statement: text,
        context: statement.context,
        replyTo: state.replyTo
    };

    this.debug && console.log('edwin: context: ' + statement.context);

    return state;
};

module.exports = Edwin;
