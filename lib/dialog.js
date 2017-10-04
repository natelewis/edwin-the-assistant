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


const Statement = require('./statement');
const Groom = require('./groom');
const load = require('./load');
const log = require('./logger');
const fs = require('fs');

const AnnotationHandler = require('./annotationHandler');
const Intent = require('./intent');
const Words = require('./words');
const Topic = require('./Topic');
const State = require('./State');

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

    // set the statment to state
    const sss = new State();
    sss.setStatement(config.statement);

    // Peristent vars
    this.state = config.state;
    this.debug = config.debug;
    this.callback = config.callback;
    this.fulfillmentType = config.fulfillmentType;

    // always make sure we have a clean final and reply
    // when we have dialog
    sss.setFinal(undefined);
    sss.setReply(undefined);
  }

  /**
   * [finish description]
   * @return {[type]} [description]
   */
  finish() {
    const sss = new State();
    if (!this._callbackFired) {
      this._callbackFired = true;
      return this.callback(this.state, sss);
    }
    return this.state;
  }

  /**
   * [createInitialState description]
   * @param  {[type]} state [description]
   * @param  {[type]} debug [description]
  */
  createInitialState() {
    const sss = new State();

    // See if we can figure out the right action
    let statement = new Statement(sss.getStatement());

    // these are always set from the no matter what
    this.state = {
      statement: sss.getStatement(),
      replyTo: this.state.replyTo,
    };

    // if there isn't anyting we found out...
    if (typeof(statement.action) === 'undefined') {
      this.debug && console.log('edwin: no action was found');
      self.setConfused();
    } else {
      // this is what we know from the statement we applied
      this.debug && console.log('edwin: context: ' + statement.context);
      sss.setAction(statement.action.toLowerCase());
      sss.setContext(statement.context);
    }
  }

  /**
   * [isConversationQuit description]
   * @return {Boolean}       [description]
   */
  isConversationQuit() {
    const sss = new State();
    const re = /^(no quit|please quit|leave me|shut up|stop talking|quit).*/i;
    if (sss.getStatement().match(re)) {
      return true;
    };
    return false;
  }

  /**
   * Reply with a random welcome statement
   */
  replyWithWelcome() {
    const sss = new State();
    let greeting = [
      'What\'s up?',
      'What\'s going on?',
      'Can I help with something?',
    ];
    let randomNumber = Math.floor(Math.random() * greeting.length);
    sss.setFinal(greeting[randomNumber]);
  }

  /**
   * Return true if final or reply has been set
   * @return {Boolean}
   */
  notResponded() {
    const sss = new State();
    if (sss.getFinal() === undefined && sss.getReply() === undefined) {
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
   * Process a conversation about a topic
   * @return {Promise} The promise of a conversation
   */
  conversationHandler() {
    let self = this;
    return new Promise(function(resolve, reject) {
      const sss = new State();
      // Pull in the topic we are talking about
      const topic = new Topic(sss.getTopic());
      // check to see if it's something we know about
      if (!topic.exists()) {
        // whoa.. not a thing, I'm confused.
        self.setConfused();
      } else {
        // topic steps
        const steps = topic.steps();
        // step through each step doing what we can to change the fields
        // and shape the reply
        for (let i = 0; i < steps.length; i++) {
          let step = steps[i];
          const state = self.state;

          // try to populate a field
          if (state.query === step.query && state.query !== undefined) {
            let groomer = new Groom(sss.getStatement());
            state[step.query] = groomer.processStatement(step.groom);
          }

          if (state[step.query] === undefined && self.notResponded()) {
            self.debug && console.log('conversationHandler: query: ' + step.query);
            let query = step.query;
            let reply = undefined;
            if (step.reply !== undefined) {
              let randomReply = Math.floor(Math.random() * step.reply.length);
              reply = step.reply[randomReply];
            }

            const preModuleTopic = sss.getTopic();

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
                sss.setFinal('Woh, this conversation is broken.');
              }
            }

            // if our topic changes that means we are starting over
            //  with something else -- recurse!
            if (preModuleTopic !== sss.getTopic() && query !== undefined) {
              log.info('topic has switched!!!');
              state.query = undefined;
              self.conversationHandler();
            }

            // Do a reply -- set it, and it will be caught
            // on next loop and callback'ed?
            if (typeof(query) !== 'undefined' && query !== '') {
              state.query = query;

              // replace any [things] with what they should be from state
              let replyStatement = new Statement(reply);
              reply = replyStatement.replaceFields(state);

              if (state.query === 'final') {
                sss.setFinal(reply);
              } else {
                sss.setReply(reply);
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
      const sss = new State();
      // quit talking to edwin even if your in mid action
      if (self.isConversationQuit()) {
        sss.setFinal('No Problem.');
        self.finish();
      }
      resolve();
    });
  }

  /**
   * Something bad happened, spit out some confused text and set the final reply
   */
  setConfused() {
    // bring in state
    const sss = new State();

    if (this.notResponded()) {
      let words = new Words(sss.getStatement());

      console.log('edwin: confused: action: ' + sss.getAction());
      console.log('edwin: confused: context: ' + sss.getContext());

      fs.appendFile('confused.log', words.tagged.toString() + '\n', (err) => {
        if (err) {
          throw err;
        }
        console.log('edwin: confused: ' + sss.getStatement());
        console.log('edwin: confused: ' + words.tagged.toString());
      });


      sss.setFinal('Not sure I understand');
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
      const sss = new State();
      // build an intent obj based on action
      const intent = new Intent(sss.getAction());

      // only do this if we havn't don't it before
      if (self.state.currentContext === undefined) {
        // set the orginalContext because this is our first run
        self.state.originalContext = sss.getContext();

        // update the context & topic based on intent
        self.state = intent.updateContextAndTopic(self.state);

        // process state from the annotationHandler to return it based on
        // the annotation of the topic
        self.state = new AnnotationHandler(self.state);
      }

      // if we don't figure out what the topic is, set the failedReply as
      // the reply
      if (sss.getTopic() === undefined) {
        // if I didn't get a dialog... I am confused :(
        // process actionless statements
        let words = new Words(sss.getStatement());
        // if there is only 1 word, lets respond with a greeting
        if (words.wordsLC.length < 2) {
          self.replyWithWelcome();
        } else {
          sss.setFinal(intent.failedReply());
        }
        self.finish();
      }
      resolve(self.state);
    });
  }
}

module.exports = Dialog;
