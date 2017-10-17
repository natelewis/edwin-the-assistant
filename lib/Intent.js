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

   Intent of a converstation

 */

'use strict';

const jsonfile = require('jsonfile');
const path = require('path');
const fs = require('fs');

/**
 * Intent of a converstation
 * @class Intent
 *
 * @example
 * let intent = new Intent('play');
 */
class Intent {
  /**
   * @constructs Intent
   * @param {string} intentId     The intent id
   */
  constructor(intentId) {
    this.intent = intentId;
    this.intentObj = this.get();
  }

  /**
   * Get the contextModifiers for a intent
   *
   * @return {Array} Modifier list
   */
  contextModifiers() {
    return this.intentObj.contextModifiers;
  }

  /**
   * Do we have an intent?
   *
   * @return {Boolean} True if an intent is valid
   */
  isValid() {
    return this.intentObj !== undefined;
  }

  /**
   * Return the final reply for an intent
   *
   * @return {string} The reply statement
   */
  failedReply() {
    return this.intentObj.failReply;
  }

  /**
   * Update the topic based on the intent modifiers
   * @param  {string} topic     current topic
   * @param  {string} context   current context
   * @param  {string} statement current statement
   *
   * @return {string} Updated topic
   */
  updateTopicFromModifiers({topic, context, statement}) {
    // reduce the context if we can
    const contextModifiers = this.contextModifiers();
    for (const contextKey in contextModifiers) {
      if (Object.prototype.hasOwnProperty.call(contextModifiers, contextKey)) {
        const modifier = contextModifiers[contextKey];
        if (modifier.type === 'map') {
          if (context === modifier.context
            || modifier.context === '*') {
            return modifier.target;
          }
        }
        if (modifier.type === 'phrase') {
          const re = new RegExp(modifier.context, 'gi');
          if (statement.match(re)) {
            console.log('found new target: ' + modifier.target);
            return modifier.target;
          }
        }
      }
    }
    return topic;
  }

  /**
   * Update the context based on the intent modifiers
   * @param  {string} topic     current topic
   * @param  {string} context   current context
   * @param  {string} statement current statement
   *
   * @return {string} Updated context
   */
  updateContextFromModifiers({topic, context, statement}) {
    // reduce the context if we can
    const contextModifiers = this.contextModifiers();
    for (const contextKey in contextModifiers) {
      if (Object.prototype.hasOwnProperty.call(contextModifiers, contextKey)) {
        const modifier = contextModifiers[contextKey];
        if (modifier.type === 'phrase') {
          const re = new RegExp(modifier.context, 'gi');
          if (statement.match(re)) {
            return modifier.context;
          }
        }
      }
    }
    return context;
  }

  /**
   * Get the intent object from the intent.
   *
   * @return {object} Intent object
   */
  get() {
    const file = this.intent + '.json';
    const intentJSONFile = path.join(__dirname, '..', 'data', 'intents', file);

    if (fs.existsSync(intentJSONFile)) {
      return jsonfile.readFileSync(intentJSONFile);
    }

    return undefined;
  }
}

module.exports = Intent;
