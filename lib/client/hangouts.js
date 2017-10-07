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
const appConfig = require('../config');

if (!appConfig.get('hangouts.enabled')) {
  console.log('hangouts: not enabled');
} else {
  // create a edwin Hangout bot we are enabled
  let config = appConfig.get('hangouts');

  let HangoutsBot = require('hangouts-bot');
  let hangoutsBot = new HangoutsBot(config.username, config.password);

  hangoutsBot.on('online', function() {
    console.log('hangouts: online');
  });

  hangoutsBot.on('message', function(from, message) {
    console.log('hangouts: ' + from + ' >> ' + message);
    sss.setReplyTo(from);
    new Edwin().converse(message, hangoutsBotRespondCallback);
  });

  // Hangouts callback
  const hangoutsBotRespondCallback = function(sss) {

    // get the reply to from state in case we delete it
    let to = sss.getReplyTo();

    // If we are done set reply and clear state
    if (sss.getFinal() !== undefined) {
      state = {
        reply: sss.getFinal(),
      };
    }

    // set the global state
    hangoutsBotState = state;
    console.log('hangouts: ' + to + ' << ' + sss.getReply());

    // you will post to another user's slackbot channel
    // instead of a direct message
    hangoutsBot.sendMessage(to, sss.getReply());

    // return the state for automated testing
    return state;
  };
}
