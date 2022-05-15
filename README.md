
Hash.mjs - a safe hash table (table size should only affect performance)

fsutils.mjs - with FSManager

ExtToMime.mjs - for giving the right Mime types for some file extensions

cmdline.mjs - offers asynchronous input handling with functions defined by user

Module.mjs - offers a system for multiplexing a console over various independent services

	-construct a Module object
	
	-instead of console.log or console.error, use the Log and LogErr methods of module
	
	-The console is split into two columns (for errors and logs respectively)
	
		-messages get wrapped, and start with an identifier for the module
		 of the log/error
