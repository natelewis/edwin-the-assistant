/* Edwin The Assistant

   Copyright 2017 Nate Lewis

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   dstributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   Base converstation handler for Edwin

 */

'use strict';
const Words = require('./words');
const Statement = require('./statement');
const fs = require('fs');
const IntentHandler = require('./intentHandler');
const ConversationHandler = require('./conversationHandler');
const AnnotationHandler = require('./annotationHandler');
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

Edwin.prototype._replyWithWelcome = function (state, callback) {
    var greeting = [
        'What\'s up?',
        'Sup!',
        'Yo!',
        'Hey!'
    ];
    var randomNumber = Math.floor(Math.random() * greeting.length);
    state = {
        replyTo: state.replyTo,
        reply: greeting[randomNumber]
    };
    return callback(state);
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
            state = this._setupInitialState({}, rawInput, this.debug);
        }
    }

    // if we didn't get it from the invocation then lets blank it out
    // and give a welcome response. this should only happen on Google Home
    // or any device you can give an invocation without context
    if (typeof (state) === 'undefined') {
        return this._replyWithWelcome({}, callback);
    }

    // quit talking to edwin even if your in mid action
    if (rawInput.match(/^(quit|stop|done).*/i) && typeof (state.initialStatement) !== 'undefined') {
        state.final = 'No problem.';
        state.reply = undefined;
        return callback(state);
    }

    // new converstation - overwrite action state with a new one based on the new statementactionModule
    if (typeof (state.query) === 'undefined') {
        state = this._setupInitialState(state, rawInput, this.debug);
    }

    // Check what the action is and process it
    if (typeof (state.action) !== 'undefined') {
        // always set the fulfillment type to the action in
        // so we don't spam things during test scripts
        state.fulfillmentType = this.fulfillmentType;

        // set the new statement to the state and re-process
        state.statement = rawInput;

        // in case we want to know where we started
        state.initialStatement = rawInput;

        while (typeof (state.reply) === 'undefined' && typeof (state.final) === 'undefined') {
            // make sure exit is always reset before we start in case we switch context
            state.exit = undefined;

            // do the conversation logic
            state = this._processResponse(state, callback, this.debug);
        }
    } else {
        state = {
            reply: 'I don\'t undstand what your asking me.',
            replyTo: state.replyTo
        };
        return callback(state);
    }
    return state;
};

Edwin.prototype._processResponse = function (state, callback, debug) {
    if (typeof (state.currentContext) === 'undefined') {
        // try this one first
        var intentJSONFile = path.join(__dirname, '..', 'intent', state.action + '.json');

        // check if json version is present
        if (fs.existsSync(intentJSONFile)) {
            state = new IntentHandler(state, callback, jsonfile.readFileSync(intentJSONFile));

            // try this one first
            var annotationJSONFile = path.join(__dirname, '..', 'annotation', state.conversation + '.json');

            // get the annotationJSON and pass it into the handler
            var annotationJSON = {};
            if (fs.existsSync(annotationJSONFile)) {
                annotationJSON = jsonfile.readFileSync(annotationJSONFile);
            }
            state = new AnnotationHandler(state, callback, annotationJSON);
        }
    }

    // get the current context so if it changes we will rerun
    state.currentContext = state.context;

    // ty this one first
    var conversationJSONFile = path.join(__dirname, '..', 'conversation', state.conversation + '.json');

    // check if json version is present
    if (fs.existsSync(conversationJSONFile)) {
        return new ConversationHandler(state, callback, jsonfile.readFileSync(conversationJSONFile));
    }

    // if I didn't get a conversation... I am confused :(
    // process actionless statements
    var words = new Words(state.statement);

    // if there is only 1 word, lets respond with a greeting
    if (words.wordsLC.length < 2) {
        return this._replyWithWelcome(state, callback);
    }

    console.log('edwin: confused: action: ' + state.action);
    console.log('edwin: confused: context: ' + state.context);

    fs.appendFile('confused.log', words.tagged.toString() + '\n', (err) => {
        if (err) throw err;
        console.log('edwin: confused: ' + state.statement);
        console.log('edwin: confused: ' + words.tagged.toString());
    });

    // if we fell through without processing, return undef and give up
    state = {
        reply: 'Not sure I understand',
        replyTo: state.replyTo
    };

    return callback(state);
};

// process a new converstation
Edwin.prototype._setupInitialState = function (state, text, debug) {
    // See if we can figure out the right action
    var statement = new Statement(text);

    // if there isn't anything bail,  we are not an action
    if (typeof (statement.action) === 'undefined') {
        // this is what we know!
        this.debug && console.log('edwin: no action was found');
        state = {
            statement: text,
            replyTo: state.replyTo
        };
    } else {
        // this is what we know!
        this.debug && console.log('edwin: context: ' + statement.context);
        state = {
            action: statement.action.toLowerCase(),
            statement: text,
            context: statement.context,
            replyTo: state.replyTo
        };
    }

    return state;
};

module.exports = Edwin;
