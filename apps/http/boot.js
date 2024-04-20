Bangle.http = (url, options) => {
  if (!NRF.getSecurityStatus().connected)
    return Promise.reject(/*LANG*/"Not connected to Bluetooth");

  if (!options) options = {};
  if (!Bangle.httpRequest) Bangle.httpRequest = {};

  if (options.id === undefined) {
    do {
      options.id = Math.random().toString().substr(2);
    } while (Bangle.httpRequest[options.id] !== undefined);
  }

  const req = {
    t: "http",
    url,
    id: options.id,
  };
  if (options.xpath) req.xpath = options.xpath;
  if (options.return) req.return = options.return; // for xpath
  if (options.method) req.method = options.method;
  if (options.body) req.body = options.body;
  if (options.headers) req.headers = options.headers;

  Bluetooth.println(JSON.stringify(req));

  return new Promise((r, j) => {
    Bangle.httpRequest[options.id] = {
      r,
      j,
      t: setTimeout(() => {
        delete Bangle.httpRequest[options.id];
        j("Timeout");
      }, options.timeout || 30000),
    };
  });
};

Bangle.httpResp = event => {
  if (!Bangle.httpRequest) return;

  const request = Bangle.httpRequest[event.id];
  if (!request) return;

  delete Bangle.httpRequest[event.id];

  if (request.t) clearTimeout(request.t);
  if (event.err)
    request.j(event.err);
  else
    request.r(event);
};
