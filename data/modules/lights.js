'use strict';
const Hue = require('./../../lib/client/hue');
const hue = new Hue();

const turnBrightnessUp = (hue, id) => {
  const brightness = hue.getGroupLightsBrightnessAsync(id);
  brightness += 25;
  if (brightness > 100) {
    brightness = 100;
  }
  return hue.setGroupLightsBrightness(id, brightness);
};

const turnBrightnessDown = (hue, id) => {
  const brightness = hue.getGroupLightsBrightnessAsync(id);
  brightness -= 25;
  if (brightness < 0) {
    brightness = 0;
  }
  return hue.setGroupLightsBrightness(id, brightness);
};

const turnOn = (hue, id) => {
  return hue.switchGroupLights(id, true);
};

const turnOff = (hue, id) => {
  return hue.switchGroupLights(id, false);
};

const setBrightness = (hue, id, brightness) => {
  return hue.setGroupLightsBrightness(id, parseInt(brightness));
};

module.exports = {run: function(state, config) {
  return new Promise(function(resolve, reject) {
    hue.connectToBridge().then(() => hue.getGroups()).then((groups) => {
      const statement = state.getStatement();

      // if there is a follow up question, this was the original intent to sonos
      if (state.getField('lightsAction') === undefined) {
        state.setField('lightsAction', statement);
      }

      // figure out what zone we are going to talk to
      let currentGroup = undefined;

      // check to see if the zone was said in the statment
      for (let i = 0; i < groups.length; i++) {
        const re = new RegExp(groups[i].name, 'gi');
        if (statement.match(re)) {
          currentGroup = groups[i].id;
        }
      }

      if ( !currentGroup ) {
        return state.setReply('What room?');
      } else {
        // turn off
        if (statement.match(/(off)/i)) {
          turnOff(hue, currentGroup).then(() => {
            return resolve(state.setFinal(''));
          });
        }

        // turn on
        if (statement.match(/(on)/i)) {
          turnOn(hue, currentGroup).then(() => {
            state.setFinal('');
            return resolve(state.setFinal(''));
          });
        }

        // turn down default 25 percent
        if (statement.match(/(down|lower|dim)/i)) {
          turnBrightnessDown(hue, currentGroup).then(() => {
            state.setFinal('');
            return resolve(state.setFinal(''));
          });
        }

        // turn up default 25 percent
        if (statement.match(/(up|higher|raise|brighter)/i)) {
          turnBrightnessUp(hue, currentGroup).then(() => {
            state.setFinal('');
            return resolve(state);
          });
        }
      }
    }).catch((response) => {
      return resolve(state.setFinal(response));
    });
  });
}};
