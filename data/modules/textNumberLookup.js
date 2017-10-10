const edwinConfig = require('../../lib/config');

/**
 * Look up a contact phone number by name
 * @param  {String} name Phone number to look up
 * @return {String}      Contact phone number or undefined if not found
 */
function lookupTextNumber(name) {
  // make sure we have some stuff, just bail if not
  if (name === undefined) {
    return undefined;
  }

  // return if we have a config match
  return edwinConfig.get('twilio').contacts[name.toLowerCase()];
}

module.exports = {run: function(state, config) {
  return new Promise(function(resolve, reject) {
    console.log('textNumberLookup: ' + state.getStatement());

    if (state.getQuery() === 'textNumber') {
      state.setField('contact', state.getField('textNumber'));
      state.setField('textNumber', lookupTextNumber(state.getStatement()));
    }

    if (state.getQuery() === 'contact') {
      state.setField('textNumber', lookupTextNumber(state.getStatement()));
    }
    return resolve(state);
  });
}};
