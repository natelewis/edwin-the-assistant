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

   Application loader and configuration init

 */

'use strict';
var fs = require('fs');

// template for new config in case one isn't present
const configTemplate = `// omit sections to disable them 
var config = {

    // handlers

    googleAssistant: {
        port: undefined
    },

    slack: {
        token: undefined,       //'get one from https://my.slack.com/services/new/bot'
        name: undefined
    },

    hangouts: {
        username: undefined,    //'someemail@gmail.com',
        password: undefined     //'sompassword''
    },

    // actions

    sonos: {
        URI: undefined          //'https://localserver.atyourhouse.com:5006';
    },

    twilio: {
        fromNumber: '+155555551212',
        twilioAccount: undefined,
        twilioSecret: undefined,
        contacts: {
            'nate' : '+15555551212',
            'mom' : '+15555551212'
        }
    }
};

module.exports = config;`;

// try to load the config, if we can't make one
try {
    var config = require('./config');
} catch (e) {
    if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
        // config not foune, make one
        fs.writeFile('./config.js', configTemplate, function (err) {
            if (err) {
                console.log('edwin: could not create config file ' + err);
            }
        });
    } else {
        throw e;
    }

    // loading the config didn't work out, make it blank so we can move on and tell
    // the console.log what to do
    config = {};
}

if (typeof (config.hangouts) !== 'undefined' && typeof (config.hangouts.username) !== 'undefined' && typeof (config.hangouts.password) !== 'undefined') {
    require('./lib/hangouts');
} else {
    console.log('hangouts: to use Google Hangouts add a hangouts entry to ./config.js with username and password defined');
}

if (typeof (config.slack) !== 'undefined' && typeof (config.slack.token) !== 'undefined' && typeof (config.slack.name) !== 'undefined') {
    require('./lib/slack');
} else {
    console.log('slack: to use Slack add a slack entry to ./config.js with token and name defined');
}

if (typeof (config.googleAssistant) !== 'undefined' && typeof (config.googleAssistant.port) !== 'undefined') {
    require('./lib/googleAssistant');
} else {
    console.log('googleAssistant: to use Google Assistant add a googleAssistant entry to ./config.js with port defined');
}
