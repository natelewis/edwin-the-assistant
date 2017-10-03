/* Edwin The Assistant

   Copyright 2017 Nate Lewis

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   dstributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   Base conversation handler for Edwin

 */

'use strict';
const Dialog = require('./dialog');
const log = require('./logger');
const State = require('./State')

/**
 * [Edwin description]
 * @param       {[type]} config [description]
 * @constructor
 */
function Edwin(config) {
  let defaults = {
    debug: false,
    fulfillmentType: 'production',
  };

  // extend defaults
  config = Object.assign({}, defaults, config);

  this.debug = config.debug;
  this.fulfillmentType = config.fulfillmentType;

  // set default state items
  const sss = new State();
  if (config.responseObject) {
    sss.setResponseObject(config.responseObject);
  }
  if (config.sessionId) {
    sss.setSessionId(config.sessionId);
  }
}

Edwin.prototype.converse = function(state, rawInput, callback) {
  // create convresation object we will use in conversation
  let dialog = new Dialog({
    callback: callback,
    statement: rawInput,
    state: state,
    fulfillmentType: this.fulfillmentType,
  });

  dialog.checkForQuitResponseInturrupt()
    .then(() => {
      if (dialog.notResponded() &&
          typeof(dialog.state.session) === 'undefined' &&
          dialog.state.statement === '') {
        dialog.replyWithWelcome();
        dialog.finish();
      }
    })
    .then(() => {
      if (typeof(dialog.state.query) === 'undefined' && dialog.notResponded()) {
        return dialog.createInitialState();
      }
    })
    .then(() => {
      return dialog.processAnnotation();
    })
    .then(() => {
      // get the current context so if it changes we will rerun
      dialog.state.currentContext = dialog.state.context;
      return dialog.conversationHandler();
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = Edwin;
