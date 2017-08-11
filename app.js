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
const bodyParser = require('body-parser');
const cors = require('cors');

const config = require('./lib/config');

// bring in all our interfaces

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

// edwin via api ( configuration client )
require('./lib/client/api')(app);


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


// Start the server for Google Actions & API
const server = app.listen(app.get('port'), () => {
  console.log('edwin: listening on port %s', server.address().port);
});
