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

   Dynamic module loaders

 */

'use strict';

module.exports = {

    // dynamicly pull in the intent
    intent: function (intentName, context, debug) {
        // try this one first
        var modulePath = '../intent/' + intentName;

        // add the context if we know it
        if (typeof (context) !== 'undefined') {
            modulePath += '-' + context;
        }

        // look for the file module if we didn't get a json one
        try {
            var module = require(modulePath);
        } catch (e) {
            if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
                debug && console.log('load: Intent ' + intentName + ' not available');

                // try just base module if it can in case we have bad context
                if (typeof (context) !== 'undefined') {
                    return this.intent(intentName, undefined, debug);
                }
            } else {
                console.log('load: Intent ' + intentName + ' has errors');
                throw e;
            }
            return undefined;
        }
        return module;
    },
    // dynamicly pull in an module
    module: function (moduleName, debug) {
        var modulePath = '../module/' + moduleName;

        try {
            var module = require(modulePath);
        } catch (e) {
            if (e instanceof Error && e.code === 'MODULE_NOT_FOUND') {
                debug && console.log('load: Module ' + moduleName + ' not available');
            } else {
                console.log('load: Module ' + moduleName + ' has errors');
                throw e;
            }
            return undefined;
        }
        return module;
    }
};
