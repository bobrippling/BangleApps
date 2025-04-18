(function(back) {
  var FILE = "poweroff.json";
  var settings = Object.assign({
    showPrompt: true,
  }, require('Storage').readJSON(FILE, true) || {});

  function writeSettings() {
    require('Storage').writeJSON(FILE, settings);
  }

  //// Helper method which uses int-based menu item for set of string values
  //function stringItems(startvalue, writer, values) {
  //  return {
  //    value: (startvalue === undefined ? 0 : values.indexOf(startvalue)),
  //    format: v => values[v],
  //    min: 0,
  //    max: values.length - 1,
  //    wrap: true,
  //    step: 1,
  //    onchange: v => {
  //      writer(values[v]);
  //      writeSettings();
  //    }
  //  };
  //}
  //
  //// Helper method which breaks string set settings down to local settings object
  //function stringInSettings(name, values) {
  //  return stringItems(settings[name], v => settings[name] = v, values);
  //}

  var mainmenu = {
    "": {
      "title": "Poweroff"
    },
    "< Back": () => back(),
    "Show prompt": {
    value: (settings.showPrompt !== undefined ? settings.showPrompt : true),
    onchange: v => {
      settings.showPrompt = v;
      writeSettings();
    }
  }
  };
  E.showMenu(mainmenu);
})
