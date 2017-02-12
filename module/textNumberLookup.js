const edwinConfig = require('../config');

//
// populates textNumber with a number that is found
// by referencing the value of contact field
//

function lookupTextNumber (name) {
    // make sure we have some stuff, just bail if not
    if (typeof (name) === 'undefined') {
        return undefined;
    }
    // return if we have a config match
    return edwinConfig.twilio.contacts[name.toLowerCase()];
}

module.exports = {
    run: function (state, config, callback, debug) {
        debug && console.log('textNumberLookup: ' + state.statement);

        if (typeof (config) === 'undefined') {
            config = {};
        }

        if (typeof (config.field) === 'undefined') {
            config.field = 'contact';
        }

        // textNumber
        if (typeof (state.textNumber) === 'undefined') {
            state.textNumber = lookupTextNumber(state[config.field]);
            if (typeof (state.textNumber) === 'undefined') {
                state.query = config.field;
                state.reply = 'Not sure who that is, who do you want me to send a text to?';
                state[config.field] = undefined;
            }
        }

        return state;
    }
};
