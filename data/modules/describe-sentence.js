module.exports = {run: function(state, config) {
  return new Promise(function(resolve, reject) {
    const Statement = require('./../../lib/Statement');
    const debug = false;
    debug && console.log('describe-sentence: ' + state.getStatement());

    // we need this to continue
    if (state.getField('payload') === undefined) {
      return resolve(state);
    }

    let confirmation = 'Sure thing!';
    let numberOfWords = state.getField('payload').split(' ').length;

    // process the statement
    const statement = new Statement(state.getField('payload'), false);
    const intent = statement.getImpliedIntent();
    const context = statement.getImpliedContext();
    // get the action
    let actionStatement = 'The implied intent is ' + intent + '.\n';
    if (intent === undefined) {
      actionStatement = 'The statement has no implied intent.\n';
    }

    // get the context
    let contextStatement = 'It has an implied context of ' + context + '.\n';
    if (typeof (context) === 'undefined') {
      contextStatement = 'The statement has no implied context.\n';
    }

    // break down each word in the sentence
    let wordTypes = '';
    for (let i = 0; i < statement.wordListLC.length; i++) {
      if (statement.wordListLC[i] === '\'') {
        wordTypes += 'Then an apostrophe.\n';
      } else if (statement.wordListLC[i].length === 1) {
        wordTypes += 'Then the letter "' + statement.wordListLC[i] + '".\n';
      } else {
        wordTypes += 'The word "' + statement.wordListLC[i];
        wordTypes += '" is a ' + statement.wordTypeNames[i] + '.\n';
      }
    }

    state.setFinal(
      confirmation + ' There is ' +
      numberOfWords + ' words in the sentence.\n' +
      actionStatement + contextStatement + wordTypes
    );
    return resolve(state);
  });
}};
