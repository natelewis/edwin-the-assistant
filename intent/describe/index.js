const load = require('../../lib/load');
const Words = require('../../lib/words');

module.exports = {
    process: function (state, callback, debug) {
        debug = true;
        debug && console.log('intent: describe');

        // check for inserted fields
        if (typeof (state.query) === 'undefined') {
            // find the next word after describe to know what we are describing
            if (state.context.match(/(statement)/i)) {
                state.context = 'sentence';
            }
        }

        if (typeof (state.query) === 'undefined') {
            // find the next word after describe to know what we are describing
            const words = new Words(state.statement);
            var wordAfterDecscribe = words.getNextWordOfTypeAfterWord('describe', 'NN', debug);
            if (typeof (wordAfterDecscribe) !== 'undefined') {
                if (wordAfterDecscribe.match(/(statement|sentence)/)) {
                    state.payload = words.getEverythingAfterWord(wordAfterDecscribe, debug);
                    state.context = 'sentence';
                }
            }
        }

        // if we have what we need for a sentence description do it
        if (typeof (state.context) !== 'undefined') {
            var actionHandler = load.action('describe/' + state.context, debug);
            if (typeof (actionHandler) !== 'undefined') {
                return actionHandler.run(state, callback, debug);
            }
        }

        // set the final response we are done here!
        state.reply = 'I don\'t know how to describe that yet.';

        return callback(state);
    }
};
