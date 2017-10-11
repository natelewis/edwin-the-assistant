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
   * @param {Object}   config                 Edwins configuration
   * @param {string}   config.sessionId       Session Id ( REQUIRED )
   * @param {callback} config.callback        Response callback ( REQUIRED )
   * @param {string}   config.fulfillmentType production or dry-run
   * @param {string}   config.replyTo         Reply id for 3rd party client
   * @param {bool}     config.debug

   */
  constructor(config) {
    let defaults = {
      sessionId: 'no session was passed',
      debug: false,
      fulfillmentType: 'production',
      replyTo: 'client',
      callback: function() {
        console.log('edwin: no callback specified');
      },
    };

    // extend defaults
    config = Object.assign({}, defaults, config);

    // set default state items
    const state = new State();
    state.load(config.sessionId);
    state.setReplyTo(config.replyTo);

    // if we need to attach the responseObject for callbacks
    // here it is
    if (config.responseObject) {
      state.setResponseObject(config.responseObject);
    }

    // set the state for the converse()
    this.state = state;
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
      .then((state) => dialog.respondIfEmptyStatement(state))
      .then((state) => dialog.respondIfQuitInturrupt(state))
      .then((state) => dialog.respondIfTrivialResponseRequired(state))
      .then((state) => dialog.setInitialIntent(state))
      .then((state) => dialog.setInitialImpliedContext(state))
      .then((state) => dialog.respondIfInvalidIntent(state))
      .then((state) => dialog.setInitialTopic(state))
      .then((state) => dialog.respondIfNoTopic(state))
      .then((state) => dialog.setInitialContextFromModifiers(state))
      .then((state) => dialog.applyAnnotation(state))
      .then((state) => dialog.processConversationSteps(state))
      .then((state) => this.callback(state))
      .catch((err) => console.log(err));
  };
}

module.exports = Edwin;
