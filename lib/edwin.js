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
const State = require('./State');
const Intent = require('./intent');

/**
 * [Edwin description]
 * @param       {[type]} config [description]
 * @constructor
 */
function Edwin(config) {
  let defaults = {
    sessionId: 'no session was passed',
    debug: false,
    fulfillmentType: 'production',
  };

  // extend defaults
  config = Object.assign({}, defaults, config);

  this.debug = config.debug;
  this.fulfillmentType = config.fulfillmentType;

  // set default state items
  const sss = new State();
  sss.load(config.sessionId);

  // if we need to attach the responseObject for callbacks
  // here it is
  if (config.responseObject) {
    sss.setResponseObject(config.responseObject);
  }
}

Edwin.prototype.converse = function(rawInput, callback) {
  const sss = new State();

  // create convresation object we will use in conversation
  let dialog = new Dialog({
    callback: callback,
    statement: rawInput,
    fulfillmentType: this.fulfillmentType,
  });

  dialog.checkForQuitResponseInturrupt()
    .then(() => {
      if (dialog.notResponded() &&
          // typeof(dialog.state.session) === 'undefined' &&
          sss.getStatement() === '') {
        dialog.replyWithWelcome();
        dialog.finish();
      }
    })
    .then(() => {
      if (sss.getQuery() === undefined && dialog.notResponded()) {
        return dialog.createInitialState();
      }
    })
    .then(() => {
      const intent = new Intent(sss.getAction());
      if (intent.isValid()) {
        return dialog.processAnnotation();
      }
      return dialog.setConfused();
    })
    .then(() => {
      return dialog.conversationHandler();
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = Edwin;
