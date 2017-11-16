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

   ngrok client

 */

'use strict';

const ngrok = require('ngrok');
const appConfig = require('../config');
const jsonfile = require('jsonfile');

const actionsTemplate = './edwin.json';
const actionsFile = './action.json';
const gaCLI = './gactions';
const gaProject = appConfig.get('googleAssistant.project');
const gaParams = `--action_package action.json --project ${gaProject}`;

// on hot reloding disconnect and kill the proxy
process.once('SIGUSR2', function() {
  console.log('ngrok: Disconnecting');
  ngrok.disconnect();
  ngrok.kill();
  process.kill(process.pid, 'SIGUSR2');
});

if (!appConfig.get('ngrok.enabled')) {
  console.log('ngrok: not enabled');
} else {
  ngrok.connect(appConfig.get('edwin.port'), function(err, url) {
    if (err) {
      console.log('ngrok: ', err);
    } else {
      console.log('ngrok: listening at ' + url);
      jsonfile.readFile(actionsTemplate, function(err, obj) {
        // update fulfillment url with ngrok url
        obj.conversations.edwin.url = url;
        jsonfile.writeFile(actionsFile, obj, {spaces: 2}, function(err) {
          if (err) {
            console.error(err);
          } else {
            // GoogleAssistant connector
            if (appConfig.get('googleAssistant.enabled')) {
              console.log('googleAssistant: publishing test action');
              const exec = require('child_process').exec;
              exec(`${gaCLI} update ${gaParams}`, (error, stdout, stderr) => {
                console.log(`googleAssistant: ${stdout}${stderr}`);
                if (error !== null) {
                  console.log(`exec error: ${error}`);
                }
              });
              exec(`${gaCLI} test ${gaParams}`, (error, stdout, stderr) => {
                console.log(`googleAssistant: ${stdout}${stderr}`);
                if (error !== null) {
                  console.log(`exec error: ${error}`);
                }
              });
            }
          }
        });
      });
    }
  });
}
