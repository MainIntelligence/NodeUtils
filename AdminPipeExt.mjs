//Modules use these exports by default, redirecting server errors to admin client
//	wsshandler in WebSocketExtend automatically detects if localhost (admin) connects
//	and modules just start redirecting their output there.

import WebSocketExt from "./WebSocketExt.mjs";
import Hash from "./Hash.mjs";
import {mod0} from "./Module.mjs";
import {ServerTransceiver} from "./CtrlPanel/AdminProtocol.mjs"
import {fxcommon} from "./ANSI.mjs"

let cliHash = new Hash(10);
let trans;
let admin;
let id = 3;

export default function WebSocketExtend(host, httpsrv) {
   let ws = new WebSocketExt(httpsrv);
   ws.OnRequest(wsshandler(host));
}

export function SendError(msg, efx=fxcommon.clear) {
   if (!admin) { return false; }
   trans.Send(msg, [2,efx.code]);
   return true;
};

//Use this for debug type stuff
export function SendInfo(msg, efx=fxcommon.clear) {
   if (!admin) { return false; }
   trans.Send(msg, [1,efx.code]);
   return true;
};

export function SendLog(msg, efx=fxcommon.clear) {
   if (!admin) { return false; }
   trans.Send(msg, [0,efx.code]);
   return true;
};

let adminInputHandler;

export function SetInputHandler(handler) {
   adminInputHandler = handler;
};

const NewPipe = (c, id, title) => {
  trans.Send(title, [id,fxcommon.clear]);
  c.on('message', function(message) {
    trans.Send(message, [id,fxcommon.clear]); //admin.sendUTF(message.utf8Data);
  });
  cliHash.Add(id, c);
}

//When admin messages, message prepended with id in array


const SetAdmin = (cnx, req) => {
  //admin = cnx.accept('', req.origin);
  admin = cnx;
  trans = ServerTransceiver(admin);
  admin.on('message', (data, isBinary) => {
    if (!isBinary) {
      mod0.Log("UTF8 NOT SUPPORTED AdminPipeExt.mjs");
    } else {
      data = new Uint8Array(data).buffer;
      let str = trans.Str(data);
      let codes = trans.Codes(data, 0);
      let modid = codes[0];
      //console.log("**Length:", str.length);
      if (modid == 0) {
        if (!adminInputHandler) { return; }
        adminInputHandler(str);
      } else if (modid >= 3) {
        cliHash.Value(modid).sendUTF(str);
      }
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

const SetClient = (cnx, req) => {
  //let client =  cnx.accept('', req.origin);
  NewPipe(cnx, id, req.socket.remoteAddress);
  cnx.on('close', function(reasonCode, description) {
    if (admin) {
      trans.Send("Client left the chat", [id, fxcommon.red]);
    }
  });
  id++;
}
/*
const SetBusy = (req) => {
  let cli = req.accept('', req.origin);
  cli.sendUTF("Admin too busy, come back later!");
}*/

const wsshandler = (host) => {
  return ((cnx, req) => {
   let origin = req.origin;
   if (req.socket.remoteAddress == "::ffff:127.0.0.1") {
     SetAdmin(cnx, req);
   }
   else if (origin == "https://" + host) {
     //if (client) { SetBusy(req); return; }
     SetClient(cnx, req);
   }
   else { cnx.reject(); }
  });
};
