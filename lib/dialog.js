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
const load = require('./load');
const log = require('./logger');
const jsonfile = require('jsonfile');
const path = require('path');
const fs = require('fs');
const AnnotationHandler = require('./annotationHandler');
const Intent = require('./intent');
const Words = require('./words');

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
    this.state.statement = config.statement;
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
    let statement = new Statement(this.state.statement);

    // these are always set from the no matter what
    this.state = {
      session: this.state.session,
      response: this.state.response,
      statement: this.state.statement,
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
      this.state.initialStatement = this.state.statement;
    }
  }

  /**
   * [isConversationQuit description]
   * @return {Boolean}       [description]
   */
  isConversationQuit() {
    const re = /^(no quit|please quit|leave me|shut up|stop talking|quit).*/i;
    if (this.state.statement.match(re)) {
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
   * Get the current field that is being queried
   * @return {string} Return current query
   */
  query() {
    return this.state.query;
  }

  /**
   * Return a queried fields value
   * @param  {string} fieldName field name of query
   * @return {string}           its value
   */
  field(fieldName) {
    return this.state[fieldName];
  }

  /**
   * Set the field typically set by a query
   * @param {string} fieldName The query field to set
   * @param {string} value     It's value
   */
  setField(fieldName, value) {
    this.state[fieldName] = value;
  }

  /**
   * Returns the current statment that is being processed
   * @return {string}           the statement
   */
  statement() {
    return this.state.statement;
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
  conversationHandler() {
    let self = this;
    return new Promise(function(resolve, reject) {
      // try this one first
      let topicJSONFile = path.join(
        __dirname,
        '..',
        'data',
        'topics',
        self.state.topic + '.json'
      );

      // whoa, no topic file? that be borked.
      if (!fs.existsSync(topicJSONFile)) {
        self.setConfused();
      } else {
        const handler = jsonfile.readFileSync(topicJSONFile);
        self.debug && console.log('conversationHandler: started');

        // topic steps
        const steps = handler.steps;

        // step through each step doing what we can to change the fields
        // and shape the reply
        for (let i = 0; i < steps.length; i++) {
          let step = steps[i];

          // try to populate a field
          if (self.state.query === step.query && self.state.query !== undefined) {
            let groomer = new Groom(self.state.statement);
            self.state[step.query] = groomer.processStatement(step.groom);
          }

          if (self.state[step.query] === undefined && self.notResponded()) {
            self.debug && console.log('conversationHandler: query: ' + step.query);
            let query = step.query;
            let reply = undefined;
            if (step.reply !== undefined) {
              let randomReplyIndex = Math.floor(Math.random() * step.reply.length);
              reply = step.reply[randomReplyIndex];
            }

            const preModuleProcessingTopic = self.state.topic;

            // if this is a module run it
            if (step.module !== undefined && self.notResponded()) {
              self.debug && console.log(
                'conversationHander: Loading module ' + step.module
              );
              let moduleHandler = load.module(step.module, self.debug);
              if (typeof(moduleHandler) !== 'undefined') {
                moduleHandler.run(self, step.config, self.callback, self.debug);
              } else {
                console.log(
                  'conversationHander: Module ' + step.module + ' has errors!'
                );
                reject(moduleHandler);
                self.state.final('Woh, this conversation is broken.');
              }
            }

            // if our topic changes that means we are starting over with something
            // else -- recurse!
            if (preModuleProcessingTopic !== self.state.topic && query !== undefined) {
              log.info('topic has switched!!!');
              self.state.query = undefined;
              self.conversationHandler();
            }

            // Do a reply -- set it, and it will be caught
            // on next loop and callback'ed?
            if (typeof(query) !== 'undefined' && query !== '') {
              self.state.query = query;

              // replace any [things] with what they should be from state
              let replyStatement = new Statement(reply);
              reply = replyStatement.replaceFields(self.state);

              if (self.state.query === 'final') {
                self.setFinal(reply);
              } else {
                self.setReply(reply);
              }
              self.finish();
            }
          }
        }
      }
    });
  }

  /**
   * [replyWithQuit description]
   * @param  {[type]} state [description]
   * @return {[type]}       [description]
   */
  checkForQuitResponseInturrupt() {
    let self = this;
    return new Promise(function(resolve, reject) {
      // quit talking to edwin even if your in mid action
      if (self.isConversationQuit()) {
        self.setFinal('No Problem.');
        self.finish();
      }
      resolve();
    });
  }

  /**
   * [setConfused description]
   */
  setConfused() {

    if (this.notResponded()) {
      let words = new Words(this.state.statement);

      console.log('edwin: confused: action: ' + this.state.action);
      console.log('edwin: confused: context: ' + this.state.context);

      fs.appendFile('confused.log', words.tagged.toString() + '\n', (err) => {
        if (err) {
          throw err;
        }
        console.log('edwin: confused: ' + this.state.statement);
        console.log('edwin: confused: ' + words.tagged.toString());
      });


      this.setFinal('Not sure I understand');
      this.finish();
    }
  }

  /**
   * [processAnnotation description]
   * @return {[type]} [description]
   */
  processAnnotation() {
    let self = this;
    return new Promise(function(resolve, reject) {
      // build an intent obj based on action
      const intent = new Intent(self.state.action);

      // only do this if we havn't don't it before
      if (self.state.currentContext === undefined) {
        // set the orginalContext because this is our first run
        self.state.originalContext = self.state.context;

        // update the context & topic based on intent
        self.state = intent.updateContextAndTopic(self.state);

        // process state from the annotationHandler to return it based on
        // the annotation of the topic
        self.state = new AnnotationHandler(
          self.state,
          self.finish
        );
      }

      // if we don't figure out what the topic is, set the failedReply as
      // the reply
      if (self.state.topic === undefined) {
        // if I didn't get a dialog... I am confused :(
        // process actionless statements
        let words = new Words(self.state.statement);
        // if there is only 1 word, lets respond with a greeting
        if (words.wordsLC.length < 2) {
          self.replyWithWelcome();
        } else {
          self.setFinal(intent.failedReply());
        }
        self.finish();
      }
      resolve(self.state);
    });
  }
}

module.exports = Dialog;
