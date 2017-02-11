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

   Annotation handler that processes a conversation

 */

const jsonfile = require('jsonfile');
const path = require('path');
const Groom = require('./groom');
const Words = require('./words');
const ConversationHandler = require('./conversationHandler');

function AnnotationHandler (state, callback, handler) {
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
AnnotationHandler.prototype._processHandler = function () {
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
                var groomer = new Groom(this.state[rule.field]);
                this.state[rule.field] = groomer.processStatement(rule.groom);
            }
        }
    }

    // process the conversation if there is anything else to know after annotation
    var conversationJSONFile = path.join(__dirname, '..', 'conversation', this.state.conversation + '.json');
    
    // once we have done all we can annotate, start the conversation and return
    // a response
    return new ConversationHandler(this.state, this.callback, jsonfile.readFileSync(conversationJSONFile));
};

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

module.exports = AnnotationHandler;
