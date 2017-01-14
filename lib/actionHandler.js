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
const load = require('./load');

function ActionHandler (state, callback, handler) {
    this.debug = false;
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
    var steps = this.handler.steps;

    var groomed = new Groom(this.state.statement);

    for (var i = 0; i < steps.length; i++) {
        var step = steps[i];

        // if we find what we are looking for bail
        if (typeof (this.state.reply) !== 'undefined' || typeof (this.state.final) !== 'undefined') {
            return this.state;
        }
        // all the things I would need to work with
        var requirement = step.requirement;

        // test requrement
        var passedRequirements = true;

        // go through each one to see if we failed anything
        for (var x = 0; x < requirement.length; x++) {
            var cond = requirement[x];

            this.debug && console.log(cond.type + '  ' + cond.field + '  ' + cond.operator + '  ' + cond.value);
            if (cond.type === 'typeof') {
                if (cond.operator === '!==') {
                    if (typeof (this.state[cond.field]) === cond.value) {
                        passedRequirements = false;
                    }
                }
                if (cond.operator === '===') {
                    if (typeof (this.state[cond.field]) !== cond.value) {
                        passedRequirements = false;
                    }
                }
            }
        }

        // if we pass, lets do this
        if (passedRequirements) {
            if (typeof (step.module) !== 'undefined') {
                var moduleHandler = load.module(step.module, this.debug);
                this.debug && console.log('actionHander: Loading module ' + step.module);
                if (typeof (moduleHandler) !== 'undefined') {
                    this.state = moduleHandler.run(this.state, step.config, this.debug);
                }
                // skip to next one if we ran a module
                continue;
            }

            var randomReplyIndex = Math.floor(Math.random() * step.reply.length);
            var query = step.query;
            var reply = step.reply[randomReplyIndex];

            // TODO need to rework grooming
            if (this.state.query === query) {
                if (step.groom === 'messagePayload') {
                    this.state[query] = groomed.messagePayload();
                } else {
                    this.state[query] = this.state.statement;
                }
            }

            // I do't have something to describe
            if (typeof (query) !== 'undefined' && typeof (this.state[query]) === 'undefined') {
                this.state.query = query;

                // replace [some vars] with [the real thing]
                var swapVarRegex = new RegExp(/\[(.*?)]/g);
                var result;
                var replacedReply = reply;
                while ((result = swapVarRegex.exec(reply)) !== null) {
                    replacedReply = replacedReply.replace(result[0], this.state[result[1]]);
                }

                this.state.reply = replacedReply;
            }
        }
    }

    return this.state;
};

module.exports = ActionHandler;
