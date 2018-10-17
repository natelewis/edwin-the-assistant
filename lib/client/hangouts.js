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

const Edwin = require('../Edwin');
const appConfig = require('../config');

if (!appConfig.get('hangouts.enabled')) {
  console.log('hangouts: not enabled');
} else {
  // create a edwin Hangout bot we are enabled
  const config = appConfig.get('hangouts');

  const HangoutsBot = require('hangouts-bot');
  const hangoutsBot = new HangoutsBot(config.username, config.password);

  hangoutsBot.on('online', () => {
    console.log('hangouts: online');
  });

  hangoutsBot.on('message', function(from, message) {
    console.log('hangouts: ' + from + ' >> ' + message);
    new Edwin({
      sessionId: 'google hangouts',
      callback: hangoutsBotRespondCallback,
      replyTo: from,
    }).converse(message);
  });

  // Hangouts callback
  const hangoutsBotRespondCallback = function(state) {
    const replyTo = state.getReplyTo();
    // store final or reply here
    let reply;
    if (state.getFinal() !== undefined) {
      reply = state.getFinal();
      // we are done, reset stat and wait for the next conversation
      state.reset();
      state.save();
    } else {
      reply = state.getReply();
    }

    console.log('hangouts: ' + replyTo +') >> ' + reply);

    // direct message them with the reply
    hangoutsBot.sendMessage(replyTo, reply);
  };
}
