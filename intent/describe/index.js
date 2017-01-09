const load = require('../../lib/load');
const Words = require('../../lib/words');

module.exports = {
    process: function (state, callback, debug) {
        debug && console.log('intent describe:');
        debug && console.log(state);

        // build it like you said it one sentence
        if (state.query === 'context') {
            state.sentence = 'describe ' + state.sentence;
            debug && console.log('intent describe: changed sentence: ' + state.sentence);
        }

        // check for inserted fields
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

        if (state.query === 'payload') {
            state.payload = state.statement;
        }

        // I don't have something to describe
        if (typeof (state.payload) === 'undefined') {
            state.query = 'payload';
            state.reply = 'What sentence do you want me to describe?';
            return callback(state);
        }

        // if we have what we need for a sentence description do it
        if (typeof (state.context) !== 'undefined') {
            if (typeof (state.payload) !== 'undefined') {
                var actionHandler = load.action('describe/' + state.context, debug);
                if (typeof (actionHandler) !== 'undefined') {
                    return actionHandler.run(state, callback, debug);
                }
            }
        }

        // set the final response we are done here!
        state.reply = 'I don\'t know how to describe that yet.';

        return callback(state);
    }
};
