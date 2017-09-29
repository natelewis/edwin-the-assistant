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

const Words = require('./words');
const fs = require('fs');
const AnnotationHandler = require('./annotationHandler');
const Intent = require('./intent');
const Dialog = require('./dialog');

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
        dialog.createInitialState();
      }
    })
    .then(() => {
      while (dialog.notResponded()) {
        this._processResponse(dialog, dialog.finish, this.debug);
      }
      dialog.finish();
    });
};

Edwin.prototype._processResponse = function(dialog, callback, debug) {
  console.log('PROCESSING RESPONSE');
  if (typeof(dialog.state.currentContext) === 'undefined') {
    // build an intent obj based on action
    const intent = new Intent(dialog.state.action);

    dialog.state.originalContext = dialog.state.context;

    // update the context & topic based on intent
    dialog.state = intent.updateContextAndTopic(dialog.state);

    // process state from the annotationHandler to return it based on
    // the annotation of the topic
    dialog.state = new AnnotationHandler(
      dialog.state,
      dialog.finish
    );
  }

  this.debug && console.log('context: ' + dialog.state.context);

  // get the current context so if it changes we will rerun
  dialog.state.currentContext = dialog.state.context;

  // process the converstation logic
  dialog.conversationHandler();

  if (dialog.notResponded()) {
    // if I didn't get a dialog... I am confused :(
    // process actionless statements
    let words = new Words(dialog.state.statement);

    // if there is only 1 word, lets respond with a greeting
    if (words.wordsLC.length < 2) {
      dialog.replyWithWelcome();
      return dialog.finish();
    }
  }

  // if we have not responded something went wrong and we are confused
  if (dialog.notResponded()) {
    let words = new Words(dialog.state.statement);

    console.log('edwin: confused: action: ' + dialog.state.action);
    console.log('edwin: confused: context: ' + dialog.state.context);

    fs.appendFile('confused.log', words.tagged.toString() + '\n', (err) => {
      if (err) {
        throw err;
      }
      console.log('edwin: confused: ' + dialog.state.statement);
      console.log('edwin: confused: ' + words.tagged.toString());
    });


    dialog.setFinal('Not sure I understand');
    return dialog.finish();
  }
};

module.exports = Edwin;
