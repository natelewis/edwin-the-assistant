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

const express = require('express');
const basicAuth = require('basic-auth');
const bodyParser = require('body-parser');
const Api = require('./lib/api');
const cors = require('cors')

const GoogleAssistant = require('./lib/googleAssistant');
require('./lib/hangouts');
require('./lib/slack');

// template for new config in case one isn't present
const configTemplate = `// omit sections to disable them 
var config = {

    edwin: {
        port: 8080 
    },

    // handlers

    googleAssistant: {
        enabled: false
    },

    slack: {
        token: undefined,       //'get one from https://my.slack.com/services/new/bot'
        name: undefined
    },

    api: {
        username: undefined,    //'someemail@gmail.com',
        password: undefined     //'sompassword''
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

// web server for Google Assistant and api
const app = express();
app.set('port', config.edwin.port);
app.use(bodyParser.json({type: 'application/json'}));
app.use(cors())

// edwin via hangouts
if (typeof (config.hangouts) !== 'undefined' && typeof (config.hangouts.username) !== 'undefined' && typeof (config.hangouts.password) !== 'undefined') {
} else {
    console.log('hangouts: to use Google Hangouts add a hangouts entry to ./config.js with username and password defined');
}

// edwin via Slack
if (typeof (config.slack) !== 'undefined' && typeof (config.slack.token) !== 'undefined' && typeof (config.slack.name) !== 'undefined') {
} else {
    console.log('slack: to use Slack add a slack entry to ./config.js with token and name defined');
}

if (typeof (config.googleAssistant) !== 'undefined' && config.googleAssistant.enabled === true) {
    console.log('googleAssistant: online');
    const googleAssistant = new GoogleAssistant(app);
    googleAssistant.addHandler();
} else {
    console.log('googleAssistant: to use Google Assistant add a googleAssistant entry to ./config.js with port defined');
}

// api handler
if (typeof (config.api) !== 'undefined' && typeof (config.api.username) !== 'undefined' && typeof (config.api.password) !== 'undefined') {
    console.log('api: online');

    const api = new Api();

    // Synchronous auth

    var auth = function (req, res, next) {
        var user = basicAuth(req);
        if (!user || !user.name || !user.pass) {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            res.sendStatus(401);
            return;
        }
        if (user.name === config.api.username && user.pass === config.api.password) {
            next();
        } else {
            res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
            res.sendStatus(401);
            return;
        }
    };

    app.get('/api/*', auth, function (req, res) {
        api.handler(req, res);
    });

} else {
    console.log('api: to use remote API adminstration add api entry to ./config.js with  username and password');
}

// Start the server for Google Actions
const server = app.listen(app.get('port'), () => {
    console.log('edwin: listening on port %s', server.address().port);
});

