/*  Edwin The Assistant

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

   Intent handler that matches action and context to an action

 */

'use strict';
const load = require('./load');
const fs = require('fs');
const jsonfile = require('jsonfile');
const path = require('path');
const ConversationHandler = require('./conversationHandler');

function IntentHandler (state, callback, intent) {
    this.debug = false;
    this.state = state;
    this.callback = callback;
    this.intent = intent;

    // process the intent
    return this._processIntent();
}

// get the logical action and its context of the statement
IntentHandler.prototype._processIntent = function () {
    // set original context in case we reduce and want access to it
    if (typeof (this.state.originalContext) === 'undefined') {
        this.state.originalContext = this.state.context;

        // reduce the context if we can
        var contextModifiers = this.intent.contextModifiers;
        for (var contextKey in contextModifiers) {
            var modifier = contextModifiers[contextKey];
            if (modifier.type === 'map') {
                if (this.state.context === modifier.context || modifier.context === '*') {
                    this.state.context = modifier.target;
                }
            }
        }

        // see if we have an action that maps to context
        var conversationMap = this.intent.conversationMap;
        for (var moduleKey in conversationMap) {
            var intent = conversationMap[moduleKey];
            if (this.state.context === intent.context) {
                this.state.conversation = intent.conversation;
            }
        }
    }
        // try this one first
    var conversationJSONFile = path.join(__dirname, '..', 'conversation', this.state.conversation + '.json');

        // check if json version is present
    if (fs.existsSync(conversationJSONFile)) {
        return new ConversationHandler(this.state, this.callback, jsonfile.readFileSync(conversationJSONFile));
    }

    // if we have an action map end it off to the action handler
    var actionHandler = load.action(this.state.conversation, this.debug);
    if (typeof (actionHandler) !== 'undefined') {
        return actionHandler.run(this.state, this.callback, this.debug);
    }

    // if we are here things didn't work out
    this.state.final = this.intent.failReply;
    return this.callback(this.state);
};

module.exports = IntentHandler;
