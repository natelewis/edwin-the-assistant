const edwinConfig = require('../config');

module.exports = {
  run: function(dialog, config) {
    const debug = dialog.debug;
    debug && console.log('texting: ' + dialog.state.statement);
/*
    // this needs to be cleaned up still

    // bail if I don't have these things
    if (dialog.state.confirm !== 'true') {
      dialog.state.contact = undefined;
      dialog.state.payload = undefined;
      dialog.state.textNumber = undefined;
      dialog.state.confirm = undefined;
      return dialog.state;
    }
    */

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
        to: dialog.state.textNumber,
        from: edwinConfig.twilio.fromNumber,
        body: dialog.state.payload,
      }).then( () => {
        debug && console.log('texting: sent text');
      }).catch( (err) => {
        console.log('texting: sending error');
        console.log(err);
      });
    }

    dialog.setFinal('Message was sent');
    return dialog.finish();
  },
};
