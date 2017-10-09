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

const Annotation = require('./Annotation');
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
   * @return {Promise} Returns a promise
   */
  startConversation() {
    return new Promise(function(resolve, reject) {
      const sss = new State();
      if (sss.getSessionId() === undefined) {
        sss.setFinal('Something is up with your session I D.');
        sss.finish();
      }
      resolve();
    });
  }

  /**
   * If the statment is blank, this is likely a welcome
   */
  respondIfEmptyStatement() {
    const sss = new State();
    if (sss.notResponded() && sss.getStatement() === '') {
      this.replyWithWelcome();
      sss.finish();
    }
  }

  /**
   * Check to see if a quit style word was uttered and stop what we are doing
   */
  respondIfQuitInturrupt() {
    const sss = new State();
    if (sss.notResponded()) {
      // quit talking to edwin even if your in mid action
      if (this.isConversationQuit()) {
        sss.setFinal('No Problem.');
        sss.finish();
      }
    }
  }

  /**
   * If a simple response makes sense respond with a welcome type statement
   */
  respondIfTrivialResponseRequired() {
    const sss = new State();
    if (sss.isNewConversation()) {
      // if I didn't get a dialog... I am confused :(
      // process actionless statements
      let words = new Words(sss.getStatement());
      // if there is only 1 word, lets respond with a greeting
      if (words.wordsLC.length < 2) {
        self.replyWithWelcome();
        sss.finish();
      }
    }
  }

  /**
   * Set the intent from the statement if we should
  */
  setInitialIntent() {
    const sss = new State();
    if (sss.isNewConversation()) {
      let statement = new Statement(sss.getStatement());
      if (statement.intent !== undefined) {
        sss.setIntent(statement.intent.toLowerCase());
      }
    }
  }

  /**
   * Set the implied context from the statement if we should
  */
  setInitialImpliedContext() {
    const sss = new State();
    if (sss.isNewConversation()) {
      let statement = new Statement(sss.getStatement());
      if (statement.intent !== undefined) {
        sss.setContext(statement.context);
      }
    }
  }

  /**
   * Respond with Confused if intent is invalid
   */
  respondIfInvalidIntent() {
    const sss = new State();
    if (sss.notResponded()) {
      const intent = new Intent(sss.getIntent());
      if (!intent.isValid()) {
        this.replyWithConfused();
      }
    }
  }

  /**
   * set initial topicif we should
   */
  setInitialTopic() {
    const sss = new State();
    if (sss.isNewConversation()) {
      const intent = new Intent(sss.getIntent());
      sss.setTopic(
        intent.updateTopicFromModifiers({
          statement: sss.getStatement(),
          context: sss.getContext(),
          topic: sss.getTopic(),
        })
      );
    }
  }

  /**
   * Respond with Confused if no topic
   */
  respondIfNoTopic() {
    const sss = new State();
    if (sss.notResponded()) {
      // Pull in the topic we are talking about
      const topic = new Topic(sss.getTopic());
      // check to see if it's something we know about
      if (!topic.exists()) {
        const intent = new Intent(sss.getIntent());
        sss.setFinal(intent.failedReply());
        sss.finish();
      }
    }
  }

  /**
   * set initial topic and context if we should
   */
  setInitialContextFromModifiers() {
    const sss = new State();
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
  }

  /**
   * Apply annotation to fields if we should and can
   */
  applyAnnotation() {
    const sss = new State();
    if (sss.notResponded()) {
      const annotation = new Annotation(sss.getTopic());
      annotation.setFieldAnnotations();
    }
  }

  /**
   * Process a conversation about a topic
   * @return {Promise} Dialog Promise
   */
  conversationHandler() {
    let self = this;
    return new Promise(function(resolve, reject) {
      const sss = new State();
      if (!sss.notResponded()) {
        return resolve();
      }

      // Pull in the topic we are talking about
      const topic = new Topic(sss.getTopic());

      // topic steps
      const preModuleTopic = sss.getTopic();

      const steps = topic.steps();
      // step through each step doing what we can to change the fields
      // and shape the reply
      for (let i = 0; i < steps.length; i++) {
        let step = steps[i];

        // try to populate a field
        if (sss.getQuery() === step.query && step.query !== undefined) {
          let groomer = new Groom(sss.getStatement());
          sss.setField(step.query, groomer.processStatement(step.groom));
        }

        if (sss.getField(step.query) === undefined && sss.notResponded()) {
          let reply = undefined;
          if (step.reply !== undefined) {
            let randomReply = Math.floor(Math.random() * step.reply.length);
            reply = step.reply[randomReply];
          }

          // if this is a module run it
          if (step.module !== undefined && sss.notResponded()) {
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
          if ( preModuleTopic !== sss.getTopic()
            && sss.getQuery() !== undefined
          ) {
            console.log('topic has switched!!!');
            sss.setQuery(undefined);
            self.conversationHandler();
          }

          // Do a reply -- set it, and it will be caught
          // on next loop and callback'ed?
          if (step.query !== undefined) {
            sss.setQuery(step.query);

            // replace any [things] with what they should be from state
            let replyStatement = new Statement(reply);
            reply = replyStatement.replaceFields(sss.fields);

            if (sss.getQuery() === 'final') {
              sss.setFinal(reply);
            } else {
              sss.setReply(reply);
            }
            sss.finish();
          }
        }
      }
    });
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
   * Something bad happened, spit out some confused text and set the final reply
   */
  replyWithConfused() {
    const sss = new State();
    let words = new Words(sss.getStatement());

    console.log('edwin: confused: intent: ' + sss.getIntent());
    console.log('edwin: confused: context: ' + sss.getContext());

    fs.appendFile('confused.log', words.tagged.toString() + '\n', (err) => {
      if (err) {
        throw err;
      }
      console.log('edwin: confused: ' + sss.getStatement());
      console.log('edwin: confused: ' + words.tagged.toString());
    });


    sss.setFinal('Not sure I understand');
    sss.finish();
  }
}

module.exports = Dialog;
