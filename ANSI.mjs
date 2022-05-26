import {mod0} from "./Module.mjs"

/*exports at bottom:
   fx: functions to add/change effects on a TextFX object
   TextFX: -takes functions from fx as ctor parameters,
   		has Apply method to add effects to a string
   fxcommon: a group with names for a bunch of common effects
*/

const nbuid = [0,1,4]; //0 == normal, 1== bold, 4== underline
const intenseoffset = [30, 90]; //30 == normal, 90 == high intensity
const bgmodoffset = [0, 10]; //0 == text effect,  10 == background effect

const blinkcode = "\x1B[5m";
const colors = {
black: 0,
red: 1,
green: 2,
yellow: 3,
blue: 4,
purple: 5,
cyan: 6,
white: 7
}

function MakeCode(color, topo = 0, isintense = 0, isbg = 0, toblink = 0) {
   let rv = "";
   if (toblink) { rv += blinkcode; }
   if (topo == 0 && !(isintense || isbg) && color == 7) {
      return rv;
   }
   if (topo == 0) {
      rv = '\x1B[' + ( intenseoffset[isintense] + bgmodoffset[isbg] + color ) + 'm';
      return rv;
   }
   rv = ('\x1B[' + nbuid[topo] + ';' +
      ( intenseoffset[isintense] + bgmodoffset[isbg] + color ) + 'm');
   return rv;
}
let codearr = [];
function GetCode(c, topo, intensity, bg, blink) {
   return codearr[c + topo * 8 + intensity * 24 + blink * 48 + bg * 96];
}
//256 * 5 bytes == 1280 bytes (not bad, storing them all here helps for big console apps)
for (let bg = 0; bg < 2; bg++) { //bit 7 (128)
for (let blink = 0; blink < 2; blink++) {//bit 6 (64)
for (let intensity = 0; intensity < 2; intensity++) { //bit 5 (32)
for (let topo = 0; topo < 3; topo++) { //bits[3,4]
for (let c = 0; c < 8; c++) { //bits [0,2]
   codearr.push( MakeCode(c, topo, intensity, bg, blink) );
}
}
}
}
}
/*
function GetCode(c, topo, intensity, bg, blink) {
   return codearr[c + topo * 8 + intensity * 32 + blink * 64 + bg * 128];
}*/

let deffx = () => {
return {
  color: colors.white,
  topo: 0,
  intense: 0,
  bg: 0,
  blink: 0
}
};

function Color(fxspec, color) {
   fxspec["color"] = color; return fxspec;
}

export const fx = {
Uber: (fxspec => { fxspec["intense"] = 1; fxspec["topo"] = 1; return fxspec; }),
Blink: (fxspec => { fxspec["blink"] = 1; return fxspec; }),
BG: (fxspec => { fxspec["bg"] = 1; return fxspec; }),
Underline: (fxspec => { fxspec["topo"] = 2; return fxspec; }),
Red: (fxspec => Color(fxspec, colors.red)),
Green: (fxspec => Color(fxspec, colors.green)),
Yellow: (fxspec => Color(fxspec, colors.yellow)),
Blue: (fxspec => Color(fxspec, colors.blue)),
Purple: (fxspec => Color(fxspec, colors.purple)),
Cyan: (fxspec => Color(fxspec, colors.cyan))
}

//color = white, topo = 0, isintense = false, isbg = false, toblink = false
export default class TextFX {
   //8 = 2^3 => 3 bits for color, 2 for topo, 3 for binary states == 8 bits
   constructor(...fxmods) {
      let fx = deffx();
      for (const fxmod of fxmods) { fx = fxmod(fx); }
      this.code = GetCode(fx.color, fx.topo, fx.intense, fx.bg, fx.blink);
   }
   Apply(text) {
      return this.code + text + "\x1B[0m";
   }
}

export const fxcommon = {
   clear:	new TextFX(),
   blink:	new TextFX(fx.Blink),
   green: 	new TextFX(fx.Green),
   yellow: 	new TextFX(fx.Yellow),
   red: 	new TextFX(fx.Red),
   ubergreen: 	new TextFX(fx.Uber, fx.Green),
   uberyellow:  new TextFX(fx.Uber, fx.Yellow),
   uberred: 	new TextFX(fx.Uber, fx.Red),
   blinkred: 	new TextFX(fx.Blink, fx.Red),
   blinkuberred:new TextFX(fx.Blink, fx.Uber, fx.Red),
   blinkubergreen: new TextFX(fx.Blink, fx.Uber, fx.Green)
}
