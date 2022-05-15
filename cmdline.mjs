import Hash from "./Hash.mjs";
import {mod0} from "./Module.mjs";

export default class {
   constructor(hashsize, ...args) {
      this.funchash = new Hash(hashsize);
      for(let i = 0; i != args.length; i++ ) {
         this.Define(args[i++], args[i]);
      }
      this.Execute();
   }
   Define( name, func ) {
      if (this.funchash.Value(name) != null) {
         mod0.LogErr("Tried to define function ("+name+") that is already defined");
         return;
      }
      this.funchash.Add(name, func);
   }
   Execute( ) {
      process.stdin.on("readable", () => {
         let input = "";
         let chunk;
         while((chunk = process.stdin.read()) !== null) {
            input += chunk;
         }
         input = input.slice(0, input.length - 1); //slice off newline
         const ents = input.split(" ").filter( str => (str.length != 0) );
         if (ents.length == 0) { return; }
         
         let func = this.funchash.Value(ents[0]);
         if (func == null) { mod0.LogErr("command unrecognized"); return; }
         func(ents.slice(1));
      })
   }
   //Just here so that you can set your own callback to detect when input is sent
   AddInputEvent(func) {
      process.stdin.on("readable", func);
   }
}
