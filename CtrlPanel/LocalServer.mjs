
import ExtMimeHash from "./../ExtToMime.mjs"
import http from "http";
import fs from "fs";

function GetContents(f) { return fs.readFileSync(f, {encoding:"utf8"}); }
const mimeh = new ExtMimeHash(32);

export default class LocalServer {
   constructor(dnehandler) {
      const requesthandler = (req, rsp) => {
        //This server gives access to anything on the system with read access
        // so best check that only the user with the read access can use the server
        if (req.socket.remoteAddress != "::ffff:127.0.0.1") {
          console.log("DENIED", req.url, "to", req.socket.remoteAddress);
          rsp.writeHead(403);
          rsp.end("You tryna hack me bro? :'(");
          return;
        }
        
        let v = GetContents(req.url);
        if (v == null) {
          dnehandler(rsp);
        } else {
          //  -should we handle post request (use req.method) to quickly modify contents from browser?
          //  	-or let that be handled in websocket duplex connection  
          rsp.setHeader("content-type", mimeh.MimeType(req.url));
          rsp.setHeader("Access-Control-Allow-Origin", '*');
          rsp.writeHead(200);
          rsp.end(v);
        }
      }
      this.srv = http.createServer(requesthandler).listen(12345);
   }
};

const srv = new LocalServer(rsp => {
  console.log("oop");
  rsp.writeHead(400);
  rsp.end("No such resource");
});
