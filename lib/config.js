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

   Config creator and reader

 */

'use strict';

const convict = require('convict');
const configFile = './config.json';
const fs = require('fs');

// check for env version of config
if (process.env.EDWIN_CONFIG !== undefined) {
  configFile = process.env.EDWIN_CONFIG;
};

// base example config
const config = convict({});
config.load({

  edwin: {
    port: 8080,
  },

  // handlers

  googleAssistant: {
    enabled: false,
    project: 'change-me-12345',
  },

  slack: {
    enabled: false,
    token: 'get token from https://my.slack.com/services/new/bot',
    name: 'Edwin',
  },

  ngrok: {
    enabled: false,
  },

  standalone: {
    enabled: false,
  },

  api: {
    enabled: true,
    username: 'edwin',
    password: 'password',
  },

  hangouts: {
    enabled: false,
    username: 'someemail@gmail.com',
    password: 'somepassword',
  },

  // actions

  sonos: {
    URI: undefined, // 'https://localserver.atyourhouse.com:5006';
  },

  twilio: {
    enabled: false,
    fromNumber: '+155555551212',
    twilioAccount: undefined,
    twilioSecret: undefined,
    contacts: {
      'nate': '+15555551212',
      'mom': '+15555551212',
    },
  },
});

console.log('edwin: loading ' + configFile);
try {
  config.loadFile(configFile);
} catch (e) {
  console.log('edwin: file not found creating new ' + configFile);
  try {
    fs.writeFileSync(configFile, config.toString(), 'utf8');
  } catch (e) {
    console.log('edwin: ' + e);
    throw new Error('Could not create config file ' + e);
  }
  console.log('edwin: new ./config.js file created in this directory');
  console.log('edwin: edit the config file and restart the server');
}

module.exports = config;
