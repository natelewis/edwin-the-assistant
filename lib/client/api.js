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

const config = require('../config');
const fs = require('fs');
const basicAuth = require('basic-auth');
const express = require('express');
const log = require('../logger');
const Edwin = require('../edwin');

let listenerStateStorage = {};

const validItemRoutes = /^\/(intents|topics|modules)\/([a-z0-9-]+)$/;
const validListRoutes = /^\/(intents|topics|modules)$/;

// get the filename from the type/item
const _fileName = (type, item) => {
  if (type === 'modules') {
    return './data/' + type + '/' + item + '.js';
  }
  return './data/' + type + '/' + item + '.json';
};

const _writeData = (type, item, data, callback) => {
  if (type === 'modules') {
    data = data.script;
  } else {
    data = JSON.stringify(data, null, '    ');
  }
  fs.writeFile(_fileName(type, item), data, callback);
};

const _readData = (type, item, callback) => {
  fs.readFile(_fileName(type, item), 'utf-8', callback);
};

const _itemExists = (type, item) => {
  return fs.existsSync(_fileName(type, item));
};

// Listener response callback
const _listenerRespondCallback = function(sss) {
  // create the response to send back
  const response = {
    session: sss.getSessionId(),
    final: sss.getFinal(),
    reply: sss.getReply(),
  };

  if (sss.getFinal() !== undefined) {
    console.log('api: (listener) >> ' + sss.getFinal() + ' (FINAL)');
    sss.reset();
    sss.save();

  } else {
    console.log('api: (listener) >> ' + sss.getReply());
  }

  // respond to the api respondant
  sss.getResponseObject().send(JSON.stringify(response));
};

module.exports = (function() {
  let api = new express.Router();

  let configAPI = config.get('api');
  if (configAPI.enabled) {
    console.log('api: online');

    // Synchronous auth
    let auth = (req, res, next) => {
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

    api.get('/*', auth, (req, res, next) => {
      const lcUrl = req.url.toLowerCase();
      if (lcUrl.match(validListRoutes)) {
        const type = lcUrl.split(/\//)[1];
        console.log('api: fetching ' + type);
        const fs = require('fs');
        let items = [];
        fs.readdir('./data/' + type, (err, files) => {
          if (err) {
            res.status(404).send('Error accessing ' + type);
            return;
          }
          files.forEach((file) => {
            if (file.endsWith('.json') || file.endsWith('.js')) {
              const itemName = file.replace(/\.(json|js)$/, '');
              const itemId = itemName;
              items.push({id: itemId, name: itemName});
            }
          });
          res.send(JSON.stringify(items));
        });
      } else if (lcUrl.match(validItemRoutes)) {
        const type = lcUrl.split(/\//)[1];
        const item = lcUrl.split(/\//)[2];
        console.log('api: fetching ' + type + ' ' + item);
        _readData(type, item, function(err, data) {
          if (err) {
            // not available send an empty one without an id
            if ( err.code === 'ENOENT' ) {
              res.send(JSON.stringify({[type.replace(/s$/, '')]: item}));
              return;
            } else {
              res.status(500).send(Error);
              return;
            }
          }

          let dataObj = {};
          if (type === 'modules') {
            dataObj.script = data;
          } else {
            // set the id of the data if it's not new data
            dataObj = JSON.parse(data);
          }

          dataObj.id = item;


          // return the data
          res.send(JSON.stringify(dataObj));
        });
      } else {
        console.log('api: 404 from ' + lcUrl);
        res.status(404).send('Route Not found');
      }
    });

    api.put('/*', auth, (req, res, next) => {
      const lcUrl = req.url.toLowerCase();
      if (lcUrl.match(validItemRoutes)) {
        const type = lcUrl.split(/\//)[1];
        const item = lcUrl.split(/\//)[2];
        console.log('api: saving ' + type + ' ' + item);

        // error checking
        if (!_itemExists(type, item)) {
          console.log('api: not saved, item not found');
          res.status(404).send(type + ' ' + item + ' not found');
          return;
        }
        _writeData(
          type,
          item,
          req.body,
          function(err) {
            if (err) {
              console.log(err);
              res.status(500).send(type + ' ' + item + ' not saved');
              return;
            }
            res.send(type + ' ' + item + ' saved');
          }
        );
      } else {
        console.log('api: 404 from ' + lcUrl);
        res.status(404).send('Route Not found');
      }
    });

    api.post('/listener', auth, (req, res, next) => {
      // set the state but if its new make a new one
      let state = listenerStateStorage[req.body.session];
      if (typeof(state) === 'undefined') {
        state = {};
      }

      console.log('api: (listener) << ' + req.body.statement);

      // process the conversation with the statement
      const edwin = new Edwin({
        sessionId: req.body.session,
        responseObject: res,
        callback: _listenerRespondCallback,
      });

      edwin.converse(req.body.statement, _listenerRespondCallback);
    });

    api.post('/*', auth, (req, res, next) => {
      const lcUrl = req.url.toLowerCase();
      if (lcUrl.match(validItemRoutes)) {
        const type = lcUrl.split(/\//)[1];
        const item = lcUrl.split(/\//)[2];
        console.log('api: saving ' + type + ' ' + item);

        // error checking
        if (_itemExists(type, item)) {
          console.log('api: not created, item already exists');
          res.status(400).send(type + ' ' + item + ' not created');
          return;
        }

        _writeData(
          type,
          item,
          req.body,
          function(err) {
            if (err) {
              console.log(err);
              res.status(500).send(type + ' ' + item + ' not saved');
              return;
            }
            res.send(type + ' ' + item + ' saved');
          }
        );
      } else {
        console.log('api: 404 from ' + lcUrl);
        res.status(404).send('Route Not found');
      }
    });
  } else {
    console.log('api: not enabled');
  }

  return api;
})();
