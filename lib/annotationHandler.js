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

   Annotation handler that processes a topic

 */

'use strict';

const Groom = require('./groom');
const Words = require('./words');
const Statement = require('./statement');
const path = require('path');
const fs = require('fs');
const jsonfile = require('jsonfile');

/**
 * [AnnotationHandler description]
 * @param       {[type]}   state                 [description]
 * @param       {Function} callback              [description]
 * @param       {Object}   [handler={annotation: []}]          [description]
 * @constructor
 */
function AnnotationHandler(state, callback) {
  this.debug = false;
  this.state = state;
  this.callback = callback;

  // start of with reply undefined
  this.state.reply = undefined;

  // ty this one first
  let topicJSONFile = path.join(
    __dirname,
    '..',
    'data',
    'topics',
    this.state.topic + '.json'
  );

  // check if json version is present
  if (fs.existsSync(topicJSONFile)) {
    this.annotation = jsonfile.readFileSync(topicJSONFile).annotation;
  }

  // make sure anotation is a thing
  if ( typeof(this.annotation) === 'undefined' ) {
    this.annotation = {};
  }

  // process the intent
  return this._processHandler();
}

// get the logical conversation and its context of the statement
AnnotationHandler.prototype._processHandler = function() {
  let annotation = this.annotation;

  // if annotation is present and we are being
  // called without a query ( for the first time )
  // then process annotation to see if we can discover some field values
  if (typeof(this.state.query) === 'undefined') {
    const words = new Words(this.state.statement);

    for (let a = 0; a < annotation.length; a++) {
      let rule = annotation[a];

      // substitution can be in start words and such
      let startWordStatement = new Statement(rule.startWord);
      rule.startWord = startWordStatement.replaceFields(this.state);

      if (this.state[rule.field] === undefined && rule.startWord !== '') {
        // Process Next Word Of Type
        if (rule.type === 'nextWordOfType') {
          if (typeof(this.state[rule.field]) === 'undefined') {
            this.state[rule.field] = words.getNextWordOfTypeAfterWord(
              rule.startWord,
              rule.wordType,
              this.debug
            );
          }
        }

        // Process everythingAfterWord
        if (rule.type === 'everythingAfterWord') {
          if (typeof(this.state[rule.field]) === 'undefined') {
            this.state[rule.field] = words.getEverythingAfterWord(
              rule.startWord
            );
          }
        }

        // groom if needed
        let groomer = new Groom(this.state[rule.field]);
        this.state[rule.field] = groomer.processStatement(rule.groom);
      }
    }
  }
  return this.state;
};

module.exports = AnnotationHandler;
