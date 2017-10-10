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

const Intent = require('./Intent');
const Topic = require('./Topic');
const State = require('./State');
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
    this.debug = config.debug;
    this.callback = config.callback;
    this.fulfillmentType = config.fulfillmentType;

    // always make sure we have a clean final and reply
    // when we have dialog
    sss.setFinal(undefined);
    sss.setReply(undefined);
  }

  /**
   * The start to the promise chain and validation of state
   * @param {Object} sss Current State
   *
   * @return {Promise} Returns a promise
   */
  startConversation(sss) {
    return new Promise(function(resolve, reject) {
      if (sss.getSessionId() === undefined) {
        sss.setFinal('Something is up with your session I D.');
      }
      resolve(sss);
    });
  }

  /**
   * If the statment is blank, this is likely a welcome
   * @param {Object} sss Current State
   *
   * @return {Object} New State
   */
  respondIfEmptyStatement(sss) {
    if (sss.notResponded() && sss.getStatement() === '') {
      sss.setFinal(this.getWelcomeMessage());
    }
    return sss;
  }

  /**
   * Check to see if a quit style word was uttered and stop what we are doing
   * @param {Object} sss Current State
   *
   * @return {Object} New State
   */
  respondIfQuitInturrupt(sss) {
    if (sss.notResponded()) {
      // quit talking to edwin even if your in mid action
      if (this.isConversationQuit()) {
        sss.setFinal('No Problem.');
      }
    }
    return sss;
  }

  /**
   * If a simple response makes sense respond with a welcome type statement
   * @param {Object} sss Current State
   *
   * @return {Object} New State
   */
  respondIfTrivialResponseRequired(sss) {
    if (sss.isNewConversation()) {
      // if I didn't get a dialog... I am confused :(
      // process actionless statements
      let words = new Words(sss.getStatement());
      // if there is only 1 word, lets respond with a greeting
      if (words.wordsLC.length < 2) {
        sss.setFinal(this.getWelcomeMessage());
      }
    }
    return sss;
  }

  /**
   * Set the intent from the statement if we should
   * @param {Object} sss Current State
   *
   * @return {Object} New State
  */
  setInitialIntent(sss) {
    if (sss.isNewConversation()) {
      let statement = new Statement(sss.getStatement());
      if (statement.intent !== undefined) {
        sss.setIntent(statement.intent.toLowerCase());
      }
    }
    return sss;
  }

  /**
   * Set the implied context from the statement if we should
   * @param {Object} sss Current State
   *
   * @return {Object} New State
  */
  setInitialImpliedContext(sss) {
    if (sss.isNewConversation()) {
      let statement = new Statement(sss.getStatement());
      if (statement.intent !== undefined) {
        sss.setContext(statement.context);
      }
    }
    return sss;
  }

  /**
   * Respond with Confused if intent is invalid
   * @param {Object} sss Current State
   *
   * @return {Object} New State
   */
  respondIfInvalidIntent(sss) {
    if (sss.notResponded()) {
      const intent = new Intent(sss.getIntent());
      if (!intent.isValid()) {
        sss.setFinal('Not sure I understand');
      }
    }
    return sss;
  }

  /**
   * set initial topicif we should
   * @param {Object} sss Current State
   *
   * @return {Object} New State
   */
  setInitialTopic(sss) {
    if (sss.isNewConversation() && sss.notResponded()) {
      const intent = new Intent(sss.getIntent());
      sss.setTopic(
        intent.updateTopicFromModifiers({
          statement: sss.getStatement(),
          context: sss.getContext(),
          topic: sss.getTopic(),
        })
      );
    }
    return sss;
  }

  /**
   * Respond with Confused if no topic
   * @param {Object} sss Current State
   *
   * @return {Object} New State
   */
  respondIfNoTopic(sss) {
    if (sss.notResponded()) {
      // Pull in the topic we are talking about
      const topic = new Topic(sss.getTopic());
      // check to see if it's something we know about
      if (!topic.exists()) {
        const intent = new Intent(sss.getIntent());
        sss.setFinal(intent.failedReply());
      }
    }
    return sss;
  }

  /**
   * set initial topic and context if we should
   * @param {Object} sss Current State
   *
   * @return {Object} New State
   */
  setInitialContextFromModifiers(sss) {
    if (sss.isNewConversation()) {
      const intent = new Intent(sss.getIntent());
      sss.setContext(
        intent.updateContextFromModifiers({
          statement: sss.getStatement(),
          context: sss.getContext(),
          topic: sss.getTopic(),
        })
      );
    }
    return sss;
  }

  /**
   * Apply annotation to fields if we should and can
   * @param {Object} sss Current State
   *
   * @return {Object} New State
   */
  applyAnnotation(sss) {
    if (sss.notResponded()) {
      const topic = new Topic(sss.getTopic());
      topic.applyFieldAnnotationsForTopic(sss);
    }
    return sss;
  }

  /**
   * Process the conversation steps about a topic
   * @param {Object} sss Current State
   *
   * @return {Promise} Promise of returning the final State object
   */
  processConversationSteps(sss) {
    let self = this;
    return new Promise(function(resolve, reject) {
      // bail if we have already responded
      if (!sss.notResponded()) {
        return resolve(sss);
      }

      // Pull in the topic we are talking about
      const topic = new Topic(sss.getTopic());

      // topic steps
      let steps = topic.steps();
      return resolve(self.processStep(steps, sss));
    });
  }

  /**
   * Process Step as a promise and recurse to itself once it resolves
   * @param  {Object} steps Array of steps
   * @param  {Object} sss   Current State
   * @return {Promise}      The recursive promise of processStep()
   */
  processStep(steps, sss) {
    let self = this;
    const step = steps.shift();
    return new Promise(function(resolve, reject) {
      // bail with state if we are after the last ste[]
      if (step == undefined) {
        return resolve(sss);
      }
      // try to populate a field
      if (sss.getQuery() === step.query && step.query !== undefined) {
        let groomer = new Groom(sss.getStatement());
        sss.setField(step.query, groomer.processStatement(step.groom));
      }

      if (sss.getField(step.query) === undefined && sss.notResponded()) {
        // if there is a reply available for the step set it
        self.setReplyIfAvailable(step);
      }

      // if this is a module run it
      if (step.module !== undefined && sss.notResponded()) {
        self.debug && console.log(
          'conversationHander: Loading module ' + step.module
        );
        const module = self.loadModule(step.module, self.debug);
        if (typeof(module) === 'undefined') {
          console.log(
            'conversationHander: Module ' + step.module + ' has errors!'
          );
          return reject(module);
          sss.setFinal('Woh, this conversation is broken.');
        } else {
          module.run(sss, step.config).then(() => {
            return resolve(self.processStep(steps, sss));
          });
        }
      } else {
        return resolve(self.processStep(steps, sss));
      }
    });
  }

  /**
   * Given the step, set the reply if a reply is available
   * @param {[type]} step Step object from Topic
   */
  setReplyIfAvailable(step) {
    const sss = new State();
    if (step.reply !== undefined) {
      let randomReply = Math.floor(Math.random() * step.reply.length);
      let reply = step.reply[randomReply];
      sss.setQuery(step.query);

      // replace any [things] with what they should be from state
      let replyStatement = new Statement(reply);
      reply = replyStatement.replaceFields(sss.fields);

      if (sss.getQuery() === 'final') {
        sss.setFinal(reply);
      } else {
        sss.setReply(reply);
      }
    }
  }

  /**
   * Test if we should be quitting the conversation
   *
   * @return {Boolean} True if we should stop talking
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
   *
   * @return {string} A random greeting
   */
  getWelcomeMessage() {
    let greeting = [
      'What\'s up?',
      'What\'s going on?',
      'Can I help with something?',
    ];
    let randomNumber = Math.floor(Math.random() * greeting.length);
    return greeting[randomNumber];
  }

  /**
   * Soft module loader
   * @param  {string} moduleName The module located in the data/module dir
   * @return {module}            Either undef or the loaded module
   */
  loadModule(moduleName) {
    let modulePath = './../data/modules/' + moduleName;
    let module;
    try {
      module = require(modulePath);
    } catch (e) {
      if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
        debug && console.log('load: Module ' + modulePath + ' not available');
      } else {
        // if the module has an error in it throw the error
        console.log('load: Module ' + modulePath + ' has errors');
        throw e;
      }
      return undefined;
    }
    return module;
  }
}

module.exports = Dialog;
