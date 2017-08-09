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

   Google Hangout connection handler

 */

'use strict';

const Edwin = require('../edwin');
const config = require('../../config');

// create a edwin Hangout bot
let HangoutsBot = require('hangouts-bot');
let hangoutsBot = new HangoutsBot(config.hangouts.username, config.hangouts.password);
let hangoutsBotState = {};

hangoutsBot.on('online', function() {
  console.log('hangouts: online');
});

hangoutsBot.on('message', function(from, message) {
  console.log('hangouts: ' + from + ' >> ' + message);
  hangoutsBotState.replyTo = from;
  new Edwin().converse(hangoutsBotState, message, hangoutsBotRespondCallback);
});

// Hangouts callback
const hangoutsBotRespondCallback = function(state) {
  // get the reply to from state in case we delete it
  let to = state.replyTo;

  // If we are done set reply and clear state
  if (typeof (state.final) !== 'undefined') {
    state = {reply: state.final};
  }

  // set the global state
  hangoutsBotState = state;
  console.log('hangouts: ' + to + ' << ' + state.reply + '( ' + state.action + ' ' + state.context + ' )');

  // you will post to another user's slackbot channel instead of a direct message
  hangoutsBot.sendMessage(to, state.reply);

  // return the state for automated testing
  return state;
};
