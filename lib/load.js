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

   Dynamic module loader

 */

'use strict';

module.exports = {
  // dynamicly pull in an client
  client: function(moduleName, debug) {
    let modulePath = '../client/' + moduleName;
    let module;
    try {
      module = require(modulePath);
    } catch (e) {
      if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
        debug && console.log('load: Client module ' + moduleName + ' not available');
      } else {
        // if the module has an error in it throw the error
        console.log('load: Client module ' + moduleName + ' has errors');
        throw e;
      }
      return undefined;
    }
    return module;
  },
  // dynamicly pull in an module
  module: function(moduleName, debug) {
    let modulePath = './../data/modules/' + moduleName;
    let module;
    try {
      module = require(modulePath);
    } catch (e) {
      if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
        debug && console.log('load: Module ' + modulePath + ' not available');
      } else {
        // if the module has an error in it throw the error
        console.log('load: Module ' + modulePath + ' has errors');
        throw e;
      }
      return undefined;
    }
    return module;
  },
};
