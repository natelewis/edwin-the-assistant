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

// template for new config in case one isn't present
// web server for Google Assistant and api
const app = express();
app.set('port', config.get('edwin.port'));
app.use(bodyParser.json({type: 'application/json'}));
app.use(cors());

// edwin via hangouts
require('./lib/client/ngrok');

// edwin via hangouts
require('./lib/client/hangouts');

// edwin via Slack
require('./lib/client/slack');

// edwin via standalone Mic/Speaker
require('./lib/client/standalone');

// talk to a local Sonos devices if it can find one
require('./lib/client/sonos');

// edwin via api ( configuration client & listener)
const api = require('./lib/client/api');
app.use('/api', api);

// edwin via google assistant
const ga = require('./lib/client/googleAssistant');
app.use('/', ga);

// start the server for Google Actions / API / Listner
const server = app.listen(app.get('port'), () => {
  console.log('edwin: listening on http://localhost:%s', server.address().port);
});
