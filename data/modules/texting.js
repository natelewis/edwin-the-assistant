module.exports = {run: function(state, config) {
  return new Promise(function(resolve, reject) {
    const edwinConfig = config;
    let dialog = {};
    dialog.fulfillmentType !== 'dry-run';

    const debug = dialog.debug;
    debug && console.log('texting: ' + state.getStatement());

    if ( !edwinConfig.twilio.enabled ) {
      state.setFinal('I don\'t have a twilio set up,'
        + ' I can\'t send texts without it.');
      state.finish();
      return resolve(state);
    }

    if (dialog.fulfillmentType !== 'dry-run') {
      // if we are here, that means we are gtg to send the message!
      let client = require('twilio')(
        edwinConfig.twilio.account,
        edwinConfig.twilio.secret
      );

      debug && console.log('texting: Texting number ' + state.textNumber
        + ' from ' + edwinConfig.twilio.fromNumber + ' ' + state.payload);

      // if we are not in a testPlan, do the actual text
      client.messages.create({
        to: state.getField('textNumber'),
        from: edwinConfig.twilio.fromNumber,
        body: state.getField('payload'),
      }).then( () => {
        debug && console.log('texting: sent text');
      }).catch( (err) => {
        console.log('texting: sending error');
        console.log(err);
      });
      state.setFinal('Message sent.');
      state.finish();
      return resolve(state);
    } else {
      state.setFinal('Dry run of sending.');
      state.finish();
      return resolve(state);
    }
  });
}};
