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
const Edwin = require('../edwin');
const config = require('../../config');

// create an edwin slack bot
var SlackBot = require('slackbots');
var slackBotState = {};
var slackBot = new SlackBot({
    token: config.slack.token,
    name: config.slack.name
});

slackBot.on('message', function (data) {
    if (data.type === 'desktop_notification') {
        if (data.subtitle.indexOf('(bot)') === -1) {
            slackBotState.replyTo = data.subtitle;
            console.log('slack: ' + slackBotState.replyTo + ' >> ' + data.content);
            new Edwin().converse(slackBotState, data.content, slackBotRespondCallback);
        }
    }
});

slackBot.on('start', function () {
    console.log('slack: online');
});

// Slack callback
const slackBotRespondCallback = function (state) {
    // who I'm replying to
    var to = state.replyTo;

    // If we are done set reply and clear state
    if (typeof (state.final) !== 'undefined') {
        state = {reply: state.final};
    }

    // set the global state
    slackBotState = state;
    console.log(state);
    console.log('slack: ' + to + ' << ' + state.reply);

    // you will post to another user's slackbot channel instead of a direct message
    slackBot.postMessageToUser(to, state.reply, { 'slackbot': false, icon_emoji: ':cat:' });

    // return the state for automated testing
    return state;
};
