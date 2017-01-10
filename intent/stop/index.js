const load = require('../../lib/load');

module.exports = {
    process: function (state, callback, debug) {
        debug && console.log('intent stop:');
        debug && console.log(state);

/*

    reduceContext: {
        "song": "music",
        "track": "music"
    }
    action: {
        "music": "sonos"
    }
*/

        // check for inserted fields
        if (typeof (state.query) === 'undefined') {
            // find the next word after describe to know what we are describing
            if (state.context.match(/(song|track|music)/i)) {
                var actionHandler = load.action('sonos', debug);
                if (typeof (actionHandler) !== 'undefined') {
                    return actionHandler.run(state, callback, debug);
                }
            }
        }

        // set the final response we are done here!
        state.reply = 'I don\'t know how to stop that yet.';

        return callback(state);
    }
};
