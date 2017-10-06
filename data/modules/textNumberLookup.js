const edwinConfig = require('../../lib/config');
const State = require('./../../lib/State');

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

module.exports = {
  run: function(dialog, config, callback, debug) {
    const sss = new State();
    console.log('textNumberLookup: ' + sss.getStatement());

    if (sss.getQuery() === 'textNumber') {
      sss.setField('contact', sss.getField('textNumber'));
      sss.setField('textNumber', lookupTextNumber(sss.getStatement()));
    }

    if (sss.getQuery() === 'contact') {
      sss.setField('textNumber', lookupTextNumber(sss.getStatement()));
    }
  },
};
