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

const lettersOnly = /^[a-z-]+$/;

function Api (text) {
    this.intentFolder = './intent/';
    this.conversationFolder = './conversation/';
    this.annotationFolder = './annotation/';
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
            res.send(JSON.stringify(intents));
        });
    } else if (req.url === '/api/conversations') {
        const fs = require('fs');
        var conversations = [];
        fs.readdir(this.conversationFolder, (err, files) => {
            if (err) {
                res.status(404).send('Error accessing conversations');
                return;
            }
            files.forEach(file => {
                if (file.endsWith('.json')) {
                    conversations.push(file.replace(/\.json$/, ''));
                }
            });
            res.send(JSON.stringify(conversations));
        });
    } else if (req.url.match(/^\/api\/intent\//)) {
        // normalize and pull out the intent
        const intent = req.url.split(/\//)[3].toLowerCase();

        // make sure we only have letters here for sercurity reasons
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
    } else if (req.url.match(/^\/api\/conversation\//)) {
        // normalize and pull out the conversation
        const conversation = req.url.split(/\//)[3].toLowerCase();

        // make sure we only have letters here for sercurity reasons
        if (conversation.match(lettersOnly)) {
            // get conversation
            if (req.method === 'GET') {
                console.log('api: GET conversation ' + conversation);
                this._readConversationJSON(conversation, function (err, data) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Conversation not found');
                        return;
                    }
                    res.send(data);
                });
            }

            // save conversation
            if (req.method === 'POST') {
                console.log('api: POST conversation ' + conversation);
                this._writeConversationJSON(conversation, JSON.stringify(req.body, null, '    '), function (err) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Conversation not saved');
                        return;
                    }
                    res.send('Conversation saved');
                });
            }
        } else {
            res.status(404).send('Not found');
        }
    } else if (req.url.match(/^\/api\/annotation\//)) {
        // normalize and pull out the annotation
        const annotation = req.url.split(/\//)[3].toLowerCase();

        // make sure we only have letters here for sercurity reasons
        if (annotation.match(lettersOnly)) {
            // get annotation
            if (req.method === 'GET') {
                console.log('api: GET annotation ' + annotation);
                this._readAnnotationJSON(annotation, function (err, data) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Annotation not found');
                        return;
                    }
                    res.send(data);
                });
            }

            // save annotation
            if (req.method === 'POST') {
                console.log('api: POST annotation ' + annotation);
                this._writeAnnotationJSON(annotation, JSON.stringify(req.body, null, '    '), function (err) {
                    if (err) {
                        console.log(err);
                        res.status(404).send('Annotation not saved');
                        return;
                    }
                    res.send('Annotation saved');
                });
            }
        } else {
            res.status(404).send('Not found');
        }
    }
};

Api.prototype._readAnnotationJSON = function (annotation, callback) {
    fs.readFile(this.annotationFolder + annotation + '.json', 'utf-8', callback);
};

Api.prototype._writeAnnotationJSON = function (annotation, json, callback) {
    fs.writeFile(this.annotationFolder + annotation + '.json', json, callback);
};

Api.prototype._readConversationJSON = function (conversation, callback) {
    fs.readFile(this.conversationFolder + conversation + '.json', 'utf-8', callback);
};

Api.prototype._writeConversationJSON = function (conversation, json, callback) {
    fs.writeFile(this.conversationFolder + conversation + '.json', json, callback);
};

Api.prototype._readIntentJSON = function (intent, callback) {
    fs.readFile(this.intentFolder + intent + '.json', 'utf-8', callback);
};

Api.prototype._writeIntentJSON = function (intent, json, callback) {
    fs.writeFile(this.intentFolder + intent + '.json', json, callback);
};

module.exports = Api;
