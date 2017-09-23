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
   * Intent constructor created from an action
   * @constructs Intent
   *
   * @param {string} action
   */
  constructor(action) {
    this.action = action;
    this.folder = './intent/';
  }

  /**
   * Set the topic based on intent
   * @param {string} context
   * @return {string} onversation type
   *
   * @example
   * intent =  intent = new Intent('how');
   * topic = intent.applyIntentToTopic('are you"');
   * console.log(topic);
   * // mood
   */
  updateTopic(context) {
    let topicMap = this.get().topicMap;
    for (let moduleKey in topicMap) {
      if ({}.hasOwnProperty.call(topicMap, moduleKey)) {
        let intentTopicMap = topicMap[moduleKey];
        if (context === intentTopicMap.context) {
          return intentTopicMap.topic;
        }
      }
    }
    return undefined;
  }

  /**
   * Update the context based on the intent and action
   * @param {string} context
   * @param {string} statement
   * @return {string} reduced context
   *
   * @example
   * intent =  intent = new Intent('how');
   * let context = intent.reduceContext('are you');
   * // mood
   */
  updateContext(context, statement) {
    // reduce the context if we can
    let contextModifiers = this.get().contextModifiers;
    for (let contextKey in contextModifiers) {
      if (Object.prototype.hasOwnProperty.call(contextModifiers, contextKey)) {
        let modifier = contextModifiers[contextKey];
        if (modifier.type === 'map') {
          if (context === modifier.context || modifier.context === '*') {
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
    return context;
  }

  /**
   * Get the intent object by passing an action.
   * @return {object} intent object
   *
   * @example
   * const intent = new Intent('play');
   * console.log(intent.get()); // intent for play action
   */
  get() {
    let file = this.action + '.json';
    let intentJSONFile = path.join(__dirname, '..', 'data', 'intents', file);
    console.log('intent file: ' + intentJSONFile);
    if (fs.existsSync(intentJSONFile)) {
      return jsonfile.readFileSync(intentJSONFile);
    }
    return {};
  }

  /**
   * Get the list of all configured intents available
   * @return {Promise} Array of intents as strings
   *
   * @example
   * const intent = new Intent(); // no need to pass action
   * intent.getList().then( function(intentList) {
   *    console.log(intentList); // [ 'intenta', 'intentb' ]
   *  }, function(err) {
   *    console.log('error: ' + err);
   *  });
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
