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

   Google Assistant connection handler

 */

'use strict';

const ActionsSdkApp = require('actions-on-google').ActionsSdkApp;
const express = require('express');

const config = require('../config');
const Edwin = require('../Edwin');

let globalAssistant;

// Google home response callback
const googleActionsRespondCallback = function(state) {
  // Lets see if we get all this done, or if we have to keep talking
  if (state.getFinal() !== undefined) {
    // respond with a final reply
    console.log('googleAssistant: >> ' + state.getFinal() + ' (final)');
    globalAssistant.tell(state.getFinal());

    // we are done, reset the state
    state.reset();
    state.save();
  } else {
    // respond with another ask and keep conversing
    console.log('googleAssistant: >> ' + state.getReply());
    globalAssistant.ask(state.getReply(), {edwinState: state});
  }
  return state;
};

// Get the welcome from Edwin for Google Home
const intialIntentHandler = (assistant) => {
  // set assistant for callback
  globalAssistant = assistant;

  // make a Edwin reply with a simple welcome to set initial state
  new Edwin({
    sessionId: 'google home',
    callback: function(state) {
      globalAssistant.ask(state.getFinal(), {edwinState: state});
    },
  }).converse('');
};

// process the resonse for Google Home
const conversationIntentHandler = (assistant) => {
  console.log('googleAssistant: << ' + assistant.getRawInput());

  // set assistant for callback
  globalAssistant = assistant;


  // Say something to edwin ( or not if state is undef )
  new Edwin({
    sessionId: 'google assistant',
    callback: googleActionsRespondCallback,
  }).converse(assistant.getRawInput());
};

module.exports = (function() {
  const ga = new express.Router();

  if (config.get('googleAssistant').enabled) {
    console.log('googleAssistant: online');

    ga.post('/*', (request, response) => {
      console.log('googleAssistant: Incoming post request');
      const assistant = new ActionsSdkApp({request, response});

      // Map that contains the intents and respective handlers
      const actionMap = new Map();

      // Intent constants
      const RAW_INTENT = 'raw.input';

      // set the request handler typess
      actionMap.set(assistant.StandardIntents.MAIN, intialIntentHandler);
      actionMap.set(RAW_INTENT, conversationIntentHandler);
      actionMap.set(assistant.StandardIntents.TEXT, conversationIntentHandler);

      assistant.handleRequest(actionMap);
    });
  } else {
    console.log('googleAssistant: not enabled');
  }

  return ga;
})();
