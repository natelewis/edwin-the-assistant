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

   Config Handler

 */

'use strict';
const convict = require('convict');
const configFile = './config.json';
let fs = require('fs');

// base example config
let config = convict({});
config.load({

  edwin: {
    port: 8080
  },

  // handlers

  googleAssistant: {
    enabled: false
  },

  slack: {
    enabled: false,
    token: 'get token from https://my.slack.com/services/new/bot',
    name: 'Some Name',
  },

  listener: {
    username: undefined, //'someeuser',
    password: undefined //'somepassword'
  },

  api: {
    username: undefined, //'someemail@gmail.com',
    password: undefined //'sompassword'
  },

  hangouts: {
    enabled: false,
    username: 'someemail@gmail.com',
    password: 'somepassword',
  },

  // actions

  sonos: {
    URI: undefined //'https://localserver.atyourhouse.com:5006';
  },

  twilio: {
    fromNumber: '+155555551212',
    twilioAccount: undefined,
    twilioSecret: undefined,
    contacts: {
      'nate': '+15555551212',
      'mom': '+15555551212'
    }
  }
});

console.log('edwin: loading ' + configFile);
try {
  config.loadFile(configFile);
} catch (e) {
  console.log('edwin: file not found creating new ' + configFile);
  try {
    fs.writeFileSync(configFile, config.toString(), 'utf8');
  } catch (e) {
    console.log('edwin: could not create config file ' + e);
    process.exit(1);
  }
  console.log('edwin: new ./config.js file created in this directory');
  console.log('edwin: edit the config file and restart the server');
}

module.exports = config;