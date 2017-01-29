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

   Google Assistant connection handler

 */

'use strict';
const ActionsSdkAssistant = require('actions-on-google').ActionsSdkAssistant;

const Edwin = require('./edwin');

// global assistant handler for the final or reply callback
var globalAssistant;

// Handle Response
function GoogleAssistant (app) {
    this.app = app;
}

GoogleAssistant.prototype.addHandler = function () {
// get the post from google assistant
    this.app.post('/', (request, response) => {
        console.log('googleAssistant: Incoming post request');
        const assistant = new ActionsSdkAssistant({request: request, response: response});
        assistant.handleRequest(actionMap);
    });
};

// Google home response callback
const googleActionsRespondCallback = function (state) {
    // Lets see if we get all this done, or if we have to keep talking
    if (typeof (state.final) !== 'undefined') {
        console.log('googleAssistant: >> ' + state.final);
        globalAssistant.tell(state.final);
    } else {
        console.log('googleAssistant: >> ' + state.reply);
        globalAssistant.ask(state.reply, {edwinState: state});
    }

    // return the state for automated testing
    return state;
};

// Get the welcome from Edwin for Google Home
const intialIntentHandler = (assistant) => {
    // strip the input up to edwin before we send it to edwin so he doesn't hear
    // the invocation words
    var welcomeInput = assistant.getRawInput().replace(/^.*edwin( to|)/i, '');

    console.log('googleAssistant: << ' + welcomeInput);

   // set assistant for callback
    globalAssistant = assistant;

    // make a edwin bot to get welcome
    new Edwin().converse(undefined, welcomeInput, googleActionsRespondCallback);
};

// process the resonse for Google Home
const conversationIntentHandler = (assistant) => {
    console.log('googleAssistant: Raw input intent triggered.');

    // pull back in last states if we are already talking
    var state = assistant.getDialogState().edwinState;

    // set assistant for callback
    globalAssistant = assistant;

    console.log('googleAssistant: << ' + assistant.getRawInput());

    // Say something to edwin ( or not if state is undef )
    new Edwin().converse(state, assistant.getRawInput(), googleActionsRespondCallback);
};

// Map that contains the intents and respective handlers to be used by the edwin client library
const actionMap = new Map();

// Intent constants
const RAW_INTENT = 'raw.input';

// set the request handler typess
actionMap.set(new ActionsSdkAssistant().StandardIntents.MAIN, intialIntentHandler);
actionMap.set(RAW_INTENT, conversationIntentHandler);
actionMap.set(new ActionsSdkAssistant().StandardIntents.TEXT, conversationIntentHandler);

module.exports = GoogleAssistant;

/*

const app = express();
app.set('port', config.googleAssistant.port);
app.use(bodyParser.json({type: 'application/json'}));

// get the post from google assistant
app.post('/', (request, response) => {
    console.log('googleAssistant: Incoming post request');
    const assistant = new ActionsSdkAssistant({request: request, response: response});
    assistant.handleRequest(actionMap);
});

app.get('/api/intent', function(req, res) {
  var name = req.query.name;
  var age = req.query.age;
  var person = {
    name: name,
    age: age
  };
  savePersonToPublicFolder(person, function(err) {
    if (err) {
      res.status(404).send('User not saved');
      return;
    }
    res.send('User saved');
  });
});
function savePersonToPublicFolder(person, callback) {
  fs.writeFile('./person.json', JSON.stringify(person), callback);
}

// Start the server for Google Actions
const server = app.listen(app.get('port'), () => {
    console.log('googleAssistant: listening on port %s', server.address().port);
});
*/
