const config = require('../../config');
const Words = require('../../lib/words');
const Groom = require('../../lib/groom');
const ActionHandler = require('../../lib/actionHandler');

function lookupTextNumber (name) {
    // make sure we have some stuff, just bail if not
    if (typeof (name) === 'undefined') {
        return undefined;
    }
    // return if we have a config match
    return config.twilio.contacts[name];
}

module.exports = {
    run: function (state, callback, debug) {
debug = true;
        debug && console.log('texting: ' + state.statement);

        const handler = {
            fields: [
                {
                    field: 'contact',
                    reply: [ 'Who do you want to send it to?' ],
                    validate: 'textNumber'
                },
                {
                    field: 'payload',
                    reply: [ 'What do you want it to say?' ],
                    type: 'payload',
                    validate: 'none'
                },
                {
                    field: 'confirm',
                    reply: [ 'Text \'[payload]\' to \'[contact]\'. Is that correct?\'' ],
                    validate: 'confirm'
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

            state.textNumber = lookupTextNumber(state.contact);

            // if we have context see if there is payload after it
            if (typeof (state.textNumber) !== 'undefined') {
                var payloadFromIntent = new Groom(words.getEverythingAfterWord(state.contact));
                state.payload = payloadFromIntent.messagePayload();
            }
        }

        // Process query replies
        state = new ActionHandler(state, callback, handler);

        if (typeof (state.reply) !== 'undefined' || typeof (state.final) !== 'undefined') {
            return callback(state);
        }
/*
        if (state.query === 'confirm') {
            state.confirm = state.statement;
            if (!state.confirm.match(/(guess|sure|yea|do it|yes|correct|yup|go for it|ok|o k)/i)) {
                state.contact = undefined;
                state.payload = undefined;
                state.confirm = undefined;
            }
        }

        if (typeof (state.confirm) === 'undefined') {
            state.query = 'confirm';
            state.reply = 'Text "' + state.payload + '" to ' + state.contact + '. Is that correct?';
            return callback(state);
        }
*/
        if (state.fulfillmentType !== 'dry-run') {
            // if we are here, that means we are gtg to send the message!
            var client = require('twilio')(config.twilio.account, config.twilio.secret);

            debug && console.log('text: Texting number ' + state.textNumber + ' from ' + config.twilio.fromNumber + ' ' + state.payload);

            // if we are not in a testPlan, do the actual text
            client.messages.create({
                to: state.textNumber,
                from: config.twilio.fromNumber,
                body: state.payload
            }, function (err) {
                if (err) { // 'err' is an error received during the request, if any
                    console.log('text: sending error');
                    console.log(err);
                } else {
                    debug && console.log('text: sent text');
                }
            });
        }

        state.final = 'Message was sent';

        return callback(state);
    }
};
