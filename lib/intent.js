'stirct';

const jsonfile = require('jsonfile');
const path = require('path');
const fs = require('fs');

/**
 * Intent class
 * @class Intent
 *
 * @example
 * let intent = new Intent();
 */
class Intent {
  /**
   * Intent constructor.
   * @constructs Intent
   */
  constructor() {
    this.folder = './intent/';
  }

  /**
   * Get the intent object by passing an action.
   * @param {string} action
   *
   * @return {Promise} intent object
   *
   * @example
   * const intent = new Intent();
   * intent.getList().then( function(intentList) {
   *    console.log(intentList); // [ 'intenta', 'intentb' ]
   *  }, function(err) {
   *    console.log('error: ' + err);
   *  });
   */
  get(action) {
    let intentJSONFile = path.join(__dirname, '..', 'intent', action + '.json');
    return jsonfile.readFileSync(intentJSONFile);
    /*
    return new Promise(function(resolve, reject) {
      // check if json version is present
      if (fs.existsSync(intentJSONFile)) {
        resolve(jsonfile.readFileSync(intentJSONFile));
      } else {
        resolve(undefined);
      }
    });
    */
  }

  /**
   * Get the list of intents available
   *
   * @return {Promise} Array of intents as strings
   *
   * @example
   * const intent = new Intent();
   * intent.getList().then( function(intentList) {
   *    console.log(intentList); // [ 'intenta', 'intentb' ]
   *  }, function(err) {
   *    console.log('error: ' + err);
   *  });
   */
  getList() {
    let intentList = [];
    let folder = this.folder;

    return new Promise(function(resolve, reject) {
      fs.readdir(folder, (err, files) => {
        if (err) {
          reject(err);
        } else {
          files.forEach((file) => {
            if (file.endsWith('.json')) {
              intentList.push(file.replace(/\.json$/, ''));
            }
          });
          resolve(intentList);
        }
      });
    });
  }
}

module.exports = Intent;
