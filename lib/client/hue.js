/* Edwin The Assistant

   Copyright 2017 Nate Lewis

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   dstributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

   Phillips Hue interface for Edwin

 */

'use strict';

const HueAPI = require('node-hue-api');
const convict = require('convict');
const fs = require('fs');

const configFile = './hue.json';

/**
 * Phillips Hue interface
 *
 * @example
 * // turn off the bar lights
 * const Hue = require('../../lib/client/hue');
 * const hue = new Hue();
 * hue.connectToBridge()
 *  .then(() => hue.getGroups() )
 *  .then(() => hue.getIdByName('Bar') )
 *  .then((id) => hue.switchGroupLights(id, false) )
 *  .catch((response) => console.log(response));;
 *
 * @class Hue
 */
class Hue {
  /**
   * @constructs Hue
   * @param {Object} options  Hue configuration options
   */
  constructor(options) {
    const defaults = {
      appDescription: 'Node app',
    };

    // extend defaults
    options = Object.assign({}, defaults, options);

    // Peristent vars
    this.appDescription = options.appDescription;

    // load config
    this.config = convict({
      bridge: null,
      user: null,
      groups: [],
    });
    if (fs.existsSync(configFile)) {
      this.config.loadFile(configFile);
    }
  }

  /**
   * Api Getter
   *
   * @return {Object} Hue API object
   */
  get api() {
    return new HueAPI.api(this.config.get('bridge'), this.config.get('user'));
  }

  /**
   * Save the current Hue config
   */
  saveConfig() {
    fs.writeFileSync(configFile, JSON.stringify(this.config.get(), null, 2));
  }

  /**
   * Connect to the bridge.  This must be called before anything else in the
   * promise chain.
   *
   * @return {Promise} User or string error
   */
  connectToBridge() {
    if (this.config.get('bridge') && this.config.get('user')) {
      return Promise.resolve(this.config.get('user'));
    }
    console.log('connecting to bridge');
    return HueAPI
      .nupnpSearch()
      .then((bridges) => this.getBridgeIp(bridges))
      .then((bridge) => new HueAPI.api()
        .registerUser(bridge, this.appDescription)
        .then((user) => {
          console.log('connected');
          this.config.set('user', user);
          this.saveConfig();
          return Promise.resolve(user);
        })
        .catch(() => {
          return Promise.reject('Cannot link to your hue bridge, press the '
            + 'button on the bridge your trying connect and try again');
        })
      );
  }

  /**
   * Set the brightness of a group of lights, and turn them on if they are not
   * already on
   * @param  {number} [id=null]        Light group number from getIdByName()
   * @param  {number} [brightness=100] Brightness percent ( 0 is not off)
   *
   * @return {Promise} State of light
   */
  setGroupLightsBrightness(id = null, brightness = 100) {
    if ( !id ) {
      return Promise.reject('Not sure what lights those are');
    }
    return this.api.setGroupLightState(id, {'on': on}).brightness(brightness);
  }

  /**
   * Get the brightness of a group of lights
   * @param  {number} [id=null]        Light group number from getIdByName()
   *
   * @return {Promise} Brightness of light
   */
  getGroupLightsBrightnessAsync(id = null) {
    if ( !id ) {
      return Promise.reject('Not sure what lights those are');
    }
    return this.config.get('groups')[id].action.bri/255*100;
  }

  /**
   * Switch a group of lights on or off
   * @param  {number}  [id=null]  Number of the light group from getIdByName()
   * @param  {Boolean} [on=false] On = true, Off = false
   *
   * @return {Promise} State of light
   */
  switchGroupLights(id = null, on = false) {
    if ( !id ) {
      return Promise.reject('Not sure what lights those are');
    }
    return this.api.setGroupLightState(id, {'on': on});
  }

  /**
   * Get the list of groups available from the connected brid
   *
   * @return {Object} Array of light groups or string error
   */
  getGroups() {
    return this.api
      .groups()
      .then((groupData) => {
        this.config.set('groups', groupData);
        this.saveConfig();
        return groupData;
      })
      .catch(() => {
        return Promise.reject('Unable to reach your Hue bridge');
      });
  }

  /**
   * Look up what group number by the name of the group. getGroups must be
   * called before calling this function.
   * @param  {string} name Non case-sensitve name of group
   *
   * @return {number}      Number of light group or string error
   */
  getGroupIdByName(name) {
    const group = this.config.get('groups');
    for (const k in group) {
      if (group.hasOwnProperty(k)) {
        if (group[k].name.toLowerCase() == name.toLowerCase()) {
          return Promise.resolve(group[k].id);
        }
      }
    }
    // no match!
    return Promise.reject('Could not find lights named ' + name.toLowerCase());
  }

  /**
   * Find the bridges
   *
   * @return {Promise} list of bridges or string error
   */
  listBridges() {
    return hue
      .nupnpSearch()
      .then((bridges) => {
        return bridges;
      })
      .catch(() => {
        return Promise.reject('No bridge found on network');
      });
  }

  /**
   * [getBridgeIp description]
   * @param  {string} [bridges=null] Return the IP of the first bridge found
   *
   * @return {Promise}               Ip address or string error
   */
  getBridgeIp(bridges = null) {
    const self = this;
    console.log('getting ip');
    return new Promise(function(resolve, reject) {
      // currently only support 1 bridge, the first one it finds
      const bridge = bridges[0];
      if (bridge) {
        self.config.set('bridge', bridge.ipaddress);
        self.saveConfig();
        return resolve(bridge.ipaddress);
      }
      console.log('fail');
      return reject(`Can't find a Hue bridge on your network`);
    });
  }
}

module.exports = Hue;
