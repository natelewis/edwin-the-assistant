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

   Intent handler that matches action and context to an action

 */

'use strict';
const Intent = require('./intent');

function IntentHandler(state, callback, intent) {
  this.debug = false;
  this.state = state;
  this.callback = callback;
  this.intent = intent;

  // process the intent
  return this._processIntent();
}

// get the logical action and its context of the statement
IntentHandler.prototype._processIntent = function() {
  // set original context in case we reduce and want access to it
  if (typeof(this.state.originalContext) === 'undefined') {
    this.state.originalContext = this.state.context;

    let intent = new Intent(this.state.action);
    this.state.context = intent.reduceContext(this.state.context);

    // see if we have an action that maps to context
    let conversationMap = this.intent.conversationMap;
    for (let moduleKey in conversationMap) {
      if ({}.hasOwnProperty.call(conversationMap, moduleKey)) {
        let intentConversationMap = conversationMap[moduleKey];
        if (this.state.context === intentConversationMap.context) {
          this.state.conversation = intentConversationMap.conversation;
        }
      }
    }
  }

  return this.state;
};

module.exports = IntentHandler;
