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

   API connection handler

 */

'use strict';
var fs = require('fs');

function Api (text) {
    this.intentFolder = './intent/';
}

Api.prototype.handler = function (req, res) {
    if (req.url === '/api/intents') {
        const fs = require('fs');
        var intents = [];
        fs.readdir(this.intentFolder, (err, files) => {
            if (err) {
                res.status(404).send('Error accessing intents');
                return;
            }
            files.forEach(file => {
                if (file.endsWith('.json')) {
                    intents.push(file.replace(/\.json$/, ''));
                }
            });
            console.log(intents);
            res.send(JSON.stringify(intents));
        });
        console.log(req);
    } else if (req.url.match(/^\/api\/intent\//)) {
        // normalize and pull out the intent
        const intent = req.url.split(/\//)[3].toLowerCase();

        // make sure we only have letters here for sercurity reasons
        var lettersOnly = /^[a-z]+$/;
        if (intent.match(lettersOnly)) {
            // get intent
            if (req.method === 'GET') {
                console.log('api: GET intent ' + intent);
                this._readIntentJSON(intent, function (err, data) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Intent not found');
                        return;
                    }
                    res.send(data);
                });
            }

            // save intent
            if (req.method === 'POST') {
                console.log('api: POST intent ' + intent);
                this._writeIntentJSON(intent, JSON.stringify(req.body, null, '    '), function (err) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Intent not saved');
                        return;
                    }
                    res.send('Intent saved');
                });
            }
        } else {
            res.status(404).send('Not found');
        }
    }
};

Api.prototype._readIntentJSON = function (intent, callback) {
    fs.readFile(this.intentFolder + intent + '.json', 'utf-8', callback);
};

Api.prototype._writeIntentJSON = function (intent, json, callback) {
    fs.writeFile(this.intentFolder + intent + '.json', json, callback);
};

module.exports = Api;