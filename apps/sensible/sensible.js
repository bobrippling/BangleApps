const SETTINGS_FILENAME = 'sensible.data.json';
const UPDATE_MILLISECONDS = 1000;
const APP_ADVERTISING_DATA = [
  0x12, // length of services
    0xff, // param: ?
    0x90,
    0x05,
    0x7b,
    0x6e,
    0x61,
    0x6d,
    0x65,
    0x3a,
    0x73,
    0x65,
    0x6e,

  0x73, // length of service data???
    0x69,
    0x62,
    0x6c,
    0x65,
    0x7d,
];


let acc, bar, hrm, mag;
let curMenu; // acc | bar | gps | hrm | mag | main
let settings = require('Storage').readJSON(SETTINGS_FILENAME);

const showMainMenu = () => {
  const onOff = b => b ? " (on)" : " (off)"

  const mainMenu = {
    "": { "title": "--  btadv  --" },
    "Acceleration":
      () => { E.showMenu(accMenu); curMenu = "acc"; },
    ["Barometer" + onOff(settings.isBarEnabled)]:
      () => { E.showMenu(barMenu); curMenu = "bar"; },
    ["GPS" + onOff(settings.isGpsEnabled)]:
      () => { E.showMenu(gpsMenu); curMenu = "gps"; },
    ["Heart Rate" + onOff(settings.isHrmEnabled)]:
      () => { E.showMenu(hrmMenu); curMenu = "hrm"; },
    ["Magnetometer" + onOff(settings.isMagEnabled)]:
      () => { E.showMenu(magMenu); curMenu = "mag"; },
    "Exit": load,
  };

  E.showMenu(mainMenu);
  curMenu = "main";
};

// Menus
const accMenu = {
  "": { "title" : "- Acceleration -" },
  "State": { value: "On (fixed)" },
  "x": { value: null },
  "y": { value: null },
  "z": { value: null },
  "<-": showMainMenu,
};
const barMenu = {
  "": { "title" : "-  Barometer   -" },
  "State": {
    value: settings.isBarEnabled,
    onchange: v => { updateSetting('isBarEnabled', v); }
  },
  "Altitude": { value: null },
  "Press": { value: null },
  "Temp": { value: null },
  "<-": showMainMenu,
};
const gpsMenu = {
  "": { "title" : "-      GPS     -" },
  "State": {
    value: settings.isGpsEnabled,
    onchange: v => { updateSetting('isGpsEnabled', v); }
  },
  "Lat": { value: null },
  "Lon": { value: null },
  "Altitude": { value: null },
  "Satellites": { value: null },
  "HDOP": { value: null },
  "<-": showMainMenu,
};
const hrmMenu = {
  "": { "title" : "-  Heart Rate  -" },
  "State": {
    value: settings.isHrmEnabled,
    onchange: v => { updateSetting('isHrmEnabled', v); }
  },
  "BPM": { value: null },
  "Confidence": { value: null },
  "<-": showMainMenu,
};
const magMenu = {
  "": { "title" : "- Magnetometer -" },
  "State": {
    value: settings.isMagEnabled,
    onchange: v => { updateSetting('isMagEnabled', v); }
  },
  "x": { value: null },
  "y": { value: null },
  "z": { value: null },
  "Heading": { value: null },
  "<-": showMainMenu,
};

const transmitUpdatedSensorData = () => {
  if (!Bangle.bleAdvert)
    Bangle.bleAdvert = {};

  const data = [ APP_ADVERTISING_DATA ]; // Always advertise at least app name

  if (bar) {
    data.push(encodeBarServiceData(bar));
    bar = undefined;
  }

  if (gps && gps.lat && gps.lon) {
    data.push(encodeGpsServiceData(gps));
    gps = undefined;
  }

  if (hrm) {
    Bangle.bleAdvert[0x180D] = undefined; // Advertise HRM

    data.push({ 0x2a37: [ 0, hrm.bpm ] });
    hrm = undefined;
  }

  if (mag) {
    data.push(encodeMagServiceData(mag));
    mag = undefined;
  }

  const interval = UPDATE_MILLISECONDS / data.length;

  NRF.setAdvertising(
    Bangle.bleAdvert,
    {
      interval,
    },
  );
};

// Encode the bar service data to fit in a Bluetooth PDU
const encodeBarServiceData = data => {
  const t = toByteArray(Math.round(data.temperature * 100), 2, true);
  const p = toByteArray(Math.round(data.pressure * 1000), 4, false);
  const e = toByteArray(Math.round(data.altitude * 100), 3, true);

  return [
      0x02, 0x01, 0x06,                               // Flags
      0x05, 0x16, 0x6e, 0x2a, t[0], t[1],             // Temperature
      0x07, 0x16, 0x6d, 0x2a, p[0], p[1], p[2], p[3], // Pressure
      0x06, 0x16, 0x6c, 0x2a, e[0], e[1], e[2]        // Elevation
  ];
};


// Encode the GPS service data using the Location and Speed characteristic
const encodeGpsServiceData = data => {
  const s = toByteArray(Math.round(1000 * data.speed / 36), 2, false);
  const lat = toByteArray(Math.round(data.lat * 10000000), 4, true);
  const lon = toByteArray(Math.round(data.lon * 10000000), 4, true);
  const e = toByteArray(Math.round(data.alt * 100), 3, true);
  const h = toByteArray(Math.round(data.course * 100), 2, false);

  return [
      0x02, 0x01, 0x06, // Flags
      0x14, 0x16, 0x67, 0x2a, 0x9d, 0x02, s[0], s[1], lat[0], lat[1], lat[2],
      lat[3], lon[0], lon[1], lon[2], lon[3], e[0], e[1], e[2], h[0], h[1]
                        // Location and Speed
  ];
};


// Encode the mag service data using the magnetic flux density 3D characteristic
const encodeMagServiceData = data => {
  const x = toByteArray(data.x, 2, true);
  const y = toByteArray(data.y, 2, true);
  const z = toByteArray(data.z, 2, true);

  return [
      0x02, 0x01, 0x06,                                          // Flags
      0x09, 0x16, 0xa1, 0x2a, x[0], x[1], y[0], y[1], z[0], z[1] // Mag 3D
  ];
};


// Convert the given value to a little endian byte array
const toByteArray = (value, numberOfBytes, isSigned) => {
  const byteArray = new Array(numberOfBytes);

  if(isSigned && (value < 0)) {
    value += 1 << (numberOfBytes * 8);
  }

  for(let index = 0; index < numberOfBytes; index++) {
    byteArray[index] = (value >> (index * 8)) & 0xff;
  }

  return byteArray;
};

const enableSensors = () => {
  Bangle.setBarometerPower(settings.isBarEnabled, "btadv");
  Bangle.setGPSPower(settings.isGpsEnabled, "btadv");
  Bangle.setHRMPower(settings.isHrmEnabled, "btadv");
  Bangle.setCompassPower(settings.isMagEnabled, "btadv");
};


// Update the given setting and write to persistent storage
const updateSetting = (name, value) => {
  settings[name] = value;
  require('Storage').writeJSON(SETTINGS_FILENAME, settings);
  enableSensors();
};


// Update acceleration
Bangle.on('accel', newAcc => {
  acc = newAcc;

  if(menu === "acc") {
    accMenu.x.value = acc.x.toFixed(2);
    accMenu.y.value = acc.y.toFixed(2);
    accMenu.z.value = acc.z.toFixed(2);
    E.showMenu(accMenu);
  }
});

// Update barometer
Bangle.on('pressure', newBar => {
  bar = newBar;

  if(menu === "bar") {
    barMenu.Altitude.value = bar.altitude.toFixed(1) + 'm';
    barMenu.Press.value = bar.pressure.toFixed(1) + 'mbar';
    barMenu.Temp.value = bar.temperature.toFixed(1) + 'C';
    E.showMenu(barMenu);
  }
});

// Update GPS
Bangle.on('GPS', newGps => {
  gps = newGps;

  if(menu === "gps") {
    gpsMenu.Lat.value = gps.lat.toFixed(4);
    gpsMenu.Lon.value = gps.lon.toFixed(4);
    gpsMenu.Altitude.value = gps.alt + 'm';
    gpsMenu.Satellites.value = gps.satellites;
    gpsMenu.HDOP.value = (gps.hdop * 5).toFixed(1) + 'm';
    E.showMenu(gpsMenu);
  }
});

// Update heart rate monitor
Bangle.on('HRM', newHrm => {
  hrm = newHrm;

  if(menu === "hrm") {
    hrmMenu.BPM.value = hrm.bpm;
    hrmMenu.Confidence.value = hrm.confidence + '%';
    E.showMenu(hrmMenu);
  }
});

// Update magnetometer
Bangle.on('mag', newMag => {
  mag = newMag;

  if(menu === "mag") {
    magMenu.x.value = mag.x;
    magMenu.y.value = mag.y;
    magMenu.z.value = mag.z;
    magMenu.Heading.value = mag.heading.toFixed(1);
    E.showMenu(magMenu);
  }
});


g.clear();
enableSensors();
showMainMenu();
setInterval(transmitUpdatedSensorData, UPDATE_MILLISECONDS);

Bangle.loadWidgets();
Bangle.drawWidgets();
