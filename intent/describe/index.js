const Words = require('../../lib/words');
const IntentHandler = require('../../lib/intentHandler');

// LEAVING THIS AS A CUSTOM INTENT AS A WORKING EXAMPLE
// UNTIL IT IS MORE DOCUMENTED

module.exports = {
    process: function (state, callback, debug) {
        debug = false;
        debug && console.log('intent: describe');

        var intent =
            {
                intent: 'text',
                failReply: 'I don\'t know how to do that.',
                contextModifiers: [
/*
                    {
                        context: 'statement',
                        type: 'nextWordOfType',
                        target: 'NN'
                    },
*/
                    {
                        context: 'statement',
                        type: 'map',
                        target: 'sentence'
                    }
                ],
                moduleMap: [
                    {
                        context: 'sentence',
                        module: 'describe/sentence'
                    }
                ]
            };

        // set the context to the next noun
        if (typeof (state.query) === 'undefined') {
            // find the next word after describe and set it as context
            const words = new Words(state.statement);
            var wordAfterDecscribe = words.getNextWordOfTypeAfterWord('describe', 'NN', debug);
            if (typeof (wordAfterDecscribe) !== 'undefined') {
                state.context = wordAfterDecscribe;
            }
        }

        return new IntentHandler(state, callback, intent);
    }
};
