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

   Conditional processing class

 */

'use strict';

/**
 * Conditional class
 * @class Conditional
 *
 * @example
 * let conditional = new Conditional(currentState);
 */
class Conditional {
  /**
   * Intent constructor created from an action
   * @constructs Conditional
   *
   * @param {Object} state object
   */
  constructor(state) {
    this.state = state;
  }

  /**
   * See if a conditinal passes requirements
   *
   * @param {Object} requirement object
   *
   * @return {Boolean} true if passed
   *
   * @example
   * let conditional = new Conditional(state);
   * if (conditional.passes(requirement) {
   *  console.log('Woot! I passed')
   * }
   */
  passes(requirement) {
    // make sure the requirement is a real thing
    // if its not, it just passes because we have nothing to fail against
    if (typeof(requirement) !== 'undefined') {
      // it is! lets process it
      for (let x = 0; x < requirement.length; x++) {
        let cond = requirement[x];

        if (cond.type === 'typeof') {
          if (cond.operator === '!==') {
            if (typeof(this.state[cond.field]) === cond.value) {
              return false;
            }
          }
          if (cond.operator === '===') {
            if (typeof(this.state[cond.field]) !== cond.value) {
              return false;
            }
          }
        }
      }
    }
    return true;
  }
}

module.exports = Conditional;
