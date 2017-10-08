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

   Topic object class

 */
const Words = require('./words');
const Topic = require('./Topic');
const State = require('./State');
const Statement = require('./Statement');
const Groom = require('./Groom');

/**
 * Annotation class
 */
class Annotation {
  /**
   * [setFieldAnnotation description]
   */
  setFieldAnnotations() {
    const sss = new State();
    const topic = new Topic(sss.getTopic());
    const annotation = topic.getAnnotations();
    const words = new Words(sss.getStatement());

    for (let a = 0; a < annotation.length; a++) {
      let rule = annotation[a];

      // substitution can be in start words and such
      let startWordStatement = new Statement(rule.startWord);
      rule.startWord = startWordStatement.replaceFields(sss.fields);

      if (sss.getField(rule.field) === undefined && rule.startWord !== '') {
        // Process Next Word Of Type
        if (rule.type === 'nextWordOfType') {
          if (sss.getField(rule.field) === undefined) {
            sss.setField(rule.field,
              words.getNextWordOfTypeAfterWord(
                rule.startWord,
                rule.wordType,
                this.debug
              )
            );
          }
        }

        // Process everythingAfterWord
        if (rule.type === 'everythingAfterWord') {
          if (sss.getField(rule.field) === undefined) {
            sss.setField(rule.field,
              words.getEverythingAfterWord(
                rule.startWord
              )
            );
          }
        }

        // groom if needed
        let groomer = new Groom(sss.getField(rule.field));
        sss.setField(rule.field, groomer.processStatement(rule.groom));
      }
    }
  }
}

module.exports = Annotation;
