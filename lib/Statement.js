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

   Statement processor for intent and context

 */

'use strict';

const Words = require('./Words');
const SentenceIntent = require('sentence-intent');
const pos = require('pos');

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

    const lexer = new pos.Lexer();
    const tagger = new pos.Tagger();

    this.wordList = lexer.lex(this.text);
    this.wordListLC = lexer.lex(this.text.toLowerCase());
    this.tagged = tagger.tag(this.wordList);

    this.wordTypeNames = [];
    this.wordTypes = [];
    for (let i = 0; i < this.wordListLC.length; i++) {
      // POS needs to be upcased for Tagger
      this.wordList[i].replace(/^s$/, 'S');
      this.wordTypeNames.push(this.getWordTypeName(this.wordList[i]));
      this.wordTypes.push(this.getWordType(this.wordListLC[i]));
    }
  }

  /**
   * Get the implied context from the statement
   * @return {string} context
   */
  getImpliedContext() {
    const intent = new SentenceIntent(this.text);
    return intent.getContext();
  }

  /**
   * Get the implied intent from the statement
   *
   * @return {string} intent
   */
  getImpliedIntent() {
    const intent = new SentenceIntent(this.text);
    return intent.getIntent();
  }

  /**
   * Interpolate bracket notations with field substitutions
   * example "you want to talk to [contact]?"
   * would be "you want to talk to " + fields.contact + "?"
   * @param  {Object} state Current state
   *
   * @return {string}       Statement interpolated with substitutions
   */
  replaceBracketNotationWithStateFields(state) {
    const fields = state.fields;
    // attach statement level fields
    fields.context = state.context;
    fields.topic = state.topic;
    fields.intent = state.intent;

    const swapVarRegex = new RegExp(/\[(.*?)]/g);
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
    return this.wordListLC.length > 2
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
   * Statement has at least one adjective
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
   * Return the next word of a given type after the start word
   * @param  {string} startWord The word before the given type
   * @param  {string} nextType  The word type that we are looking for
   *
   * @return {string}           The word of the type we found or undefined
   */
  getNextWordOfTypeAfterWord(startWord, nextType) {
    const startIndex = this.wordListLC.indexOf(startWord.toLowerCase());
    const arrayLength = this.wordListLC.length;

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
    const startIndex = this.wordListLC.indexOf(startWord.toLowerCase()) + 1;

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
   * Get the words by type from the array
   * @param  {string}  wordType The word type in string notation
   * @param  {Boolean} strict   Be strict about the word type (i.e. VA ~ VB...)
   *
   * @return {array} Array of words of the given type
   */
  getWordsByType(wordType, strict) {
    const wordList = this.tagged.filter(function(word) {
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
