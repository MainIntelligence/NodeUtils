//import {server as WebSocketServer} from 'websocket';
import WebSocket, {WebSocketServer} from 'ws'
import {mod0} from "./Module.mjs"

export default class WebSocketExt {
  constructor(httpsrv) {
     /*this.wssrv = new WebSocketServer({
       httpServer: httpsrv,
       autoAcceptConnections: false
     });*/
     this.wssrv = new WebSocketServer({server: httpsrv});
  };
  
  /*OnRequest(setup) {
    this.wssrv.on('request', function(req) {//req.reject();
      setup(req);
    })
  }*/
  OnRequest(setup) {
    this.wssrv.on('connection', (cnx, req) => {
      setup(cnx, req);
    });
  }
}

