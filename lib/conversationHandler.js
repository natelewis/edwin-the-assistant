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

const Groom = require('./groom');
const Words = require('./words');
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
    var steps = this.handler.steps;
    var annotation = this.handler.annotation;

    // if annotation is present and we are being called without a query ( for the first time )
    // then process annotation to see if we can discover some field values
    if (typeof (annotation) !== 'undefined' && typeof (this.state.query) === 'undefined') {
        const words = new Words(this.state.statement);

        for (var a = 0; a < annotation.length; a++) {
            var rule = annotation[a];

            if (testConditional(rule.requirement, this.state)) {
                // substitution can be in start words and such
                rule.startWord = replaceFields(rule.startWord, this.state);

                // Process Next Word Of Type
                if (rule.type === 'nextWordOfType') {
                    if (typeof (this.state[rule.field]) === 'undefined') {
                        this.state[rule.field] = words.getNextWordOfTypeAfterWord(
                            rule.startWord,
                            rule.wordType,
                            this.debug
                        );
                    }
                }

                // Process everythingAfterWord
                if (rule.type === 'everythingAfterWord') {
                    if (typeof (this.state[rule.field]) === 'undefined') {
                        this.state[rule.field] = words.getEverythingAfterWord(rule.startWord);
                    }
                }

                // groom if needed
                this.state[rule.field] = groomStatement(this.state[rule.field], rule.groom);
            }
        }
    }

    // step through each step doing what we can to change the fields
    // and shape the reply
    for (var i = 0; i < steps.length; i++) {
        var step = steps[i];

        // if we find what we are looking for bail
        if (typeof (this.state.reply) !== 'undefined' || typeof (this.state.final) !== 'undefined') {
            return this.state;
        }

        // if the conditional requirements pass process this step
        if (testConditional(step.requirement, this.state)) {
            if (typeof (step.module) !== 'undefined') {
                var moduleHandler = load.module(step.module, this.debug);
                this.debug && console.log('conversationHander: Loading module ' + step.module);
                if (typeof (moduleHandler) !== 'undefined') {
                    this.state = moduleHandler.run(this.state, step.config, this.debug);
                }

                // skip to next one if we ran a module
                continue;
            }

            var randomReplyIndex = Math.floor(Math.random() * step.reply.length);
            var query = step.query;
            var reply = step.reply[randomReplyIndex];

            // groom if needed
            if (this.state.query === query) {
                this.state[query] = groomStatement(this.state.statement, step.groom);
            }

            // I do't have something to describe
            if (typeof (query) !== 'undefined' && typeof (this.state[query]) === 'undefined') {
                this.state.query = query;
                this.state.reply = replaceFields(reply, this.state);
            }
        }
    }

    return this.state;
};

function groomStatement (content, groomType) {
    // go through each one and groom it, if not return it back
    if (typeof (groomType) !== 'undefined') {
        if (groomType === 'messagePayload') {
            var groomer = new Groom(content);
            return groomer.messagePayload();
        }
    }

    return content;
}

// replace [some vars] with [the real thing]
function replaceFields (statement, state) {
    var swapVarRegex = new RegExp(/\[(.*?)]/g);
    var result;
    var replacedReply = statement;
    while ((result = swapVarRegex.exec(statement)) !== null) {
        replacedReply = replacedReply.replace(result[0], state[result[1]]);
    }
    return replacedReply;
}

//  through each one to see if we failed anything
function testConditional (requirement, state) {
    for (var x = 0; x < requirement.length; x++) {
        var cond = requirement[x];

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
    return true;
}

module.exports = ConversationHandler;