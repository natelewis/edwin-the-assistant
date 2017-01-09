const load = require('../../lib/load');

module.exports = {
    process: function (state, callback, debug) {
        debug && console.log('intent skip:');
        debug && console.log(state);

        // check for inserted fields
        if (typeof (state.query) === 'undefined') {
            // set default context if we didn't guess it
            if (typeof (state.context) === 'undefined') {
                state.context = 'song';
            }

            // find the next word after describe to know what we are describing
            if (state.context.match(/(song|track)/i)) {
                var actionHandler = load.action('sonos', debug);
                if (typeof (actionHandler) !== 'undefined') {
                    return actionHandler.run(state, callback, debug);
                }
            }
        }

        // set the final response we are done here!
        state.reply = 'I don\'t know how to skip that yet.';

        return callback(state);
    }
};
