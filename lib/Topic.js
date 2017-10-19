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

   Topic of a conversation

 */

'use strict';

const path = require('path');
const fs = require('fs');
const jsonfile = require('jsonfile');

const Statement = require('./Statement');
const Groom = require('./Groom');

/**
 * Topic of a conversation
 * @class Topic
 */
class Topic {
  /**
   * @constructs Topic
   * @param {string} topicId
   */
  constructor(topicId) {
    this.topicId = topicId;
    this.topicFile = path.join(
      __dirname,
      '..',
      'data',
      'topics',
      this.topicId + '.json'
    );
  }

  /**
   * Check if a topic exists
   *
   * @return {Boolean} Topic exists
   */
  exists() {
    return fs.existsSync(this.topicFile);
  }

  /**
   * Return topic annotations
   *
   * @return {Array} Array of annotations
   */
  getAnnotations() {
    if (this.exists()) {
      const annotations = jsonfile.readFileSync(this.topicFile).annotation;
      if (annotations !== undefined) {
        return annotations;
      }
    }
    return [];
  }

  /**
   * Return topic steps
   *
   * @return {Array} Array of steps
   */
  steps() {
    if (this.exists()) {
      return jsonfile.readFileSync(this.topicFile).steps;
    }
    return {};
  }

  /**
   * Set the field annotation from initial statement
   *
   * @param  {Object} state Current state
   */
  applyFieldAnnotationsForTopic(state) {
    const annotation = this.getAnnotations();
    const statement = new Statement(state.getStatement());

    for (let a = 0; a < annotation.length; a++) {
      const rule = annotation[a];

      // substitution can be in start words and such
      const swStatement = new Statement(rule.startWord);
      rule.startWord = swStatement.replaceBracketNotationWithStateFields(state);

      if (state.getField(rule.field) === undefined && rule.startWord !== '') {
        // Process Next Word Of Type
        if (rule.type === 'nextWordOfType') {
          state.setField(rule.field,
            statement.getNextWordOfTypeAfterWord(
              rule.startWord,
              rule.wordType,
              this.debug
            )
          );
        }

        // Process everythingAfterWord
        if (rule.type === 'everythingAfterWord') {
          state.setField(rule.field,
            statement.getEverythingAfterWord(
              rule.startWord
            )
          );
        }

        // groom if needed
        const groomer = new Groom(state.getField(rule.field));
        state.setField(rule.field, groomer.processStatement(rule.groom));
      }
    }
  }
}

module.exports = Topic;
