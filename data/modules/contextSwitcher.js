module.exports = {run: function(state, config) {
  return new Promise(function(resolve, reject) {
    const Intent = require('./../../lib/intent');
    const log = require('./../../lib/logger');

    // incomming action from switcher question
    const action = state.getField(state.getQuery());

    // update the context & topic based on intent
    const intent = new Intent(action);

    // if intent is a real thing lets see if we can switch top it
    if (intent.isValid()) {
      // get new topic based on intent
      const newTopic = intent.updateTopicFromModifiers({
        statement: state.getStatement(),
        context: state.getContext(),
        topic: undefined,
      });

      console.log('TEST TPOIC:' + newTopic);
      if (newTopic !== undefined) {
        log.info('contextSwitch:  New Topic from switcher!');
        state.setReply(undefined);
        state.setContext(action);
        state.setTopic(newTopic);
      }
    }
    resolve();
  });
}};
