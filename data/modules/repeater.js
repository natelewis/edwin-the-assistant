module.exports = {run: function(state, config) {
  return new Promise(function(resolve, reject) {
    // given a conversation that I will have a field populated as "payload"
    // have edwin respond with the said payload.
    state.setFinal(state.getField('payload'));

    // I'm done, finish my promise by passing my state back
    return resolve(state);
  });
}};
