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

const Intent = require('../intent.js');
const config = require('../config');
const fs = require('fs');
const basicAuth = require('basic-auth');

const lettersOnly = /^[a-z-]+$/;
const convFolder = './topic/';
const annotationFolder = './annotation/';
const intentFolder = './intent/';
const express = require('express');

let _readAnnotationJSON = function(annotation, callback) {
  fs.readFile(annotationFolder + annotation + '.json', 'utf-8', callback);
};

let _writeAnnotationJSON = function(annotation, json, callback) {
  fs.writeFile(annotationFolder + annotation + '.json', json, callback);
};

let _readTopicJSON = function(topic, callback) {
  fs.readFile(convFolder + topic + '.json', 'utf-8', callback);
};

let _writeTopicJSON = function(topic, json, callback) {
  fs.writeFile(convFolder + topic + '.json', json, callback);
};

let _readIntentJSON = function(intent, callback) {
  fs.readFile(intentFolder + intent + '.json', 'utf-8', callback);
};

let _writeIntentJSON = function(intent, json, callback) {
  fs.writeFile(intentFolder + intent + '.json', json, callback);
};

module.exports = (function() {
  'use strict';
  let api = new express.Router();

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

    api.get('/*', auth, function(req, res) {
      apihandler(req, res);
    });

    api.post('/*', auth, function(req, res) {
      apihandler(req, res);
    });
  } else {
    console.log('api: not enabled');
  }

  let apihandler = function(req, res) {

    console.log('api: ' + req.url);
    if (req.url === '/intents') {
      const intent = new Intent();

      intent.getList().then(function(intentList) {
        res.send(JSON.stringify(intentList));
      }, function(err) {
        res.status(404).send('Error accessing intents');
      });
    } else if (req.url === '/topics') {
      const fs = require('fs');
      let topics = [];
      fs.readdir(convFolder, (err, files) => {
        if (err) {
          res.status(404).send('Error accessing topics');
          return;
        }
        files.forEach((file) => {
          if (file.endsWith('.json')) {
            topics.push(file.replace(/\.json$/, ''));
          }
        });
        res.send(JSON.stringify(topics));
      });
    } else if (req.url.match(/^\/intent\//)) {
      // normalize and pull out the intent
      const intent = req.url.split(/\//)[2].toLowerCase();

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
    } else if (req.url.match(/^\/topic\//)) {
      // normalize and pull out the topic
      console.log(req);
      const topic = req.url.split(/\//)[2].toLowerCase();

      // make sure we only have letters here for sercurity reasons
      if (topic.match(lettersOnly)) {
        // get topic
        if (req.method === 'GET') {
          console.log('api: GET topic ' + topic);
          _readTopicJSON(topic, function(err, data) {
            if (err) {
              console.log(err);
              res.status(404).send('Topic not found');
              return;
            }
            res.send(data);
          });
        }

        // save topic
        if (req.method === 'POST') {
          console.log('api: POST topic ' + topic);
          _writeTopicJSON(
            topic,
            JSON.stringify(req.body, null, '    '),
            function(err) {
              if (err) {
                console.log(err);
                res.status(404).send('Topic not saved');
                return;
              }
              res.send('Topic saved');
            }
          );
        }
      } else {
        res.status(404).send('Not found');
      }
    } else if (req.url.match(/^\/annotation\//)) {
      // normalize and pull out the annotation
      const annotation = req.url.split(/\//)[2].toLowerCase();

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
        res.status(404).send('Annotation Not found');
      }
    } else {
      res.status(404).send('Route Not found');
    }
  };

  return api;
})();
