
import fs from "fs";
//mh is static interfaced only by Modules, mod0 gives a module for internals of the system

//Module utilities
//	for working with multiple, mostly independent apps in one interface
function TextReduce(args) {
   return args.reduce((str0, str1) => str0 + ' ' + str1);
}
function Div(x, d) {
   return Math.trunc(x / d);
}
function Red(text) {
   return "\x1B[31m" + text + "\x1B[0m";
}
function Ident(x) { return x; }


//ModuleHandler: has an array with 
class ModuleHandler {
  constructor() {
    process.stdout.write("\x1Bc");
    this.totalmodules = 0;
    this.cheight = process.stdout.rows; //row 0 is reserved for commands
    this.cwidth = process.stdout.columns;
    this.cwidthper = Div(this.cwidth, 2);
    this.msgstack = [[],[]];
    
    process.stdout.on('resize', (() => {
      this.cheight = process.stdout.rows;
      this.cwidth = process.stdout.columns;
      this.cwidthper = Div(this.cwidth, 2);
      this.Fix();
    }));
    
    this.GotoInputPoint();
  }
  
  NewModuleID() { return this.totalmodules++; }
  //To simplify the variables: indices [0 => cheight-1] => ids [-1 => cheight-2]
  InputLine() { return -1; }
  OutputLineBegin() { return 0; }
  OutputLineEnd() { return this.cheight - 1; }
  //c=0 in [0, cwidthper-1], c=1 in [cwidthper, cwidth - 1]
  //	   len(0) = cwidthper, len(1) = cwidth - cwidthper = cwidthper + (cwidth%2==0)?1:0;
  Go(r,c) { return "\x1B[" + (this.cheight - 2 - r) + ";" + (c * this.cwidthper + 1) + 'H'; }
  SetCursor(r,c) { process.stdout.write(this.Go(r,c)); }
  //may need to change this to be at wherever it is left off
  GotoInputPoint() { this.SetCursor(this.InputLine(),0); }
  /*Used to have a CarefullyClear method on columnID (fill with whitespace),
  	much easier to just clear everything and reprint the screen w/this.Fix*/

  RWriteFX(c, linec, text, textfx) {
     const div = Div(text.length - 1, this.cwidthper);
     process.stdout.write(this.Go(linec++,c) + textfx(text.slice(this.cwidthper * div)));
     for (let j = 0; j < div && linec < this.OutputLineEnd(); j++) {
       process.stdout.write( this.Go(linec++,c) + 
       	  textfx(text.slice( this.cwidthper * (div - j - 1), this.cwidthper * (div - j) )));
     }
     return linec;
  }
  RWrite(c, linec, text) {
     return this.RWriteFX(c, linec, text, (c==0) ? Red : Ident);
  }
  Add(text, c) {
     this.msgstack[c].push(text);
     this.Fix();
  }
  Fix() {
     process.stdout.write("\x1Bc");
     let linec;
     for (let c = 0; c < 2; c++) {
       linec = this.OutputLineBegin();
       for (let i = 0; i < this.msgstack[c].length && linec < this.OutputLineEnd(); i++) {
         let msg = this.msgstack[c][this.msgstack[c].length - 1 - i];
         linec = this.RWrite(c, linec, msg);
       }
     }
     this.GotoInputPoint();
  }
  Log(modi, ...args) {
     const text = '(' + modi + ') ' + TextReduce(args);
     this.Add(text,1);
  }
  LogErr(modi, ...args) {
     const text = '(' + modi + ') ' + TextReduce(args);
     
     fs.appendFile("errlog", text + '\n', 'utf8',
     	(err) => { if (err) { this.Add(err, 0) } });
     this.Add(text, 0);
  }
};

let mh = new ModuleHandler();

export default class Module {
  constructor() {
     this.moduleID = mh.NewModuleID();
  }
  Handler() { return mh; }//for debug purposes
  LogErr(...args) {
     mh.LogErr(this.moduleID, ...args);
  }
  Log(...args) {
     mh.Log(this.moduleID, ...args);
  }
}
export let mod0 = new Module();

