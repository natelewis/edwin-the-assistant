/*  Edwin The Assistant

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

   Conversation handler that processes a conversation

 */

'use strict';

const Groom = require('./groom');
const load = require('./load');
const Conditional = require('./conditional');
const Statement = require('./statement');

function ConversationHandler(state, callback, handler) {
  this.debug = false;
  this.state = state;
  this.callback = callback;
  this.handler = handler;

  // start of with reply undefined
  this.state.reply = undefined;

  // process the intent
  return this._processHandler();
}

// get the logical conversation and its context of the statement
ConversationHandler.prototype._processHandler = function() {
  let steps = this.handler.steps;

  // set all the incoming query response and groom them :)s
  for (let stepCount = 0; stepCount < steps.length; stepCount++) {
    if (this.state.query === steps[stepCount].query) {
      let groomer = new Groom(this.state.statement);
      this.state[steps[stepCount].query] = groomer.processStatement(steps[stepCount].groom);
    }
  }

  // step through each step doing what we can to change the fields
  // and shape the reply
  for (let i = 0; i < steps.length; i++) {
    let step = steps[i];

    let conditional = new Conditional(this.state);
    if (conditional.passes(step.requirement)) {
      let query = step.query;
      let reply;
      if (typeof(step.reply) !== 'undefined') {
        let randomReplyIndex = Math.floor(Math.random() * step.reply.length);
        reply = step.reply[randomReplyIndex];
      }

      // if this is a module run that
      if (typeof(step.module) !== 'undefined' && step.module !== '') {
        let moduleHandler = load.module(step.module, this.debug);
        this.debug && console.log('conversationHander: Loading module ' + step.module);
        if (typeof(moduleHandler) !== 'undefined') {
          this.state = moduleHandler.run(this.state, step.config, this.callback, this.debug);
        }
      }

      // if a module did a callback, lets exit here
      if (typeof(this.state.exit) !== 'undefined' || typeof(this.state.reply) !== 'undefined' || typeof(this.state.final) !== 'undefined') {
        return this.state;
      }

      // Do a reply -- set it, and it will be caught on next loop and callback'ed?
      if (typeof(query) !== 'undefined' && query !== '') {
        this.state.query = query;

        // replace any [things] with what they should be from state
        let replyStatement = new Statement(reply);
        reply = replyStatement.replaceFields(this.state);

        if (this.state.query === 'final') {
          this.state.final = reply;
        }
        this.state.reply = reply;
        return this.callback(this.state);
      }
    }
  }

  return this.state;
};

module.exports = ConversationHandler;
