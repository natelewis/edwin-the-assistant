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
const Statement = require('./statement');
const fs = require('fs');
const ConversationHandler = require('./conversationHandler');
const AnnotationHandler = require('./annotationHandler');
const jsonfile = require('jsonfile');
const path = require('path');
const Intent = require('./intent');
const Dialog = require('./dialog');

function Edwin(options) {
  this.debug = false;
  this.fulfillmentType = 'production';
  if (typeof(options) !== 'undefined') {
    if (typeof(options.debug) !== 'undefined') {
      this.debug = options.debug;
    }
    if (typeof(options.fulfillmentType) !== 'undefined') {
      this.fulfillmentType = options.fulfillmentType;
    }
  }
}

// converse engine
Edwin.prototype.converse = function(state, rawInput, callback) {
  // rawInput should always be something
  // if (rawInput === 'undefined') {
  //  rawInput = '';
  // }

  let dialog = new Dialog({
    callback: callback,
    rawInput: rawInput,
    state: state,
  });

  rawInput = dialog.rawInput;
//  state = dialog.state;

  // Bring thr raw input into the state
  state.rawInput = rawInput;
  state.fulfillmentType = this.fulfillmentType;

  dialog.replyWithQuit(state)
    .then( (state) => {
      if (state.final === undefined &&
          state.reply === undefined &&
          typeof(session) === 'undefined' &&
          state.statement === '') {
        state = dialog.replyWithWelcome(state);
      }
      return state;
    })
    .then( (state) => {
      if (typeof(state.query) === 'undefined' &&
          state.final === undefined &&
          state.reply === undefined) {
        state = dialog.applyStatementToState(state, state.rawInput, this.debug);
      }
      return state;
    })
    .then( (state) => {
      while (state.reply === undefined && state.final === undefined) {
        // make sure we reset anything that could cause
        // problems if we are coming from
        // a context switch or other reset scenerio
        state.exit = undefined;

        // do the conversation logic
        state = this._processResponse(dialog, state, callback, this.debug);
      }

      return dialog.finish(state);
    });
};

Edwin.prototype._processResponse = function(dialog, state, callback, debug) {
  // make sure we reset anything that could cause
  // problems if we are coming from
  // a context switch or other reset scenerio
  state.exit = undefined;
  if (typeof(state.currentContext) === 'undefined') {
    // try this one first

    const intent = new Intent(state.action);

    // if we have an intent lets process intent updating against
    // context, conversation and annotation
    if (intent.get()) {
      // set the originalContext so we can refrence it later in the convo
      state.originalContext = state.context;

      // update the context & conversation based on intent
      state.context = intent.updateContext(state.context, state.statement);
      state.conversation = intent.updateConversation(state.context);

      // try this one first
      let annotationJSONFile = path.join(__dirname, '..', 'annotation', state.conversation + '.json');

      // get the annotationJSON and pass it into the handler
      let annotationJSON = {};
      if (fs.existsSync(annotationJSONFile)) {
        annotationJSON = jsonfile.readFileSync(annotationJSONFile);
      }
      state = new AnnotationHandler(state, callback, annotationJSON);
    }
  }

  // get the current context so if it changes we will rerun
  state.currentContext = state.context;

  // ty this one first
  let conversationJSONFile = path.join(__dirname, '..', 'conversation', state.conversation + '.json');

  // check if json version is present
  if (fs.existsSync(conversationJSONFile)) {
    return new ConversationHandler(state, callback, jsonfile.readFileSync(conversationJSONFile));
  }

  // if I didn't get a conversation... I am confused :(
  // process actionless statements
  let words = new Words(state.statement);

  // if there is only 1 word, lets respond with a greeting
  if (words.wordsLC.length < 2) {
    return dialog.replyWithWelcome(state);
  }

  console.log('edwin: confused: action: ' + state.action);
  console.log('edwin: confused: context: ' + state.context);

  fs.appendFile('confused.log', words.tagged.toString() + '\n', (err) => {
    if (err) {
      throw err;
    }
    console.log('edwin: confused: ' + state.statement);
    console.log('edwin: confused: ' + words.tagged.toString());
  });

  // if we fell through without processing, return undef and give up
  state = {
    session: state.session,
    response: state.response,
    reply: 'Not sure I understand',
    replyTo: state.replyTo,
  };
  return state;
};

// process a new converstation
Edwin.prototype._setupInitialState = function(state, text, debug) {
  // See if we can figure out the right action
  let statement = new Statement(text);

  // if there isn't anything bail,  we are not an action
  if (typeof(statement.action) === 'undefined') {
    // this is what we know!
    this.debug && console.log('edwin: no action was found');
    state = {
      session: state.session,
      response: state.response,
      statement: text,
      replyTo: state.replyTo,
      rawInput: text,
    };
  } else {
    // this is what we know!
    this.debug && console.log('edwin: context: ' + statement.context);
    state = {
      session: state.session,
      response: state.response,
      statement: text,
      replyTo: state.replyTo,
      rawInput: text,
      action: statement.action.toLowerCase(),
      context: statement.context,
    };
  }

  return state;
};

module.exports = Edwin;
