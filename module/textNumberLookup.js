const edwinConfig = require('../../config');

function lookupTextNumber (name) {
    // make sure we have some stuff, just bail if not
    if (typeof (name) === 'undefined') {
        return undefined;
    }
    // return if we have a config match
    return edwinConfig.twilio.contacts[name.toLowerCase()];
}

module.exports = {
    run: function (state, config, debug) {
        debug && console.log('textNumberLookup: ' + state.statement);

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
