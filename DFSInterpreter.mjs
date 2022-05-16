
import AsyncInterpreter from "./cmdline.mjs";
import {mod0} from "./Module.mjs";
import {fxcommon} from "./ANSI.mjs";

export function Refresh (fsm, ents) {
   if (ents.length == 0) {
      mod0.LogFX(fxcommon.uberyellow, `Refreshing ${fsm.root}`);
      fsm.Refresh(); return;
   }
   for (const fsent of ents) {
      //Check issa directory quik hack
      if (fsent.lastIndexOf('/') >= fsent.lastIndexOf('.')) {
         fsm.Refresh('/' + fsent);
      }else {
         fsm.RefreshFile('/' + fsent);
      }
   }
}

export default class extends AsyncInterpreter {
  constructor(hashsize) {
    super(hashsize);
    this.fsms = [];
     
    //Define a refresh method allowing you to refresh the contents held in memory
    this.Define( "refresh", (ents) => {
       //Check if given an ID of the fsm to refresh
       if (ents.length == 0 || ents[0].match(/\d*/) != ents[0]) {
          if (this.fsms.length > 1) { 
             mod0.LogFX(fxcommon.uberyellow, 
               "`refresh` command without an id defaults to id = 0");
          }
          Refresh(this.fsms[0], ents);
       } else {//number given as first arg
          Refresh(this.fsms[Number(ents[0])], ents.slice(1));
       }
    });
  }
  
  Add(fsm) { this.fsms.push(fsm); }
}
