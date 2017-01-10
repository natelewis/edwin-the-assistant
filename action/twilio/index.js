const config = require('../../config');
const Words = require('../../lib/words');
const Groom = require('../../lib/groom');

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
        debug && console.log('twilio: ' + state.statement);

        // check for inserted fields
        if (typeof (state.query) === 'undefined') {
            const words = new Words(state.statement);

            // if we don't have the contact see if we can guess it
            state.contact = words.getNextWordOfTypeAfterWord('text', 'NNP', debug);

            if (typeof (lookupTextNumber(state.contact)) !== 'undefined') {
                var payloadFromIntent = new Groom(words.getEverythingAfterWord(state.contact));
                state.payload = payloadFromIntent.messagePayload();
            }
        }

        // process an ongoing response
        if (state.query === 'contact') {
            state.contact = state.statement.toLowerCase();
        }
        if (state.query === 'payload') {
            var payloadFromQuery = new Groom(state.statement);
            state.payload = payloadFromQuery.messagePayload();
        }
        if (state.query === 'confirm') {
            state.confirm = state.statement;
            if (!state.confirm.match(/(guess|sure|yea|do it|yes|correct|yup|go for it|ok|o k)/i)) {
                state.contact = undefined;
                state.payload = undefined;
                state.confirm = undefined;
            }
        }

        // send back more questions if we don't have everything
        if (typeof (state.contact) === 'undefined') {
            state.query = 'contact';
            state.reply = 'Who would you like to send a text to?';
            return callback(state);
        }

        // try to send to what we thing the sending to is
        state.textNumber = lookupTextNumber(state.contact);
        if (typeof (state.textNumber) === 'undefined') {
            state.query = 'contact';
            state.reply = 'Not sure who that is, who do you want me to send a text to?';
            state.contact = undefined;
            return callback(state);
        }

        // I don't have something to send
        if (typeof (state.payload) === 'undefined') {
            state.query = 'payload';
            state.reply = 'What do you want it to say?';
            return callback(state);
        }

        if (typeof (state.confirm) === 'undefined') {
            state.query = 'confirm';
            state.reply = 'Text "' + state.payload + '" to ' + state.contact + '. Is that correct?';
            return callback(state);
        }

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
                    debug && console.log('text: sending error: ' + err);
                } else {
                    debug && console.log('text: sent text');
                }
            });
        }

        state.final = 'Message was sent';

        return callback(state);
    }
};
