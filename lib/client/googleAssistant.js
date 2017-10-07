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

const Edwin = require('../edwin');
const ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;
const config = require('../config');
let globalAssistant;

const express = require('express');

module.exports = (function() {
  'use strict';
  let ga = new express.Router();

  if (config.get('googleAssistant').enabled) {
    console.log('googleAssistant: online');

    ga.post('/', (request, response) => {
      console.log('googleAssistant: Incoming post request');
      const assistant = new ActionsSdkAssistant(
        {request: request, response: response}
      );
      assistant.handleRequest(actionMap);
    });

    // Map that contains the intents and respective handlers
    // to be used by the edwin client library
    const actionMap = new Map();

    // Intent constants
    const RAW_INTENT = 'raw.input';

    // set the request handler typess
    actionMap.set(
      new ActionsSdkAssistant().StandardIntents.MAIN,
      intialIntentHandler
    );
    actionMap.set(RAW_INTENT,
      conversationIntentHandler
    );
    actionMap.set(
      new ActionsSdkAssistant().StandardIntents.TEXT,
      conversationIntentHandler
    );
  } else {
    console.log('googleAssistant: not enabled');
  }

  // Google home response callback
  const googleActionsRespondCallback = function(state, sss) {

    // Lets see if we get all this done, or if we have to keep talking
    if (sss.getFinal() !== undefined) {
      console.log('googleAssistant: >> ' + sss.getFinal());
      globalAssistant.tell(sss.getFinal());
    } else {
      console.log('googleAssistant: >> ' + sss.getReply());
      globalAssistant.ask(sss.getReply(), {edwinState: state});
    }

    // return the state for automated testing
    return state;
  };

  // Get the welcome from Edwin for Google Home
  const intialIntentHandler = (assistant) => {
    // strip the input up to edwin before we send it to edwin so he doesn't hear
    // the invocation words
    let input = assistant.getRawInput();
    let welcomeInput = input.replace(/^.*(test app|edwin)( to|)/i, '');

    console.log('googleAssistant: << ' + welcomeInput);

    // set assistant for callback
    globalAssistant = assistant;

    // make a edwin bot to get welcome
    new Edwin().converse(welcomeInput, googleActionsRespondCallback);
  };

  // process the resonse for Google Home
  const conversationIntentHandler = (assistant) => {
    console.log('googleAssistant: Raw input intent triggered.');

    // pull back in last states if we are already talking
    let state = assistant.getDialogState().edwinState;

    // set assistant for callback
    globalAssistant = assistant;

    console.log('googleAssistant: << ' + assistant.getRawInput());

    // Say something to edwin ( or not if state is undef )
    new Edwin().converse(
      assistant.getRawInput(),
      googleActionsRespondCallback
    );
  };

  return ga;
})();
