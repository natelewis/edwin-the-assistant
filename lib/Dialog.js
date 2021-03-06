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

   Conversation dialog processer

 */

'use static';

const path = require('path');

const Statement = require('./Statement');
const Groom = require('./Groom');
const Intent = require('./Intent');
const Topic = require('./Topic');
const config = require('./config');

/**
 * Conversation dialog processer
 * @class Dialog
 */
class Dialog {
  /**
   * @constructs Dialog
   * @param {Object}  options
   * @param {string}  options.statement - Unmodified input from client
   * @param {Boolean} options.debug - show debug output
   */
  constructor(options) {
    const defaults = {
      statement: '',
      debug: false,
      fulfillmentType: 'production',
    };

    // extend defaults
    options = Object.assign({}, defaults, options);

    // Peristent vars
    this.debug = options.debug;
    this.fulfillmentType = options.fulfillmentType;
  }

  /**
   * The start to the promise chain and validation of state
   * @param {Object} state Current State
   * @param {string} statement Incomming statement for the conversation
   *
   * @return {Promise} Returns a promise
   */
  startConversation(state, statement) {
    return new Promise(function(resolve, reject) {
      // set the statment to state
      state.setStatement(statement);

      // make sure we have a sessionId
      if (state.getSessionId() === undefined) {
        state.setFinal('Something is up with your session I D.');
      }
      resolve(state);
    });
  }

  /**
   * If the statment is blank, this is likely a welcome
   * @param {Object} state Current State
   *
   * @return {Object} New State
   */
  respondIfEmptyStatement(state) {
    if (state.notResponded() && state.getStatement() === '') {
      state.setFinal(this.getWelcomeMessage());
    }
    return state;
  }

  /**
   * Check to see if a quit style word was uttered and stop what we are doing
   * @param {Object} state Current State
   *
   * @return {Object} New State
   */
  respondIfQuitInturrupt(state) {
    if (state.notResponded()) {
      // quit talking to edwin even if your in mid action
      if (this.isConversationQuit(state)) {
        state.setFinal('No Problem.');
      }
    }
    return state;
  }

  /**
   * If a simple response makes sense respond with a welcome type statement
   * @param {Object} state Current State
   *
   * @return {Object} New State
   */
  respondIfTrivialResponseRequired(state) {
    if (state.isNewConversation()) {
      // if I didn't get a dialog... I am confused :(
      // process actionless statements
      const statement = new Statement(state.getStatement());
      // if there is only 1 word, lets respond with a greeting
      if (statement.isOneWordStatement()) {
        state.setFinal(this.getWelcomeMessage());
      }
    }
    return state;
  }

  /**
   * Set the intent from the statement if we should
   * @param {Object} state Current State
   *
   * @return {Object} New State
  */
  setInitialIntent(state) {
    if (state.isNewConversation()) {
      const statement = new Statement(state.getStatement());
      const intent = statement.getImpliedIntent();
      if (intent !== undefined) {
        state.setIntent(intent.toLowerCase());
      }
    }
    return state;
  }

  /**
   * Set the implied context from the statement if we should
   * @param {Object} state Current State
   *
   * @return {Object} New State
  */
  setInitialImpliedContext(state) {
    if (state.isNewConversation()) {
      const statement = new Statement(state.getStatement());
      const context = statement.getImpliedContext();
      // if we don't have an intent, we can't have a context
      if (state.getIntent() !== undefined) {
        state.setContext(context);
      }
    }
    return state;
  }

  /**
   * Respond with Confused if intent is invalid
   * @param {Object} state Current State
   *
   * @return {Object} New State
   */
  respondIfInvalidIntent(state) {
    if (state.notResponded()) {
      const intent = new Intent(state.getIntent());
      if (!intent.isValid()) {
        state.setFinal('Not sure I understand');
      }
    }
    return state;
  }

  /**
   * set initial topicif we should
   * @param {Object} state Current State
   *
   * @return {Object} New State
   */
  setInitialTopic(state) {
    if (state.isNewConversation() && state.notResponded()) {
      const intent = new Intent(state.getIntent());
      state.setTopic(
        intent.updateTopicFromModifiers({
          statement: state.getStatement(),
          context: state.getContext(),
          topic: state.getTopic(),
        })
      );
    }
    return state;
  }

  /**
   * Respond with Confused if no topic
   * @param {Object} state Current State
   *
   * @return {Object} New State
   */
  respondIfNoTopic(state) {
    if (state.notResponded()) {
      // Pull in the topic we are talking about
      const topic = new Topic(state.getTopic());
      // check to see if it's something we know about
      if (!topic.exists()) {
        const intent = new Intent(state.getIntent());
        state.setFinal(intent.failedReply());
      }
    }
    return state;
  }

  /**
   * set initial topic and context if we should
   * @param {Object} state Current State
   *
   * @return {Object} New State
   */
  setInitialContextFromModifiers(state) {
    if (state.isNewConversation()) {
      const intent = new Intent(state.getIntent());
      state.setContext(
        intent.updateContextFromModifiers({
          statement: state.getStatement(),
          context: state.getContext(),
          topic: state.getTopic(),
        })
      );
    }
    return state;
  }

  /**
   * Apply annotation to fields if we should and can
   * @param {Object} state Current State
   *
   * @return {Object} New State
   */
  applyAnnotation(state) {
    if (state.notResponded()) {
      const topic = new Topic(state.getTopic());
      topic.applyFieldAnnotationsForTopic(state);
    }
    return state;
  }

  /**
   * Process the conversation steps about a topic
   * @param {Object} state Current State
   *
   * @return {Promise} Promise of returning State object
   */
  processConversationSteps(state) {
    const self = this;
    return new Promise(function(resolve, reject) {
      // bail if we have already responded
      if (!state.notResponded()) {
        return resolve(state);
      }

      // Pull in the topic we are talking about
      const topic = new Topic(state.getTopic());

      // topic steps
      const steps = topic.steps();
      return resolve(self.processStep(steps, state));
    });
  }

  /**
   * Process Step as a promise and recurse to itself once it resolves
   * @param  {Object} steps Array of steps
   * @param  {Object} state Current State
   *
   * @return {Promise} The recursive promise of processStep()
   */
  processStep(steps, state) {
    const self = this;
    const step = steps.shift();
    return new Promise(function(resolve, reject) {
      // bail with state if we are after the last ste[]
      if (step == undefined) {
        return resolve(state);
      }

      // try to populate a field
      if (state.getQuery() === step.query && step.query !== undefined) {
        const groomer = new Groom(state.getStatement());
        state.setField(step.query, groomer.processStatement(step.groom));
      }

      if (state.getField(step.query) === undefined && state.notResponded()) {
        // if there is a reply available for the step set it
        self.setReplyIfAvailable(step, state);
      }

      // if this is a module run it
      if (step.module !== undefined && state.notResponded()) {
        const module = self.loadModule(step.module, self.debug);
        if (typeof(module) === 'undefined') {
          console.log(
            'conversationHander: Module ' + step.module + ' has errors!'
          );
          return resolve(state.setFinal('Woh, this conversation is broken.'));
        } else {
          module.run(state, config).then(() => {
            return resolve(self.processStep(steps, state));
          });
        }
      } else {
        return resolve(self.processStep(steps, state));
      }
    });
  }

  /**
   * Given the step, set the reply if a reply is available
   * @param {[type]} step  Step object from Topic
   * @param {Object} state Current State
   */
  setReplyIfAvailable(step, state) {
    // make sure we have a reply to give
    if (step.reply !== undefined && step.reply.length > 0) {
      const randomReply = Math.floor(Math.random() * step.reply.length);
      let reply = step.reply[randomReply];
      state.setQuery(step.query);

      // replace any [things] with what they should be from state
      const replyStatement = new Statement(reply);
      reply = replyStatement.replaceBracketNotationWithStateFields(state);

      if (state.getQuery() === 'final') {
        state.setFinal(reply);
      } else {
        state.setReply(reply);
      }
    }
  }

  /**
   * Test if we should be quitting the conversation
   * @param {Object} state Current State
   *
   * @return {Boolean} True if we should stop talking
   */
  isConversationQuit(state) {
    const re = /^(no quit|please quit|leave me|shut up|stop talking|quit).*/i;
    if (state.getStatement().match(re)) {
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
    const greeting = [
      'What\'s up?',
      'What\'s going on?',
      'Can I help with something?',
    ];
    const randomNumber = Math.floor(Math.random() * greeting.length);
    return greeting[randomNumber];
  }

  /**
   * Soft and friendly module loader
   * @param  {string} name The module located in the data/module dir
   *
   * @return {module} Either undef or the loaded module
   */
  loadModule(name) {
    const moduleFile = path.join(__dirname, '..', 'data', 'modules', name);
    let module;
    try {
      module = require(moduleFile);
    } catch (e) {
      if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
        this.debug && console.log('load: Module ' + moduleFile + ' not found');
      } else {
        // if the module has an error in it throw it
        throw e;
      }
      return undefined;
    }
    return module;
  }
}

module.exports = Dialog;
