/* Edwin The Assistant

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

   Grooming functions for text shaping

 */

'use strict';

const pos = require('pos');
const lexer = new pos.Lexer();
const tagger = new pos.Tagger();

function Groom(text) {
  this.text = text;
  this.debug = false;

  // in case its called on something thats not
  if (typeof text === 'undefined') {
    text = '';
  }

  this.words = lexer.lex(text);
  this.wordsLC = lexer.lex(text.toLowerCase());
  this.tagged = tagger.tag(this.words);
}

Groom.prototype.processStatement = function(groomType) {
  // go through each one and groom it, if not return it back
  if (typeof (groomType) !== 'undefined') {
    if (groomType === 'confirm') {
      return this.confirmToTrue();
    }
    if (groomType === 'messagePayload') {
      return this.messagePayload();
    }
  }
  return this.text;
};

// message payload to send to something or someone
Groom.prototype.confirmToTrue = function() {
  // one before the start index
  if (this.text.match(/(yes|yea|yup|you bet|yep|sure|ok|o\.k|o\.\sk)/i)) {
    return 'true';
  }

  // nothing to change fall through with what we were given
  return 'false';
};

// message payload to send to something or someone
Groom.prototype.messagePayload = function() {
  // one before the start index

  let payload;
  if (typeof (this.wordsLC[0]) !== 'undefined' && this.wordsLC[0].match(/tell|say|let/)) {
    payload = this.words.slice(2, this.words.length).join(' ');

    // trim off know if it its in position 3 ( let him know message)
    if (typeof (this.wordsLC[2]) !== 'undefined' && this.wordsLC[2].match(/know/)) {
      payload = this.words.slice(3, this.words.length).join(' ');
    }

    // if its a she's/he's flip it to you're
    payload = payload.replace(/^(he ' s|she ' s) /i, 'you\'re ');

    // squeeze tics and return
    payload = payload.replace(/ ' /, '\'');

    // upcase the first word
    return payload.charAt(0).toUpperCase() + payload.slice(1);
  }

  // nothing to change fall through with what we were given
  return this.text;
};

module.exports = Groom;
