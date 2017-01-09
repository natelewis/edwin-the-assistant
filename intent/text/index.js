const load = require('../../lib/load');

module.exports = {
    process: function (state, callback, debug) {
        debug && console.log('text: ' + state.statement);
        state.action = 'send';
        state.context = 'text';
        return load.intent(state.action, state.context, debug).process(state, callback, debug);
    }
};
