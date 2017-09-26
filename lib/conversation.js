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
const Groom = require('./groom');
const Conditional = require('./conditional');
const load = require('./load');

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
      fulfillmentType: 'production',
    };

    // extend defaults
    config = Object.assign({}, defaults, config);

    // Peristent vars
    this.state = config.state;
    this.statement = config.statement;
    this.debug = config.debug;
    this.callback = config.callback;
    this.fulfillmentType = config.fulfillmentType;

    // always make sure we have a clean final and reply
    // when we have dialog
    this.state.final = undefined;
    this.state.reply = undefined;
  }

  /**
   * [finish description]
   * @return {[type]} [description]
   */
  finish() {
    if (!this._callbackFired) {
      this._callbackFired = true;
      return this.callback(this.state);
    }
    return this.state;
  }

  /**
   * [createInitialState description]
   * @param  {[type]} state [description]
   * @param  {[type]} debug [description]
  */
  createInitialState() {
    // See if we can figure out the right action
    let statement = new Statement(this.statement);

    // these are always set from the no matter what
    this.state = {
      session: this.state.session,
      response: this.state.response,
      statement: this.statement,
      replyTo: this.state.replyTo,
    };

    // if there isn't anyting we found out...
    if (typeof(statement.action) === 'undefined') {
      this.debug && console.log('edwin: no action was found');
    } else {
      // this is what we know from the statement we applied
      this.debug && console.log('edwin: context: ' + statement.context);
      this.state.action = statement.action.toLowerCase();
      this.state.context = statement.context;
      this.state.initialStatement = this.statement;
    }
  }

  /**
   * [isConversationQuit description]
   * @return {Boolean}       [description]
   */
  isConversationQuit() {
    const re = /^(no quit|please quit|leave me|shut up|stop talking|quit).*/i;
    if (this.statement.match(re)) {
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
    this.setFinal(greeting[randomNumber]);
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
   * Set the final reply, and update the state to ensure no other reply is
   * present
   * @param {string} final The reply that is set to final
   * @return {object} Return the state mutated state
   */
  setFinal(final) {
    this.state.final = final;
    this.state.reply = undefined;
    return this.state;
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
   * [conversationHandler description]
   * @param  {[type]} handler [description]
   * @return {[type]}         [description]
   */
  conversationHandler(handler) {
    let steps = handler.steps;
    this.debug && console.log('conversationHandler: started');

    // set all the incoming query response and groom them :)s
    for (let stepCount = 0; stepCount < steps.length; stepCount++) {
      if (this.state.query === steps[stepCount].query) {
        let groomer = new Groom(this.state.statement);
        this.state[steps[stepCount].query] = groomer.processStatement(
          steps[stepCount].groom
        );
      }
    }

    // step through each step doing what we can to change the fields
    // and shape the reply
    for (let i = 0; i < steps.length; i++) {
      let step = steps[i];

      let conditional = new Conditional(this.state);

      this.debug && console.log(
        'conversationHandler: testing conditional',
        step.requirement
      );

      if (conditional.passes(step.requirement)) {
        this.debug && console.log('conversationHandler: testing passed!');
        let query = step.query;
        let reply = undefined;
        if (typeof(step.reply) !== 'undefined') {
          let randomReplyIndex = Math.floor(Math.random() * step.reply.length);
          reply = step.reply[randomReplyIndex];
        }


        // if this is a module run that
        if (step.module !== undefined && step.module !== '') {
          this.debug && console.log(
            'conversationHander: Loading module ' + step.module
          );
          let moduleHandler = load.module(step.module, this.debug);
          if (typeof(moduleHandler) !== 'undefined') {
            moduleHandler.run(this, step.config, this.callback, this.debug);
          } else {
            console.log(
              'conversationHander: Module ' + step.module + ' has errors!'
            );
            return this.state;
          }

          // if a module set a reply or final lets bail
          if (!this.notResponded()) {
            return this.state;
          }
        }

        // Do a reply -- set it, and it will be caught
        // on next loop and callback'ed?
        if (typeof(query) !== 'undefined' && query !== '') {
          this.state.query = query;

          // replace any [things] with what they should be from state
          let replyStatement = new Statement(reply);
          reply = replyStatement.replaceFields(this.state);

          if (this.state.query === 'final') {
            this.setFinal(reply);
          } else {
            this.setReply(reply);
          }
          return this.finish();
        }
      }
    }
    return this.finish();
  }


  /**
   * [replyWithQuit description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  checkForQuitResponseInturrupt() {
    let self = this;
    return new Promise( function( resolve, reject) {
      // quit talking to edwin even if your in mid action
      if (self.isConversationQuit()) {
        self.setFinal('No Problem.');
        self.finish();
      }
      return resolve();
    });
  }
}

module.exports = Dialog;
