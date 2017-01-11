const ActionHandler = require('../../../lib/actionHandler');
const Statement = require('../../../lib/statement');
const Words = require('../../../lib/words');

module.exports = {
    run: function (state, callback, debug) {
        debug && console.log('sentence: ' + state.sentence);

        const handler = {
            fields: [
                {
                    field: 'payload',
                    reply: [ 'What sentence do you want me to describe?' ],
                    validate: 'none'
                }
            ]
        };

        // try to guess the payload ( anything after the context is payloadd
        if (typeof (state.query) === 'undefined') {
            const words = new Words(state.statement);
            state.payload = words.getEverythingAfterWord(state.originalContext, debug);
        }

        state = new ActionHandler(state, callback, handler);

        if (typeof (state.reply) !== 'undefined') {
            return callback(state);
        }

        var confirmation = 'Sure thing!';
        var numberOfWords = state.payload.split(' ').length;

        // process the statement
        var statement = new Statement(state.payload);

        // get the action
        var actionStatement = 'The actionable intent word is ' + statement.action + '.\n';
        if (typeof (statement.action) === 'undefined') {
            actionStatement = 'The sentence has no actionable intent.\n';
        }

        // get the context
        var contextStatement = 'The action has the implied context of ' + statement.context + '.\n';
        if (typeof (statement.context) === 'undefined') {
            contextStatement = 'The sentence has no implied context.\n';
        }

        // break down each word in the sentence
        var wordTypes = '';
        for (var i = 0; i < statement.wordsLC.length; i++) {
            if (statement.wordsLC[i] === '\'') {
                wordTypes += 'Then an apostrophe.\n';
            } else if (statement.wordsLC[i].length === 1) {
                wordTypes += 'Then the letter "' + statement.wordsLC[i] + '".\n';
            } else {
                wordTypes += 'The word "' + statement.wordsLC[i] + '" is a ' + statement.wordTypeNames[i] + '.\n';
            }
        }

        state.final = confirmation + ' There is ' + numberOfWords + ' words in the sentence.\n' + actionStatement + contextStatement + wordTypes;

        return callback(state);
    }
};
