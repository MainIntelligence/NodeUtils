import {server as WebSocketServer} from 'websocket';
import {mod0} from "./Module.mjs"

export default class WebSocketExt {
  constructor(httpsrv) {
     this.wssrv = new WebSocketServer({
       httpServer: httpsrv,
       autoAcceptConnections: false
     });
  };
  
  OnRequest(setup) {
    this.wssrv.on('request', function(req) {//req.reject();
      setup(req);
    })
  }
}

