const lookupTextNumber = (name, config) => {
  // make sure we have some stuff, just bail if not
  if (name === undefined) {
    return undefined;
  }

  // return if we have a config match
  return config.twilio.contacts[name.toLowerCase()];
};

module.exports = {run: function(state, config) {
  return new Promise(function(resolve, reject) {
    console.log('textNumberLookup: ' + state.getStatement());

    // process incomming text number from annotation
    if (state.getQuery() === undefined) {
      state.setField('textNumber',
        lookupTextNumber(state.getField('contact'), config)
      );
    }

    // process if textNumber was asked
    if (state.getQuery() === 'textNumber') {
      // keep contact current so we can always use current in substitution
      state.setField('contact', state.getField('textNumber'));
      state.setField('textNumber',
        lookupTextNumber(state.getStatement(), config)
      );
    }

    // process is contact was asked
    if (state.getQuery() === 'contact') {
      state.setField('textNumber',
        lookupTextNumber(state.getStatement(), config)
      );
    }
    return resolve(state);
  });
}};
