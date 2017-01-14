const edwinConfig = require('../config');

module.exports = {
    run: function (state, config, debug) {
        debug && console.log('texting: ' + state.statement);

        if (state.fulfillmentType !== 'dry-run') {
            // if we are here, that means we are gtg to send the message!
            var client = require('twilio')(edwinConfig.twilio.account, edwinConfig.twilio.secret);

            debug && console.log('texting: Texting number ' + state.textNumber + ' from ' + edwinConfig.twilio.fromNumber + ' ' + state.payload);

            // if we are not in a testPlan, do the actual text
            client.messages.create({
                to: state.textNumber,
                from: edwinConfig.twilio.fromNumber,
                body: state.payload
            }, function (err) {
                if (err) { // 'err' is an error received during the request, if any
                    console.log('texting: sending error');
                    console.log(err);
                } else {
                    debug && console.log('texting: sent text');
                }
            });
        }

        state.final = 'Message was sent';

        return state;
    }
};
