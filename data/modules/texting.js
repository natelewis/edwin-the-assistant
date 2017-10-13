

module.exports = {run: function(state, config) {
  return new Promise(function(resolve, reject) {
    const debug = state.debug;
    debug && console.log('texting: ' + state.getStatement());

    if ( !config.twilio.enabled ) {
      state.setFinal('I don\'t have a twilio set up,'
        + ' I can\'t send texts without it.');
      return resolve(state);
    }

    if (state.fulfillmentType !== 'dry-run') {
      // if we are here, that means we are gtg to send the message!
      let client = require('twilio')(
        config.twilio.account,
        config.twilio.secret
      );

      debug && console.log('texting: Texting number ' + state.textNumber
        + ' from ' + config.twilio.fromNumber + ' ' + state.payload);

      // if we are not in a testPlan, do the actual text
      client.messages.create({
        to: state.getField('textNumber'),
        from: config.twilio.fromNumber,
        body: state.getField('payload'),
      }).then( () => {
        debug && console.log('texting: sent text');
      }).catch( (err) => {
        console.log('texting: sending error');
        console.log(err);
      });
      state.setFinal('Message sent.');
      return resolve(state);
    } else {
      state.setFinal('Dry run of sending.');
      return resolve(state);
    }
  });
}};
