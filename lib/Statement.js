/*  Edwin The Assistant

   Copyright 2017 Nate Lewis

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   Statement processor for actions and context

 */

'use strict';

const pos = require('pos');

const Words = require('./Words');

/**
 * Statment class extended from Words class
 * @class Statement
 */
class Statement extends Words {
  /**
   * @constructs Statement
   * @param {string} text   The statement itself
   * @param {Boolean} debug
   */
  constructor(text, debug) {
    super(text, debug);

    // in case its called on something thats not
    if (typeof(text) === 'undefined') {
      text = '';
    }

    const lexer = new pos.Lexer();
    const tagger = new pos.Tagger();

    this.text = text;
    this.debug = debug;
    this.wordList = lexer.lex(text);
    this.wordListLC = lexer.lex(text.toLowerCase());
    this.tagged = tagger.tag(this.wordList);

    this.wordTypeNames = [];
    this.wordTypes = [];
    for (let i = 0; i < this.wordListLC.length; i++) {
      this.wordTypeNames.push(this.getWordTypeName(this.wordListLC[i]));
      this.wordTypes.push(this.getWordType(this.wordListLC[i]));
    }
  }

  /**
   * Interpolate bracket notations with field substitutions
   * example "you want to talk to [contact]?"
   * would be "you want to talk to " + fields.contact + "?"
   * @param  {Object} fields Field key value pairs
   *
   * @return {string}        Statement interpolated with substitutions
   */
  replaceFields(fields) {
    let swapVarRegex = new RegExp(/\[(.*?)]/g);
    let result;
    let replacedReply = this.text;
    while ((result = swapVarRegex.exec(this.text)) !== null) {
      // make sure we are not passin the word undefined in

      replacedReply = replacedReply.replace(
        result[0],
        (fields[result[1]] === undefined) ? '' : fields[result[1]]
      );
    }
    return replacedReply;
  }

  /**
   * A statement with only one word
   *
   * @return {Boolean}
   */
  isOneWordStatement() {
    return this.wordListLC.length < 2;
  }

  /**
   * The statement starts with 'will' or 'can'
   *
   * @return {Boolean}
   */
  startsWithCanOrWill() {
    return this.wordListLC.length > 2
      && (this.wordListLC[0] === 'can' || this.wordListLC[0] === 'will');
  }

  /**
   * First word is a verb
   *
   * @return {Boolean}
   */
  fristWordIsAVerb() {
    return this.wordTypes[0] === 'VB';
  }

  /**
   * First word is a noun then a determiner (the usually)
   *
   * @return {Boolean}
   */
  firstWordIsANounThenDeterminer() {
    return this.wordListLC.length > 2
      && (this.wordTypes[0] === 'NN' && this.wordTypes[1].match(/DT/));
  }

  /**
   * First two words are nouns
   *
   * @return {Boolean}
   */
  firstTwoWordsAreNouns() {
    return this.wordListLC.length > 1
      && (this.wordTypes[0] === 'NN' && this.wordTypes[1].match(/NN/));
  }

  /**
   * First word is a noun then TO
   *
   * @return {Boolean}
   */
  firstWordIsANountThenTo() {
    return this.wordListLC.length > 12
      && (this.wordTypes[0] === 'NN' && this.wordTypes[1].match(/TO/));
  }

  /**
   * Statement has a verb
   *
   * @return {Boolean}
   */
  hasAVerb() {
    return this.getWordsByType('VB', true).length > 0;
  }

  /**
   * Statement has a present tense verb
   *
   * @return {Boolean}
   */
  hasAPresentTenseVerb() {
    return this.getWordsByType('VBP', false).length > 0;
  }

  /**
   * Statement has at least one proposition and noun
   *
   * @return {Boolean}
   */
  hasPropositionAndNoun() {
    return this.getWordsByType('NN', false).length > 0
      && this.getWordsByType('IN', false).length > 0;
  }

  /**
   * Statement has a WDT, WP, WP$ or WRB
   *
   * @return {Boolean}
   */
  hasAWhWord() {
    return this.getWordsByType('W', false).length > 0;
  }

  /**
   * Statement has at least one proposition and noun
   *
   * @return {Boolean}
   */
  hasAnAdjective() {
    return this.getWordsByType('JJ', false).length > 0;
  }

  /**
   * debug messaging for intent matches
   * @param  {string} queryMatch What was matched to set intent
   * @param  {string} intent     What intent is set to
   *
   * @return {string} intent
   */
  logIntentDebug(queryMatch, intent) {
    this.debug && console.log('statement: '
      + '(' + queryMatch + ') ' + intent);
    return intent;
  }

  /**
   * debug messaging for context matches
   * @param  {string} queryMatch What was matched to set intent
   * @param  {string} context    What context is set to
   *
   * @return {string} context
   */
  logContextDebug(queryMatch, context) {
    this.debug && console.log('statement: '
      + '(' + queryMatch + ') ' + context);
    return context;
  }

  /**
   * Get the implied context from the statement
   * @return {string} context
   */
  getImpliedContext() {
    if (this.isOneWordStatement()) {
      this.context = this.wordListLC[0];
      return this.logContextDebug('isOneWordStatement', this.context);
    }

    if (this.startsWithCanOrWill()) {
      this.context = this.getNextWordOfTypeAfterWord(
        this.wordListLC[2],
        'NNP',
        this.debug
      );
      return this.logContextDebug('startsWithCanOrWill', this.context);
    }

    if (this.fristWordIsAVerb()) {
      this.context = this.getNextWordOfTypeAfterWord(
        this.wordListLC[0],
        'NN',
        this.debug
      );

      // try NN if NNP doesn't work
      if (typeof (this.context) === 'undefined') {
        this.context = this.getNextWordOfTypeAfterWord(
          this.wordListLC[0],
          'NNP',
          this.debug
        );
      }
      return this.logContextDebug(
        'fristWordIsAVerb',
        this.context
      );
    }

    if (this.firstWordIsANounThenDeterminer()) {
      this.context = this.wordListLC[2];
      return this.logContextDebug(
        'firstWordIsANounThenDeterminer',
        this.context
      );
    }

    if (this.firstTwoWordsAreNouns()) {
      this.context = this.wordListLC[1];
      return this.logContextDebug(
        'firstTwoWordsAreNouns',
        this.context
      );
    }

    if (this.firstWordIsANountThenTo()) {
      this.context = this.wordListLC[2];
      return this.logContextDebug(
        'firstWordIsANountThenTo',
        this.context
      );
    }

    if (this.hasAnAdjective()) {
      const firstAdjective = this.getWordsByType('JJ', false)[0];
      // try NN for context
      this.context = this.getNextWordOfTypeAfterWord(
        firstAdjective, 'NN',
        this.debug
      );
      // try NN if NNP doesn't work
      if (typeof (this.context) === 'undefined') {
        this.context = this.getNextWordOfTypeAfterWord(
          firstAdjective,
          'NNP',
          this.debug
        );
      }

      return this.logContextDebug(
        'hasAnAdjective',
        this.context
      );
    }

    return this.logContextDebug(
      'No context match',
      undefined
    );
  }

  /**
   * Get the implied intent from the statement
   *
   * @return {string} intent
   */
  getImpliedIntent() {
    if (this.isOneWordStatement()) {
      this.intent = this.wordListLC[0];
      return this.logIntentDebug(
        'isOneWordStatement',
        this.intent
      );
    }

    if (this.startsWithCanOrWill()) {
      this.intent = this.wordListLC[2];
      return this.logIntentDebug(
        'startsWithCanOrWill',
        this.intent
      );
    }

    if (this.fristWordIsAVerb()) {
      this.intent = this.wordListLC[0];
      return this.logIntentDebug(
        'fristWordIsAVerb',
        this.intent
      );
    }

    if (this.firstWordIsANounThenDeterminer()) {
      this.intent = this.wordListLC[0];
      return this.logIntentDebug(
        'firstWordIsANounThenDeterminer',
        this.intent
      );
    }

    if (this.firstTwoWordsAreNouns()) {
      this.intent = this.wordListLC[0];
      return this.logIntentDebug(
        'firstTwoWordsAreNouns',
        this.intent
      );
    }

    if (this.firstWordIsANountThenTo()) {
      this.intent = this.wordListLC[0];
      return this.logIntentDebug(
        'firstWordIsANountThenTo',
        this.intent
      );
    }

    if (this.hasAWhWord()) {
      // first one is the one we will use
      this.intent = this.getWordsByType('W', false)[0];
      return this.logIntentDebug(
        'hasAWhWord',
        this.intent
      );
    }

    if (this.hasAPresentTenseVerb()) {
      let firstPTVerb = this.getWordsByType('VBP', false)[0];
      this.intent = firstPTVerb;
      return this.logIntentDebug(
        'hasAPresentTenseVerb',
        this.intent
      );
    }

    if (this.hasAVerb()) {
      let firstVerb = this.getWordsByType('VB', true)[0];
      // please is a verb, lets not use it though
      if (firstVerb.toLowerCase() !== 'please') {
        this.intent = firstVerb;
        return this.logIntentDebug(
          'hasAVerb',
          this.intent
        );
      }
    }

    if (this.hasPropositionAndNoun()) {
      this.intent = this.getWordsByType('NN', false)[0];
      return this.logIntentDebug(
        'hasPropositionAndNoun',
        this.intent
      );
    }

    if (this.hasAnAdjective()) {
      this.intent = this.getWordsByType('JJ', false)[0];
      return this.logIntentDebug(
        'hasAnAdjective',
        this.intent
      );
    }

    return this.logIntentDebug(
      'No intent match',
      this.intent
    );
  }

  /**
   * Return the next word of a given type after the start word
   * @param  {string} startWord The word before the given type
   * @param  {string} nextType  The word type that we are looking for
   *
   * @return {string}           The word of the type we found or undefined
   */
  getNextWordOfTypeAfterWord(startWord, nextType) {
    let startIndex = this.wordListLC.indexOf(startWord.toLowerCase());
    let arrayLength = this.wordListLC.length;

    this.debug && console.log('getNextWordOfTypeAfterWord: from startWord of '
      + startWord + ' looking a ' + nextType);

    for (let i = startIndex + 1; i < arrayLength; i++) {
      if (this.getWordType(this.wordList[i]) === nextType) {
        this.debug && console.log('getNextWordOfTypeAfterWord: found '
          + this.wordListLC[i]);

        // Found it! return it
        return this.wordListLC[i];
      }
    }

    // we fell through, no such word type exists
    this.debug && console.log('getNextWordOfTypeAfterWord: found undefined');
    return undefined;
  }

  /**
   * Get everything after the first instance of a word
   * @param  {string} startWord The word we start after
   *
   * @return {string}           The rest of the statement
   */
  getEverythingAfterWord(startWord) {
    // bail if we didn't get a start word
    if (typeof (startWord) === 'undefined') {
      return undefined;
    }

    // one after the start index
    let startIndex = this.wordListLC.indexOf(startWord.toLowerCase()) + 1;

    // pull the words
    let allTheWords = this.wordList.slice(
      startIndex,
      this.wordList.length
    ).join(' ');

    // if nothing is there give undef
    if (allTheWords === '') {
      return undefined;
    }

    // squeze tics
    allTheWords = allTheWords.replace(/ ' /, '\'');
    return allTheWords;
  }

  /**
   * Get all the words from the statement before the start word
   * @param  {string} startWord Word to start before
   *
   * @return {string}           Everything before the start word
   */
  getEverythingBeforeWord(startWord) {
    // one before the start index
    let startIndex = this.wordListLC.indexOf(startWord.toLowerCase()) - 1;

    // all the words joined form the words we have
    let allTheWords = this.wordList.slice(0, startIndex).join(' ');

    // if nothing is there give undef
    if (allTheWords === '') {
      return undefined;
    }

    // squeeze tics
    allTheWords = allTheWords.replace(/ ' /, '\'');

    return allTheWords;
  }

  /**
   * Get the words by type from the array
   * @param  {string}  wordType The word type in string notation
   * @param  {Boolean} strict   Be strict about the word type (i.e. VA ~ VB...)
   *
   * @return {array} Array of words of the given type
   */
  getWordsByType(wordType, strict) {
    let wordList = this.tagged.filter(function(word) {
      if (strict) {
        return (word[1] === wordType);
      } else {
        return (word[1].slice(0, wordType.length) === wordType);
      }
    }).map(function(w) {
      return w[0];
    });

    return wordList;
  }
}


module.exports = Statement;
