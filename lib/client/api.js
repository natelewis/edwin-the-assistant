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

const Intent = require('../intent.js');
const config = require('../config');
const fs = require('fs');
const basicAuth = require('basic-auth');

const lettersOnly = /^[a-z-]+$/;
const conversationFolder = './conversation/';
const annotationFolder = './annotation/';

module.exports = function(app) {
  let configAPI = config.get('api');
  if (configAPI.enabled) {
    console.log('api: online');

    // Synchronous auth
    let auth = function(req, res, next) {
      let user = basicAuth(req);
      if (!user || !user.name || !user.pass) {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(401);
        return;
      }

      if (user.name === configAPI.username &&
          user.pass === configAPI.password) {
        next();
      } else {
        res.set('WWW-Authenticate', 'Basic realm=Authorization Required');
        res.sendStatus(401);
        return;
      }
    };

    app.get('/api/*', auth, function(req, res) {
      apihandler(req, res);
    });

    app.post('/api/*', auth, function(req, res) {
      apihandler(req, res);
    });
  } else {
    console.log('api: not enabled');
  }
  return app;
};

let apihandler = function(req, res) {
  if (req.url === '/api/intents') {
    const intent = new Intent();

    intent.getList().then(function(intentList) {
      res.send(JSON.stringify(intentList));
    }, function(err) {
      res.status(404).send('Error accessing intents');
    });
  } else if (req.url === '/api/conversations') {
    const fs = require('fs');
    let conversations = [];
    fs.readdir(conversationFolder, (err, files) => {
      if (err) {
        res.status(404).send('Error accessing conversations');
        return;
      }
      files.forEach((file) => {
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
        _readIntentJSON(intent, function(err, data) {
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
        _writeIntentJSON(
          intent,
          JSON.stringify(req.body, null, '    '),
          function(err) {
            if (err) {
              console.log(err);
              res.status(404).send('Intent not saved');
              return;
            }
            res.send('Intent saved');
          }
        );
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
        _readConversationJSON(conversation, function(err, data) {
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
        _writeConversationJSON(
          conversation,
          JSON.stringify(req.body, null, '    '),
          function(err) {
            if (err) {
              console.log(err);
              res.status(404).send('Conversation not saved');
              return;
            }
            res.send('Conversation saved');
          }
        );
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
        _readAnnotationJSON(annotation, function(err, data) {
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
        _writeAnnotationJSON(
          annotation,
          JSON.stringify(req.body, null, '    '),
          function(err) {
            if (err) {
              console.log(err);
              res.status(404).send('Annotation not saved');
              return;
            }
            res.send('Annotation saved');
          }
        );
      }
    } else {
      res.status(404).send('Not found');
    }
  }
};

let _readAnnotationJSON = function(annotation, callback) {
  fs.readFile(annotationFolder + annotation + '.json', 'utf-8', callback);
};

let _writeAnnotationJSON = function(annotation, json, callback) {
  fs.writeFile(annotationFolder + annotation + '.json', json, callback);
};

let _readConversationJSON = function(conversation, callback) {
  fs.readFile(conversationFolder + conversation + '.json', 'utf-8', callback);
};

let _writeConversationJSON = function(conversation, json, callback) {
  fs.writeFile(conversationFolder + conversation + '.json', json, callback);
};

let _readIntentJSON = function(intent, callback) {
  fs.readFile(intentFolder + intent + '.json', 'utf-8', callback);
};

let _writeIntentJSON = function(intent, json, callback) {
  fs.writeFile(intentFolder + intent + '.json', json, callback);
};
