const lookupTextNumber = (name, config) => {
  // make sure we have some stuff, just bail if not
  if (name === undefined) {
    return undefined;
  }

  // make it lc so it is normalized
  const lcName = name.toLowerCase();

  if (config.has('twilio.contacts.' + lcName)) {
    return config.get('twilio.contacts.' + lcName);
  }

  // nope, no person
  return undefined;
};

module.exports = {run: function(state, config) {
  return new Promise(function(resolve, reject) {
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
