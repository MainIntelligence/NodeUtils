
export default class WSClient {

constructor(scheme, host, port) {
  this.scheme = scheme;
  this.host = host;
  this.port = port;
  this.sock;
}

Open() { this.sock = new WebSocket(this.scheme + '://' + this.host + ':' + this.port); } 
Close() { this.sock.close(); }
Send(d) { this.sock.send(d); }
//event.data with message
OnOpen(handler) { this.sock.addEventListener('open', eventhandler); }
OnRecv(eventhandler) { this.sock.addEventListener('message', eventhandler); }
OnClosed(handler) { this.sock.addEventListener('close', handler); }
OnError(handler) { this.sock.addEventListener('error', handler); }

}
