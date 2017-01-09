const load = require('../../lib/load');

module.exports = {
    process: function (state, callback, debug) {
        debug && console.log('intent resume:');

        // only thing we know how to pause is sonos
        var actionHandler = load.action('sonos', debug);
        if (typeof (actionHandler) !== 'undefined') {
            return actionHandler.run(state, callback, debug);
        }

        // set the final response we are done here!
        state.reply = 'I don\'t know how to resume things yet.';

        return callback(state);
    }
};
