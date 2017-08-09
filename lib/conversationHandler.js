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

   Conversation handler that processes a conversation

 */

'use strict';

const Groom = require('./groom');
const load = require('./load');

function ConversationHandler (state, callback, handler) {
    this.debug = false;
    this.state = state;
    this.callback = callback;
    this.handler = handler;

    // start of with reply undefined
    this.state.reply = undefined;

    // process the intent
    return this._processHandler();
}

// get the logical conversation and its context of the statement
ConversationHandler.prototype._processHandler = function () {
    let steps = this.handler.steps;

    // set all the incoming query response and groom them :)s
    for (let stepCount = 0; stepCount < steps.length; stepCount++) {
        if (this.state.query === steps[stepCount].query) {
            let groomer = new Groom(this.state.statement);
            this.state[steps[stepCount].query]
              = groomer.processStatement(steps[stepCount].groom);
        }
    }

    // step through each step doing what we can to change the fields
    // and shape the reply
    for (let i = 0; i < steps.length; i++) {
        let step = steps[i];

        // if the conditional requirements pass process this step
        if (testConditional(step.requirement, this.state)) {
            let query = step.query;
            let reply;
            if (typeof (step.reply) !== 'undefined') {
                let randomReplyIndex = Math.floor(Math.random() * step.reply.length);
                reply = step.reply[randomReplyIndex];
            }

            // if this is a module run that
            if (typeof (step.module) !== 'undefined' && step.module !== '') {
                let moduleHandler = load.module(step.module, this.debug);
                this.debug && console.log('conversationHander: Loading module ' + step.module);
                if (typeof (moduleHandler) !== 'undefined') {
                    this.state = moduleHandler.run(this.state, step.config, this.callback, this.debug);
                }
            }

            // if a module did a callback, lets exit here
            if (typeof (this.state.exit) !== 'undefined' || typeof (this.state.reply) !== 'undefined' || typeof (this.state.final) !== 'undefined') {
                return this.state;
            }

            // Do a reply -- set it, and it will be caught on next loop and callback'ed?
            if (typeof (query) !== 'undefined' && query !== '') {
                this.state.query = query;
                if (this.state.query === 'final') {
                    this.state.final = replaceFields(reply, this.state);
                }
                this.state.reply = replaceFields(reply, this.state);
                return this.callback(this.state);
            }
        }
    }

    return this.state;
};

// replace [some vars] with [the real thing]
function replaceFields (statement, state) {
    let swapVarRegex = new RegExp(/\[(.*?)]/g);
    let result;
    let replacedReply = statement;
    while ((result = swapVarRegex.exec(statement)) !== null) {
        replacedReply = replacedReply.replace(result[0], state[result[1]]);
    }
    return replacedReply;
}

//  through each one to see if we failed anything
function testConditional (requirement, state) {
    if (typeof (requirement) !== 'undefined') {
        for (let x = 0; x < requirement.length; x++) {
            let cond = requirement[x];

            this.debug && console.log(cond.type + '  ' + cond.field + '  ' + cond.operator + '  ' + cond.value);
            if (cond.type === 'typeof') {
                if (cond.operator === '!==') {
                    if (typeof (state[cond.field]) === cond.value) {
                        return false;
                    }
                }
                if (cond.operator === '===') {
                    if (typeof (state[cond.field]) !== cond.value) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

module.exports = ConversationHandler;
