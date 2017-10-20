'use strict';

const sonos = require('sonos');
const State = require('../State');

const state = new State();
const search = sonos.search();

search.on('DeviceAvailable', function(device, model) {
  device.getZoneAttrs(function(err, zoneAttrs) {
    const zone = {
      name: zoneAttrs.CurrentZoneName,
      ip: device.host,
    };
    state.addSonosZone(zone);
    // const newDevice = new sonos.Sonos(device.host);
  });
});
