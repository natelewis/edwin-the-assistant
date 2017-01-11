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

   Action handler that processes an action before it will execute

 */

const Groom = require('./groom');
const Validate = require('./validate');

function ActionHandler (state, callback, handler) {
    this.debug = true;
    this.state = state;
    this.callback = callback;
    this.handler = handler;

    // start of with reply undefined
    this.state.reply = undefined;

    // process the intent
    return this._processHandler();
}

// get the logical action and its context of the statement
ActionHandler.prototype._processHandler = function () {
    // reduce the context if we can
    var fields = this.handler.fields;

    var groomed = new Groom(this.state.statement);

    for (var CRMap in fields) {
        if (fields.hasOwnProperty(CRMap)) {
            var randomReplyIndex = Math.floor(Math.random() * fields[CRMap].reply.length);
            var field = fields[CRMap].field;
            var validate = fields[CRMap].validate;
            var type = fields[CRMap].type;
            var reply = fields[CRMap].reply[randomReplyIndex];

            if (this.state.query === field) {
                if (type === 'payload') {
                    this.state[field] = groomed.messagePayload();
                } else {
                    this.state[field] = this.state.statement;
                }

                // pass everything trhough the valitor to set new reply
                // if its present but not valid
                this.state = new Validate(this.state, fields[CRMap]);
            }

            // I don't have something to describe
            if (typeof (this.state[field]) === 'undefined') {
                this.state.query = field;
                this.state.reply = reply;
                return this.state;
            }
        }
    }
    return this.state;
};

module.exports = ActionHandler;
