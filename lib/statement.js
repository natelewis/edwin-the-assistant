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
const Words = require('./words');
const pos = require('pos');
const lexer = new pos.Lexer();
const tagger = new pos.Tagger();

function Statement (text) {
    this.text = text;
    this.debug = false;

    // in case its called on something thats not
    if (typeof text === 'undefined') {
        text = '';
    }

    this.wordsLC = lexer.lex(text.toLowerCase());
    this.wordsTypes = lexer.lex(text.toLowerCase());
    this.tagged = tagger.tag(lexer.lex(text));

    var words = new Words(this.text);
    this.wordTypeNames = words.wordTypeNames;
    this.wordTypes = words.wordTypes;

    // process the statement
    this._processStatement();
}

// get the logical action and its context of the statement
Statement.prototype._processStatement = function () {
    // array of words in lower case
    var wlc = this.wordsLC;
    var words = new Words(this.text);

    if (wlc.length < 2) {
        // its only one word
        this.context = wlc[0];
        this.action = wlc[0];
        this.debug && console.log('statement: action match "' + this.action + '" - one word statement with the context of ' + this.context);
        return this.action; 
    }
    
    if (wlc.length > 2 && (wlc[0] === 'can' || wlc[0] === 'will')) {
        // starts with will/can
        this.context = words.getNextWordOfTypeAfterWord(wlc[2], 'NNP', this.debug);
        this.action = wlc[2];
        this.debug && console.log('statement: action match "' + this.action + '" - starts with can/will with the context of ' + this.context);
        return this.action; 
    } 
    
    if (this.wordTypes[0] === 'VB') {
        // first word is a verb
        this.context = words.getNextWordOfTypeAfterWord(wlc[0], 'NN', this.debug);
        // try NN if NNP doesn't work
        if (typeof (this.context) === 'undefined') {
            this.context = words.getNextWordOfTypeAfterWord(wlc[0], 'NNP', this.debug);
        }
        this.action = wlc[0];
        this.debug && console.log('statement: action match "' + this.action + '" - first word in sentence is a verb with the context of ' + this.context);
        return this.action; 
    } 
    
    if (wlc.length > 2 && (this.wordTypes[0] === 'NN' && this.wordTypes[1].match(/DT/))) {
        // first word is noun followed by another noun
        this.context = wlc[2];
        this.action = wlc[0];
        this.debug && console.log('statement: action match "' + this.action + '" - starts with nown followed by DT with context of ' + this.context);
        return this.action; 
    } 
    
    if (wlc.length > 1 && (this.wordTypes[0] === 'NN' && this.wordTypes[1].match(/NN/))) {
        // first word is noun followed by another noun
        this.context = wlc[1];
        this.action = wlc[0];
        this.debug && console.log('statement: action match "' + this.action + '" - starts with nown followed by NNP with context of ' + this.context);
        return this.action; 
    } 
    
    if (wlc.length > 2 && (this.wordTypes[0] === 'NN' && this.wordTypes[1] === 'TO')) {
        // first word is noun followed by TO
        this.context = wlc[2];
        this.action = wlc[0];
        this.debug && console.log('statement: action match "' + this.action + '" - starts with nown followed by TO with context of ' + this.context);
        return this.action; 
    } 
    
    if (words.getWordsByType(this.tagged, 'W').length > 0) {
        // First action
        this.action = words.getWordsByType(this.tagged, 'W')[0];
        this.debug && console.log('statement: action match "' + this.action + '" - first action');
        return this.action; 
    } 
    
    if (words.getWordsByType(this.tagged, 'VB', true).length > 0) {
        // first verb
        var action = words.getWordsByType(this.tagged, 'VB', true)[0];

        // plase is a verb, lets not use it though
        if ( action.toLowerCase() !== 'please') {
            this.action = words.getWordsByType(this.tagged, 'VB', true)[0];
            this.debug && console.log('statement: action match "' + this.action + '" - first verb');
            return this.action;
        } 
    } 
   
    if (words.getWordsByType(this.tagged, 'NN').length > 0 && words.getWordsByType(this.tagged, 'IN').length > 0) {
        // Prop & nown
        this.action = words.getWordsByType(this.tagged, 'NN')[0];
        this.debug && console.log('statement: action match "' + this.action + '" - proposition & nown, nown action');
        return this.action; 
    } 
    
    if (words.getWordsByType(this.tagged, 'JJ').length > 0) {
        // adjective?
        this.action = words.getWordsByType(this.tagged, 'JJ')[0];
        // try NN for context
        this.context = words.getNextWordOfTypeAfterWord(this.action, 'NN', this.debug);
        // try NN if NNP doesn't work
        if (typeof (this.context) === 'undefined') {
            this.context = words.getNextWordOfTypeAfterWord(this.action, 'NNP', this.debug);
        }
        this.debug && console.log('statement: action match "' + this.action + '" with the context of ' + this.context);
        return this.action; 
    }

    return this.action;
};

module.exports = Statement;
