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

   Base converstation handler for Edwin

 */

'use strict';

const Words = require('./words');
const fs = require('fs');
const AnnotationHandler = require('./annotationHandler');
const jsonfile = require('jsonfile');
const path = require('path');
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

// converse engine
Edwin.prototype.converse = function(state, rawInput, callback) {
  // create dialog object we will use in converstation
  let dialog = new Dialog({
    callback: callback,
    statement: rawInput,
    state: state,
    fulfillmentType: this.fulfillmentType,
  });

  dialog.checkForQuitResponse()
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
        dialog.applyStatementToState();
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
  if (typeof(dialog.state.currentContext) === 'undefined') {
    // try this one first

    const intent = new Intent(dialog.state.action);

    // if we have an intent lets process intent updating against
    // context, conversation and annotation
    if (intent.get()) {
      // set the originalContext so we can refrence it later in the convo
      dialog.state.originalContext = dialog.state.context;

      // update the context & conversation based on intent
      dialog.state.context = intent.updateContext(dialog.state.context, dialog.state.statement);
      dialog.state.conversation = intent.updateConversation(dialog.state.context);

      // try this one first
      let annotationJSONFile = path.join(__dirname, '..', 'annotation', dialog.state.conversation + '.json');

      // get the annotationJSON and pass it into the handler
      let annotationJSON = {};
      if (fs.existsSync(annotationJSONFile)) {
        annotationJSON = jsonfile.readFileSync(annotationJSONFile);
      }
      dialog.state = new AnnotationHandler(dialog.state, dialog.finish, annotationJSON);
    }
  }

  // get the current context so if it changes we will rerun
  dialog.state.currentContext = dialog.state.context;

  // ty this one first
  let conversationJSONFile = path.join(__dirname, '..', 'conversation', dialog.state.conversation + '.json');

  // check if json version is present
  if (fs.existsSync(conversationJSONFile)) {
    if (dialog.state === undefined) {
      console.log(dialog)
    }
    dialog.conversationHandler(jsonfile.readFileSync(conversationJSONFile));
    return;
  //  return dialog.state;
  }

  // if I didn't get a conversation... I am confused :(
  // process actionless statements
  let words = new Words(dialog.state.statement);

  // if there is only 1 word, lets respond with a greeting
  if (words.wordsLC.length < 2) {
    dialog.replyWithWelcome();
    dialog.finish();
  }

  // if we have not responded something went wrong and we are confused
  if (dialog.notResponded()) {
    console.log('edwin: confused: action: ' + dialog.state.action);
    console.log('edwin: confused: context: ' + dialog.state.context);

    fs.appendFile('confused.log', words.tagged.toString() + '\n', (err) => {
      if (err) {
        throw err;
      }
      console.log('edwin: confused: ' + dialog.state.statement);
      console.log('edwin: confused: ' + words.tagged.toString());
    });

    dialog.setReply('Not sure I understand');
    dialog.finish();
  }

};

module.exports = Edwin;
