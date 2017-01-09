const load = require('../../../lib/load');

module.exports = {
    process: function (state, callback, debug) {
        debug && console.log('send/text: ' + state.statement);

        // if we are here, that means we have everything we need, send a text
        var actionHandler = load.action('twilio', debug);
        if (typeof (actionHandler) !== 'undefined') {
            return actionHandler.run(state, callback, debug);
        }

        // set the final response we are done here!
        state.final = 'I don\'t have a texting action available to me.  You will need to install twilio before I can send this';

        return callback(state);
    }
};
