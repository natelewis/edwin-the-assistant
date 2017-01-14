const Words = require('../../lib/words');
const Groom = require('../../lib/groom');
const ActionHandler = require('../../lib/actionHandler');

module.exports = {
    run: function (state, callback, debug) {
        debug = false;
        debug && console.log('texting: ' + state.statement);

        const handler = {

            annotation: [
                {
                    requirement: [],
                    type: 'nextWordOfType',
                    field: 'contact',
                    startWord: 'text',
                    wordType: 'NNP'
                },
                {
                    requirement: [],
                    type: 'nextWordOfType',
                    field: 'contact',
                    startWord: 'text',
                    wordType: 'NN'
                },
                {
                    requirement: [
                        {
                            type: 'typeof',
                            field: 'contact',
                            operator: '!==',
                            value: 'undefined'
                        }
                    ],
                    type: 'everythingAfterWord',
                    field: 'payload',
                    word: 'text',
                    groom: 'messagePayload'
                }
            ],
            steps: [
                {
                    requirement: [
                        {
                            type: 'typeof',
                            field: 'contact',
                            operator: '!==',
                            value: 'undefined'
                        },
                        {
                            type: 'typeof',
                            field: 'textNumber',
                            operator: '===',
                            value: 'undefined'
                        }
                    ],
                    module: 'textNumberLookup',
                    config: {
                        field: 'contact'
                    }
                },
                {
                    requirement: [
                        {
                            type: 'typeof',
                            field: 'contact',
                            operator: '===',
                            value: 'undefined'
                        }
                    ],
                    reply: [ 'Who do you want to send it to?' ],
                    query: 'contact'
                },
                {
                    requirement: [
                        {
                            type: 'typeof',
                            field: 'payload',
                            operator: '===',
                            value: 'undefined'
                        }
                    ],
                    reply: [ 'What do you want it to say to [contact]?' ],
                    query: 'payload',
                    groom: 'messagePayload'
                },
                {
                    requirement: [
                        {
                            type: 'typeof',
                            field: 'confirm',
                            operator: '===',
                            value: 'undefined'
                        }
                    ],
                    reply: [ 'Text \'[payload]\' to \'[contact]\'. Is that correct?\'' ],
                    query: 'confirm',
                    validate: 'confirm'
                },
                {
                    requirement: [],
                    module: 'texting'
                }
            ]
        };

        // Try to pull in fields from initial statement
        if (typeof (state.query) === 'undefined') {
            const words = new Words(state.statement);

            // if we don't have the contact see if we can guess it
            state.contact = words.getNextWordOfTypeAfterWord('text', 'NNP', debug);

            // check for NN if we didn't get an NNP
            if (typeof (state.contact) === 'undefined') {
                state.contact = words.getNextWordOfTypeAfterWord('text', 'NN', debug);
            }

            // if we have context see if there is payload after it
            // if (typeof (state.textNumber) !== 'undefined') {
            if (typeof (state.contact) !== 'undefined') {
                var payloadFromIntent = new Groom(words.getEverythingAfterWord(state.contact));
                state.payload = payloadFromIntent.messagePayload();
            }
        }
        // Process query replies
        state = new ActionHandler(state, callback, handler);

        if (typeof (state.reply) !== 'undefined' || typeof (state.final) !== 'undefined') {
            return callback(state);
        }

        return callback(state);
    }
};
