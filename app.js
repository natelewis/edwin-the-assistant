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

const express = require('express');
const basicAuth = require('basic-auth');
const bodyParser = require('body-parser');
const cors = require('cors');

const config = require('./lib/config');

// bring in all our interfaces
const Api = require('./lib/client/api');
const GoogleAssistant = require('./lib/client/googleAssistant');
const Listener = require('./lib/client/listener');

// template for new config in case one isn't present
// web server for Google Assistant and api
const app = express();
app.set('port', config.get('edwin.port'));
app.use(bodyParser.json({type: 'application/json'}));
app.use(cors());

// edwin via hangouts
require('./lib/client/hangouts');

// edwin via Slack
require('./lib/client/slack');

if (config.get('googleAssistant').enabled) {
  console.log('googleAssistant: online');
  const googleAssistant = new GoogleAssistant(app);
  googleAssistant.addHandler();
} else {
  console.log('googleAssistant: to use Google Assistant add a googleAssistant entry to ./config.js with port defined');
}

if (typeof (config.listener) !== 'undefined' && typeof (config.listener.username) !== 'undefined' && typeof (config.listener.password) !== 'undefined') {
  console.log('listener: online');
  const listener = new Listener(app);
  listener.addHandler();
} else {
  console.log('listener: to use Remote Listner add a listener entry to ./config.js with username and password defined');
}

// api handler
if (typeof (config.api) !== 'undefined' && typeof (config.api.username) !== 'undefined' && typeof (config.api.password) !== 'undefined') {
  console.log('api: online');

  const api = new Api();

  // Synchronous auth

  let auth = function(req, res, next) {
    let user = basicAuth(req);
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

  app.get('/api/*', auth, function(req, res) {
    api.handler(req, res);
  });

  app.post('/api/*', auth, function(req, res) {
    api.handler(req, res);
  });
} else {
  console.log('api: to use remote API adminstration add api entry to ./config.js with a username and password');
}

// Start the server for Google Actions
const server = app.listen(app.get('port'), () => {
  console.log('edwin: listening on port %s', server.address().port);
});
