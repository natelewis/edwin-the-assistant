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
const load = require('./load');

function IntentHandler (state, callback, intent) {
    this.debug = false;
    this.state = state;
    this.callback = callback;
    this.intent = intent;

    // process the intent
    return this._processIntent();
}

// get the logical action and its context of the statement
IntentHandler.prototype._processIntent = function () {
    // set original context in case we reduce and want access to it
    if (typeof (this.state.originalContext) === 'undefined') {
        this.state.originalContext = this.state.context;
    }

    // reduce the context if we can
    var contextReduce = this.intent.contextReduce;
    for (var CRMap in contextReduce) {
        if (contextReduce.hasOwnProperty(CRMap)) {
            if (this.state.context === CRMap) {
                this.state.context = contextReduce[CRMap];
            }
        }
    }

    // override context if this is set
    if (typeof (this.intent.forceContext) !== 'undefined') {
        this.state.context = this.intent.forceContext;
    }

    // see if we have an action that maps to context
    var intentModule = this.intent.module;
    for (var IAMap in intentModule) {
        if (intentModule.hasOwnProperty(IAMap)) {
            if (this.state.context === IAMap) {
                this.state.module = intentModule[IAMap];
            }
        }
    }

    // if we have an action map end it off to the action handler
    var actionHandler = load.action(this.state.module, this.debug);
    if (typeof (actionHandler) !== 'undefined') {
        return actionHandler.run(this.state, this.callback, this.debug);
    }

    // if we are here things didn't work out
    this.state.final = this.intent.failReply;
    return this.callback(this.state);
};

module.exports = IntentHandler;
