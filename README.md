
Hash.mjs - a safe hash table (table size should only affect performance)

fsutils.mjs - with FSManager

ExtToMime.mjs - for giving the right Mime types for some file extensions

cmdline.mjs - offers asynchronous input handling with functions defined by user

Module.mjs - offers a system for multiplexing a console over various independent services

	-construct a Module object
	-instead of console.log or console.error, use the Log and LogErr methods of module
	-The console is split into two columns (for errors and logs respectively)
		-messages get wrapped, and start with an identifier for the module of the log/error

Ex.
'''
import Module, {mod0} from "./NodeUtils/Module.mjs"
import AsyncInterpreter from "./NodeUtils/cmdline.mjs"

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
'''
Here mod0 is constructed in Module.mjs, and is used for logging errors in our system
This simple application defines a module for user-input induced logs, including
	a debug function (printing an item in our static internal ModuleHandler)
