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

   Intent Class

 */

'use strict';

const jsonfile = require('jsonfile');
const path = require('path');
const fs = require('fs');

/**
 * Intent class
 * @class Intent
 *
 * @example
 * let intent = new Intent('play');
 */
class Intent {
  /**
   * Create a Intent object
   * @constructs Intent
   *
   * @param {string} intentId
   */
  constructor(intentId) {
    this.intent = intentId;
    this.folder = './intent/';
    this.intentObj = this.get();
  }

  /**
   * Get the contextModifiers for a intent
   * @return {Array} Modifier list
   */
  contextModifiers() {
    return this.intentObj.contextModifiers;
  }

  /**
   * Do we have an intent?
   * @return {Boolean} True if an intent is valid
   */
  isValid() {
    return this.intentObj !== undefined;
  }

  /**
   * Return the final reply for an intent
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
   * @return {string} Updated topic
   */
  updateTopicFromModifiers({topic, context, statement}) {
    // reduce the context if we can
    let contextModifiers = this.contextModifiers();
    for (let contextKey in contextModifiers) {
      if (Object.prototype.hasOwnProperty.call(contextModifiers, contextKey)) {
        let modifier = contextModifiers[contextKey];
        if (modifier.type === 'map') {
          if (context === modifier.context
            || modifier.context === '*') {
            return modifier.target;
          }
        }
        if (modifier.type === 'phrase') {
          let re = new RegExp(modifier.context, 'gi');
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
   * @return {string} Updated context
   */
  updateContextFromModifiers({topic, context, statement}) {
    // reduce the context if we can
    let contextModifiers = this.contextModifiers();
    for (let contextKey in contextModifiers) {
      if (Object.prototype.hasOwnProperty.call(contextModifiers, contextKey)) {
        let modifier = contextModifiers[contextKey];
        if (modifier.type === 'phrase') {
          let re = new RegExp(modifier.context, 'gi');
          if (statement.match(re)) {
            return modifier.context;
          }
        }
      }
    }
    return context;
  }

  /**
   * Get the intent object by passing an action.
   * @return {object} intent object
   */
  get() {
    let file = this.intent + '.json';
    let intentJSONFile = path.join(__dirname, '..', 'data', 'intents', file);

    if (fs.existsSync(intentJSONFile)) {
      return jsonfile.readFileSync(intentJSONFile);
    }

    return undefined;
  }

  /**
   * Get the list of all configured intents available
   * @return {Promise} Array of intents as strings
   */
  getList() {
    let intentList = [];
    let folder = this.folder;

    return new Promise(function(resolve, reject) {
      fs.readdir(folder, (err, files) => {
        if (err) {
          reject(err);
        } else {
          files.forEach((file) => {
            if (file.endsWith('.json')) {
              intentList.push(file.replace(/\.json$/, ''));
            }
          });
          resolve(intentList);
        }
      });
    });
  }
}

module.exports = Intent;
