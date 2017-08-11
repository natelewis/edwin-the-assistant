const edwinConfig = require('../lib/config');

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
  run: function(state, config, callback, debug) {
    debug && console.log('textNumberLookup: ' + state.statement);

    if (typeof (config) === 'undefined') {
      config = {};
    }

    if (typeof (config.field) === 'undefined') {
      config.field = 'contact';
    }

    // textNumber
    if (typeof (state.textNumber) === 'undefined') {
      state.textNumber = lookupTextNumber(state[config.field]);
    }

    return state;
  },
};
