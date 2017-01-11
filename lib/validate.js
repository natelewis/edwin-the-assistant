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

   Validate query responses

 */

const config = require('../config');

function lookupTextNumber (name) {
    // make sure we have some stuff, just bail if not
    if (typeof (name) === 'undefined') {
        return undefined;
    }
    // return if we have a config match
    return config.twilio.contacts[name.toLowerCase()];
}

function Validate (state, item) {
    this.debug = true;
    this.state = state;
    this.validate = item.validate;
    this.field = item.field;

    // process the intent
    return this._processValidation();
}

// get the logical action and its context of the statement
Validate.prototype._processValidation = function () {
                // validate
    if (this.validate === 'textNumber' && typeof (this.state.textNumber) === 'undefined') {
        this.debug && console.log('actionHandler: validate (' + this.validate + ') - ' + this.state[this.field]);
        this.state.textNumber = lookupTextNumber(this.state[this.field]);
        if (typeof (this.state.textNumber) === 'undefined') {
            this.debug && console.log('actionHandler: validate (' + this.validate + ') FAILED');

            this.state.query = this.field;
            this.state.reply = 'Not sure who that is, who do you want me to send a text to?';
            this.state[this.field] = undefined;
        }
    }

    return this.state;
};

module.exports = Validate;
