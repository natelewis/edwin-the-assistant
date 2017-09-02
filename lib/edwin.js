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
const Convo = require('./converstation');

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
  // create convresation object we will use in converstation
  let convo = new Convo({
    callback: callback,
    statement: rawInput,
    state: state,
    fulfillmentType: this.fulfillmentType,
  });

  convo.checkForQuitResponse()
    .then(() => {
      if (convo.notResponded() &&
          typeof(convo.state.session) === 'undefined' &&
          convo.state.statement === '') {
        convo.replyWithWelcome();
        convo.finish();
      }
    })
    .then(() => {
      if (typeof(convo.state.query) === 'undefined' &&
          convo.notResponded()) {
        convo.applyStatementToState();
      }
    })
    .then(() => {
      while (convo.notResponded()) {
        this._processResponse(convo, convo.finish, this.debug);
      }
      convo.finish();
    });
};

Edwin.prototype._processResponse = function(convo, callback, debug) {
  if (typeof(convo.state.currentContext) === 'undefined') {
    // build an intent obj based on action
    const intent = new Intent(convo.state.action);

    // if we have an intent lets process intent updating against
    // context, conversation and annotation
    if (intent.get()) {
      // set the originalContext so we can refrence it later in the convo
      convo.state.originalContext = convo.state.context;

      // update the context & topic based on intent
      convo.state.context = intent.updateContext(convo.state.context, convo.state.statement);
      convo.state.topic = intent.updateTopic(convo.state.context);

      // try this one first
      let annotationJSONFile = path.join(__dirname, '..', 'annotation', convo.state.topic + '.json');

      // get the annotationJSON and pass it into the handler
      let annotationJSON = {};
      if (fs.existsSync(annotationJSONFile)) {
        annotationJSON = jsonfile.readFileSync(annotationJSONFile);
      }
      convo.state = new AnnotationHandler(convo.state, convo.finish, annotationJSON);
    }
  }

  // get the current context so if it changes we will rerun
  convo.state.currentContext = convo.state.context;

  // ty this one first
  let topicJSONFile = path.join(
    __dirname,
    '..',
    'topic',
    convo.state.topic + '.json'
  );

  // check if json version is present
  if (fs.existsSync(topicJSONFile)) {
    let topicObj = jsonfile.readFileSync(topicJSONFile);
    return convo.conversationHandler(topicObj);
  }

  // if I didn't get a convo... I am confused :(
  // process actionless statements
  let words = new Words(convo.state.statement);

  // if there is only 1 word, lets respond with a greeting
  if (words.wordsLC.length < 2) {
    convo.replyWithWelcome();
    return convo.finish();
  }

  // if we have not responded something went wrong and we are confused
  if (convo.notResponded()) {
    console.log('edwin: confused: action: ' + convo.state.action);
    console.log('edwin: confused: context: ' + convo.state.context);

    fs.appendFile('confused.log', words.tagged.toString() + '\n', (err) => {
      if (err) {
        throw err;
      }
      console.log('edwin: confused: ' + convo.state.statement);
      console.log('edwin: confused: ' + words.tagged.toString());
    });

    convo.setReply('Not sure I understand');
    return convo.finish();
  }
};

module.exports = Edwin;
