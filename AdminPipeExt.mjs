//Modules use these exports by default, redirecting server errors to admin client
//	wsshandler in WebSocketExtend automatically detects if localhost (admin) connects
//	and modules just start redirecting their output there.

import WebSocketExt from "./WebSocketExt.mjs";
import Hash from "./Hash.mjs";

let cliHash = new Hash(10);

let admin;
let id = 3;

export default function WebSocketExtend(host, httpsrv) {
   let ws = new WebSocketExt(httpsrv);
   ws.OnRequest(wsshandler(host));
}

export function SendError(msg) {
   if (!admin) { return false; }
   admin.send([2, msg]);
   return true;
};

//Use this for debug type stuff
export function SendInfo(msg) {
   if (!admin) { return false; }
   admin.send([1, msg]);
   return true;
};

export function SendLog(msg) {
   if (!admin) { return false; }
   admin.send([0, msg]);
   return true;
};

let adminInputHandler;

export function SetInputHandler(handler) {
   adminInputHandler = handler;
};

const NewPipe = (c, id) => {
  admin.send([id, c.remoteAddress]);
  c.on('message', function(message) {
    admin.send([id, message.utf8Data]); //admin.sendUTF(message.utf8Data);
  });
  cliHash.Add(id, c);
  id++;
}

//When admin messages, message prepended with id in array


const SetAdmin = (req) => {
  admin = req.accept('', req.origin);
  admin.on('message', (msg) => {
    if (msg.type == "utf8") {
      let str = msg.utf8Data;
      let ib = str.indexOf(',');
      let vs = [ str.split(0, ib), str.split(ib + 1) ];
    
      if (Number(vs[0]) == 0) { //writing to stdin? server commands?
         if (!adminInputHandler) { return; }
         adminInputHandler(msg);
      }else if (vs[0] >= 3) {
         cliHash.Value(vs[0]).sendUTF(vs[1]);
      }
    } else {
      mod0.LogErr("Non utf8 message type received:", msg);
    }
  });
  /*
  admin.on('close', function(reasonCode, description) {
    if (client) {
      client.sendUTF("Admin has left the chat");
    }
    admin = null;
  });*/
}

const SetClient = (req) => {
  let client =  req.accept('', req.origin);
  NewPipe(client, id);
  client.on('close', function(reasonCode, description) {
    if (admin) {
      admin.send([id,"Client left the chat"]);
    }
  });
}
const SetBusy = (req) => {
  let cli = req.accept('', req.origin);
  cli.sendUTF("Admin too busy, come back later!");
}

const wsshandler = (host) => {
  return ((req) => {
   let origin = req.origin;
   if (origin == "null") {
     SetAdmin(req);
   } 
   else if (origin == "https://" + host) {
     if (client) { SetBusy(req); return; }
     SetClient(req);
   }
   else { req.reject(); }
  });
};
