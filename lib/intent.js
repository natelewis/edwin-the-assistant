'stirct';

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
   * Set the converstation based on intent
   *
   * @param {string} context
   * @return {string} onversation type
   *
   * @example
   * intent =  intent = new Intent('how');
   * conversation = intent.applyIntentToConversation('going on"');
   * // mood
   */
  updateConversation(context) {
    let conversationMap = this.get().conversationMap;
    for (let moduleKey in conversationMap) {
      if ({}.hasOwnProperty.call(conversationMap, moduleKey)) {
        let intentConversationMap = conversationMap[moduleKey];
        if (context === intentConversationMap.context) {
          return intentConversationMap.conversation;
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
   *
   * @return {object} intent object
   *
   * @example
   * const intent = new Intent('play');
   * console.log(intent.get()); // intent for play action
   */
  get() {
    let file = this.action + '.json';
    let intentJSONFile = path.join(__dirname, '..', 'intent', file);
    if (fs.existsSync(intentJSONFile)) {
      return jsonfile.readFileSync(intentJSONFile);
    }
    return {};
  }

  /**
   * Get the list of all configured intents available
   *
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
