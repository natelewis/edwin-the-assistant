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

   Remote voice listen handler

 */

'use strict';

const Edwin = require('../edwin');
const config = require('../config');
let listenerStateStorage = {};

// Handle Response
module.exports = function(app) {
  if (config.get('listener').enabled) {
    console.log('listener: online');
    app.post('/listener', (request, response) => {
      // set the state but if its new make a new one
      let state = listenerStateStorage[request.body.session];
      if (typeof(state) === 'undefined') {
        state = {};
      }

      // session we are using
      state.session = request.body.session;

      // get the statement from the request
      let statement = request.body.statement;
      console.log('listener: << ' + statement);

      // stash the response obj so we can reply in the callback
      state.response = response;

      // process the converstation with the statement
      new Edwin().converse(state, statement, _listenerRespondCallback);
    });
  } else {
    console.log('listener: not enabled');
  }
};

// Listener response callback
const _listenerRespondCallback = function(state) {
  // Response handler for sending back the response
  let response = state.response;
  delete state.response;

  if (typeof(state.final) !== 'undefined') {
    // kill session state
    console.log('listener: >> ' + state.final);
  } else {
    console.log('listener: >> ' + state.reply);
  }

  // save the session to memory
  listenerStateStorage[state.session] = state;

  // respond to the listner device
  response.send(JSON.stringify(state));

  // return the state for automated testing
  return state;
};
