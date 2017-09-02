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

   Dialog with general non actionable resopones.

 */


'use strict';
const Statement = require('./statement');

/**
 * [defaults description]
 * @type {Object}
 */
class Dialog {
  /**
   * @param       {Object} config
   * @param       {number} config.state - current state object
   * @param       {string} config.statement - Unmodified input from client
   * @param       {Boolean} config.debug - show debug output
   * @param       {callback} config.callback - response callback
   * @constructor Speech
   */
  constructor(config) {
    let defaults = {
      state: {},
      statement: '',
      debug: false,
      callback: function() {},
    };

    // extend defaults
    config = Object.assign({}, defaults, config);

    // Peristent vars
    this.state = config.state;
    this.statement = config.statement;
    this.debug = config.debug;
    this.callback = config.callback;


    // if there is no state but we have raw input
    // setup the intial state
    if (typeof(config.state) === 'undefined' &&
        typeof(this.statement) !== 'undefined' &&
        this.statement.split(' ').length > 0) {
      this.applyStatementToState();
    }

    // always make sure we have a clean final and reply
    // when we have dialog
    this.state.final = undefined;
    this.state.reply = undefined;
  }

  /**
   * [finish description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  finish(state) {
    if (!this._callbackFired) {
      this.state.exit = true;
      this._callbackFired = true;
      return this.callback(this.state);
    }
    return state;
  }

  /**
   * [setupInitialState description]
   * @param  {[type]} state [description]
   * @param  {[type]} debug [description]
   */
  applyStatementToState() {
    // See if we can figure out the right action
    let statement = new Statement(this.statement);

    // if there isn't anything bail,  we are not an action
    if (typeof(statement.action) === 'undefined') {
      // this is what we know!
      this.debug && console.log('edwin: no action was found');
      this.state = {
        session: this.state.session,
        response: this.state.response,
        statement: this.statement,
        replyTo: this.state.replyTo,
      };
    } else {
      // this is what we know!
      this.debug && console.log('edwin: context: ' + statement.context);
      this.state = {
        session: this.state.session,
        response: this.state.response,
        action: statement.action.toLowerCase(),
        statement: this.statement,
        context: statement.context,
        replyTo: this.state.replyTo,
        fulfillmentType: this.state.fulfillmentType,
        initialStatement: this.statement,
      };
    }
  }

  /**
   * [isConverstationQuit description]
   * @return {Boolean}       [description]
   */
  isConverstationQuit() {
    if (this.statement.match(/^(no quit|please quit|leave me|shut up|stop talking|quit).*/i)) {
      return true;
    };
    return false;
  }

  /**
   * Reply with a random welcome statement
   */
  replyWithWelcome() {
    let greeting = [
      'What\'s up?',
      'What\'s going on?',
      'Can I help with something?',
    ];
    let randomNumber = Math.floor(Math.random() * greeting.length);
    this.setReply(greeting[randomNumber]);
  }

  /**
   * Return true if final or reply has been set
   * @return {Boolean}
   */
  notResponded() {
    if (this.state.final === undefined && this.state.reply === undefined) {
      return true;
    }
    return false;
  }

  /**
   * Set the final reply if the conversation is over
   * @param {string} final Response to user from Edwin
   */
  setFinal(final) {
    this.state.final = final;
    this.state.reply = undefined;
  }

  /**
   * Set the reply and expect a response
   * @param {string} reply Response to user from Edwin
   */
  setReply(reply) {
    this.state.reply = reply;
    this.state.final = undefined;
  }

  /**
   * [replyWithQuit description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  checkForQuitResponse() {
    let self = this;
    return new Promise( function( resolve, reject) {
      // quit talking to edwin even if your in mid action
      if (self.isConverstationQuit()) {
        self.setFinal('No Problem.');
        self.finish();
      }
      return resolve();
    });
  }
}

module.exports = Dialog;
