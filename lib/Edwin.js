/* Edwin The Assistant

   Copyright 2017 Nate Lewis

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   dstributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   Base conversation handler for Edwin

 */

'use strict';

const Dialog = require('./Dialog');
const State = require('./State');

/**
 * Base conversation handler for Edwin
 * @class Edwin
 */
class Edwin {
  /**
   * @constructs Edwin
   * @param {Object}   config Edwin configuration
   * @param {string}   config.sessionId REQUIRED unique id for the session
   * @param {callback} config.callback REQUIRED Callback to respond with
   * @param {string}   config.fulfillmentType production or dry-run
   * @param {bool}     config.debug

   */
  constructor(config) {
    let defaults = {
      sessionId: 'no session was passed',
      debug: false,
      fulfillmentType: 'production',
      callback: function() {
        console.log('edwin: no callback specified');
      },
    };

    // extend defaults
    config = Object.assign({}, defaults, config);

    // set default state items
    const sss = new State();
    sss.load(config.sessionId);

    // if we need to attach the responseObject for callbacks
    // here it is
    if (config.responseObject) {
      sss.setResponseObject(config.responseObject);
    }

    // set the state for the converse()
    this.state = sss;
    this.callback = config.callback;
    this.debug = config.debug;
    this.fulfillmentType = config.fulfillmentType;

    this.debug && console.log('Edwin: Class created');
  }

  /**
   * Main conversation handler
   * @param  {string} rawInput What you want to say to Edwin
   */
  converse(rawInput) {
    // create convresation object we will use in conversation
    let dialog = new Dialog({
      fulfillmentType: this.fulfillmentType,
      debug: this.debug,
    });

    // Process all these steps, then hit the callback to the client
    dialog.startConversation(this.state, rawInput)
      .then((sss) => dialog.respondIfEmptyStatement(sss))
      .then((sss) => dialog.respondIfQuitInturrupt(sss))
      .then((sss) => dialog.respondIfTrivialResponseRequired(sss))
      .then((sss) => dialog.setInitialIntent(sss))
      .then((sss) => dialog.setInitialImpliedContext(sss))
      .then((sss) => dialog.respondIfInvalidIntent(sss))
      .then((sss) => dialog.setInitialTopic(sss))
      .then((sss) => dialog.respondIfNoTopic(sss))
      .then((sss) => dialog.setInitialContextFromModifiers(sss))
      .then((sss) => dialog.applyAnnotation(sss))
      .then((sss) => dialog.processConversationSteps(sss))
      .then((sss) => this.callback(sss))
      .catch((err) => console.log(err));
  };
}

module.exports = Edwin;
