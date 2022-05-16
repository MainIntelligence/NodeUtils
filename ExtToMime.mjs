'use strict'
import Hash from "./Hash.mjs"

//One place to keep track of all the extensions we care to map to mime types
//	uses a hashtable with the ctor given size
export default class ExtMimeHash extends Hash {
   constructor(hashsize) {
      super( hashsize,
"mjs", "text/javascript",
"js", "text/javascript",
"html", "text/html",
"css", "text/css",
"txt", "text/plain",
"ico", "image/x-icon",
"json", "application/json",
"xml", "application/xml"
      );
   }
   
   MimeType(url) {
      let i = url.lastIndexOf('.');
      //no extension specified on filename part of path
      if (url.lastIndexOf('/') >= i) { return "text/plain"; }
      //if we don't have a registered conversion, again just call it text/plain
      let mt = this.Value(url.substr(i + 1));
      if (mt == null) { return "text/plain"; }
      return mt;
   };
}

