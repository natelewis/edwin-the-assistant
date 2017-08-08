'stirct';

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
    const fs = require('fs');
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
