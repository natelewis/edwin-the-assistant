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

const validItemRoutes = /^\/(intents|topics)\/([a-z0-9-]+)$/;
const validListRoutes = /^\/(intents|topics)$/;

let _writeJSON = (type, item, json, callback) => {
  fs.writeFile('./data/' + type + '/' + item + '.json', json, callback);
};

let _readJSON = (type, item, callback) => {
  fs.readFile('./data/' + type + '/' + item + '.json', 'utf-8', callback);
};

let _itemExists = (type, item) => {
  return fs.existsSync('./data/' + type + '/' + item + '.json');
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

    api.get('/*', auth, function(req, res, next) {
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
            if (file.endsWith('.json')) {
              const itemName = file.replace(/\.json$/, '');
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
        _readJSON(type, item, function(err, data) {
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

          // set the id of the data if it's not new data
          const dataObj = JSON.parse(data);
          dataObj.id = item;

          // return the data
          res.send(JSON.stringify(dataObj));
        });
      } else {
        console.log('api: 404 from ' + lcUrl);
        res.status(404).send('Route Not found');
      }
    });

    api.put('/*', auth, function(req, res) {
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

        _writeJSON(
          type,
          item,
          JSON.stringify(req.body, null, '    '),
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

    api.post('/*', auth, function(req, res) {
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

        _writeJSON(
          type,
          item,
          JSON.stringify(req.body, null, '    '),
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
