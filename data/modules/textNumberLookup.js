const edwinConfig = require('../../lib/config');

/**
 * Look up a contact phone number by name
 * @param  {String} name Phone number to look up
 * @return {String}      Contact phone number or undefined if not found
 */
function lookupTextNumber(name) {
  // make sure we have some stuff, just bail if not
  if (typeof (name) === 'undefined') {
    return undefined;
  }

  // return if we have a config match
  return edwinConfig.get('twilio').contacts[name.toLowerCase()];
}

module.exports = {
  run: function(dialog, config, callback, debug) {
    debug && console.log('textNumberLookup: ' + dialog.state.statement);

    if (typeof (config) === 'undefined') {
      config = {};
    }

    if (typeof (config.field) === 'undefined') {
      config.field = 'contact';
    }

    // textNumber
    if (typeof (dialog.state.textNumber) === 'undefined') {
      dialog.state.textNumber = lookupTextNumber(dialog.state[config.field]);
    }
  },
};
