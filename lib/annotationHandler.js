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

'use strict';

const Groom = require('./groom');
const Words = require('./words');
const Conditional = require('./conditional');
const Statement = require('./statement');

function AnnotationHandler(state, callback, handler) {
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
AnnotationHandler.prototype._processHandler = function() {
  var annotation = this.handler.annotation;

  // if annotation is present and we are being
  // called without a query ( for the first time )
  // then process annotation to see if we can discover some field values
  if (typeof(annotation) !== 'undefined' && typeof(this.state.query) === 'undefined') {
    const words = new Words(this.state.statement);

    for (let a = 0; a < annotation.length; a++) {
      let rule = annotation[a];

      let conditional = new Conditional(this.state);
      if (conditional.passes(rule.requirement)) {
        // substitution can be in start words and such
        let startWordStatement = new Statement(rule.startWord);
        rule.startWord = startWordStatement.replaceFields(this.state);

        // Process Next Word Of Type
        if (rule.type === 'nextWordOfType') {
          if (typeof(this.state[rule.field]) === 'undefined') {
            this.state[rule.field] = words.getNextWordOfTypeAfterWord(rule.startWord, rule.wordType, this.debug);
          }
        }

        // Process everythingAfterWord
        if (rule.type === 'everythingAfterWord') {
          if (typeof(this.state[rule.field]) === 'undefined') {
            this.state[rule.field] = words.getEverythingAfterWord(rule.startWord);
          }
        }

        // groom if needed
        var groomer = new Groom(this.state[rule.field]);
        this.state[rule.field] = groomer.processStatement(rule.groom);
      }
    }
  }
  return this.state;
};

module.exports = AnnotationHandler;
