
import Module ,{mod0} from "./Module.mjs"
import AsyncInterpreter from "./cmdline.mjs"

let m = new Module();

let interp = new AsyncInterpreter(10);
function TextReduce(args) {
   return args.reduce((str0, str1) => str0 + ' ' + str1);
}

interp.Define("log", (textwords) => {
  if (textwords.length == 0) { mod0.LogErr("log needs arguments"); return; }
   m.Log(TextReduce(textwords));
});
interp.Define("logerr", (textwords) => {
   if (textwords.length == 0) { mod0.LogErr("logerr needs arguments"); return; }
   m.LogErr(TextReduce(textwords));
});
interp.Define("debug", () => {
   m.Log(m.Handler().cwidthper);
});

                         
m.Log("Hello modules!");
m.Log("Another Thing!");

for (let i = 0; i < 29; i++) {
   m.Log(i);
}
m.Log("UngabungachikowasakoiNumatakanavovichou!");
m.Log("henlo");
m.Log("UngabungachikowasakoiNumatakanavovichou!");

m.LogErr("Error!");
m.LogErr("Seriously!");
m.LogErr("UngabungachikowasakoiNumatakanavovichou!");

