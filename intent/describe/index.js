const Words = require('../../lib/words');
const IntentHandler = require('../../lib/intentHandler');

module.exports = {
    process: function (state, callback, debug) {
        debug = false;
        debug && console.log('intent: describe');

        var intent =
            {
                setContext: {
                    nextWord: {
                        'type': 'NN'
                    }
                },
                contextReduce: {
                    'statement': 'sentence'
                },
                module: {
                    'sentence': 'describe/sentence'
                },
                failReply: 'I don\'t know how to describe that yet.'
            };

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

        return new IntentHandler(state, callback, intent);
    }
};
