// if(!Bangle.bleAdvert)
//   Bangle.bleAdvert = {};
// Bangle.bleAdvert[0x180d] = undefined; // Advertise HRM
// NRF.setAdvertising(Bangle.bleAdvert);

NRF.setServices(
  {
    0x180d: {
      0x2a37: {
        value: [0, 0],
        // {
        //   flags: u8,
        //   bytes: [u8...]
        // }
        // flags {
        //   1 << 0: 16bit bpm
        //   1 << 1: sensor contact available
        //   1 << 2: sensor contact boolean
        //   1 << 3: energy expended, next 16 bits
        //   1 << 4: "rr" data available, u16s, intervals
        // }

        readable: true,
        notify: true,
        //indicate: true, // notify + ACK
      },
    },
    // 0x180f: {
    //   0x2a19: {
    //     value: [E.getBattery()],
    //     readable: true,
    //     notify: true,
    //   },
    // },
  },
  {
    advertise: ['180d'/*, '180f'*/]
  },
);

let last = Date.now();

const onHrm = hrm => {
  if (hrm.confidence < 60)
    return;

  let err;
  try {
    NRF.updateServices({
      0x180d: {
        0x2a37: {
          value: [0, hrm.bpm],
          notify: true,
        }
      }
    })
    err = '';
  } catch (e) {
    err = e.toString();
  }

  const now = Date.now();
  if (now - last > 1000){
    g
      .clearRect(Bangle.appRect)
      .setFont("6x8", 2)
      .drawString(`emit hrm (${hrm.bpm})`, 0, 48)
      .drawString(`err: "${err}"`, 0, 72)

    last = now;
  }
};

Bangle.on('HRM', onHrm);
Bangle.setHRMPower(1, 'sensible');

// let x = 40;
// setInterval(() => {
//   x += 1;
//   if (x > 65) x = 40;
//   onHrm({ bpm: x });
// }, 2000);

g
  .setFont("6x8")
  .setColor(g.theme.fg)
  .clearRect(Bangle.appRect)
  .drawString(`init`, 0, 24)

Bangle.loadWidgets();
Bangle.drawWidgets();
