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

   Slack connection handler

 */

'use strict';

const Edwin = require('../Edwin');
const appConfig = require('../config');

if (!appConfig.get('slack.enabled')) {
  console.log('slack: not enabled');
} else {
  // create a edwin slack bot we are enabled
  const config = appConfig.get('slack');

  const SlackBot = require('slackbots');
  const slackBot = new SlackBot({
    token: config.token,
    name: config.name,
  });

  slackBot.on('message', function(data) {
    if (data.type === 'desktop_notification') {
      if (data.subtitle.indexOf('(bot)') === -1) {
        console.log('slack: ' + data.subtitle + ' >> ' + data.content);
        new Edwin({
          replyTo: data.subtitle,
          sessionId: 'slack',
          callback: slackBotRespondCallback,
        }).converse(data.content);
      }
    }
  });

  slackBot.on('start', () => {
    console.log('slack: online');
  });

  // Slack callback
  const slackBotRespondCallback = function(state) {
    const replyTo = state.getReplyTo();

    // get the reply from final or reply
    let reply;
    if (state.getFinal() !== undefined) {
      reply = state.getFinal();
      // we are done, reset stat and wait for the next conversation
      state.reset();
      state.save();
    } else {
      reply = state.getReply();
    }

    // you will post to another user's slackbot channel instead
    // of a direct message
    console.log('slack: ' + replyTo + ' << ' + reply);
    slackBot.postMessageToUser(
      replyTo,
      reply,
      {'slackbot': false, 'icon_emoji': ':cat:'}
    );
  };
}
