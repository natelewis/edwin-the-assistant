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

module.exports = {
  run: function(dialog, config, callback, debug) {
    console.log('textNumberLookup: ' + dialog.statement());

    if (dialog.query() === 'textNumber') {
      dialog.setField('contact', dialog.field('textNumber'));
      dialog.setField('textNumber', lookupTextNumber(dialog.statement()));
    }

    if (dialog.query() === 'contact') {
      dialog.setField('textNumber', lookupTextNumber(dialog.statement()));
    }
  },
};
