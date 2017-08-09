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
   * reduce the context
   * @param {string} context
   * @return {string} reduced context
   *
   * @example
   * intent =  intent = new Intent('how');
   * let context = intent.reduceContext('are you');
   * // mood
   */
  reduceContext(context) {
    // reduce the context if we can
    let contextModifiers = this.get().contextModifiers;
    for (let contextKey in contextModifiers) {
      if (Object.prototype.hasOwnProperty.call(contextModifiers, contextKey)) {
        let modifier = contextModifiers[contextKey];
        if (modifier.type === 'map') {
          if (context === modifier.context || modifier.context === '*') {
            context = modifier.target;
          }
        }
        if (modifier.type === 'phrase') {
          let re = new RegExp(modifier.context, 'gi');
          if (this.state.statement.match(re)) {
            console.log('found new target: ' + modifier.target);
            context = modifier.target;
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
    return jsonfile.readFileSync(intentJSONFile);
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
