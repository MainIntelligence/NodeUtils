import CommonScriptMap from "./GenCommon.mjs";
import {mod0} from "./../Module.mjs";
let csm = new CommonScriptMap();

function TagStyles(styles) {
   let html = "";
   for (const style of styles) {
      html += ("<link rel=\"stylesheet\" href=\"" + style + "\">");
   }
   return html;
}

function TagScripts(scripts) {
   let html = "";
   for (let str of scripts) {
      str = str.trim();
      let tv = csm.Script(str);
      if (tv) {  html += tv; }
      else if (str.endsWith(".js")) {
         html += ("<script type=\"text/javascript\" src=\"" + str + "\"></script>");
      } else {
         html += ("<script src=\"" + str + "\"></script>");
      }
   }
   return html;
}
function TagHeadTitle(title) {
   if (title == "") { return ""; }
   return "<title>" + title + "</title>";
}
function TagDesc(desc) {
   if (desc == "") { return ""; }
   return "<meta name=\"description\" content=\"" + desc + "\">"
}
function TagKeywords(keys) {
   if (keys == "") { return ""; }
   return "<meta name=\"keywords\" content=\"" + keys + "\">";
}
function TagMetaTitle(title) {
   if (title == "") { return ""; }
   return "<meta property=\"og:title\" content=\"" + title + "\">";
}

function HeadGen( title, desc, keywords, styles, scripts, url ) {
return "<!DOCTYPE html>" +
"<html lang=\"en\">" +
"<head>" +
TagHeadTitle(title) +
"<meta charset=\"utf-8\">" +
"<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">" +
TagDesc(desc) +
TagKeywords(keywords) +
TagMetaTitle(title) +
"<meta property=\"og:type\" content=\"website\">" +
"<meta property=\"og:image\" content=\"/favicon.ico\">" +
"<meta property=\"og:url\" content=\"" + url + "\">" +
"<link rel=\"stylesheet\" href=\"/nav.css\">" +
"<link rel=\"stylesheet\" href=\"/main.css\">" +
TagStyles(styles) +
"<link rel=\"icon\" href=\"/favicon.ico\" type=\"image/x-icon\">" +
TagScripts(scripts) +
"</head>"
}

/*if a non .html string is specified after an html string, it is a title
* if there is no title after an .html string, the title is taken from it
*/
function GetLinkHTML(specs) {
  let html = "";
  for (let i = 0; i < specs.length; i++) {
     if ((i == specs.length - 1) || specs[i + 1].endsWith(".html")) { //no title given
        html += ("<a href=\"" + specs[i] + "\">" +
           specs[i].slice(specs[i].lastIndexOf('/') + 1,
              specs[i].lastIndexOf('.')) +  "</a>");
     } else {
        html += ("<a href=\""+specs[i]+"\">" + specs[i + 1] + "</a>");
        i++;
     }
  };
  return html;
};

export default class HTMLGenerator {
  constructor() {
    this.values = new Array(6); //the specs needed for a page
  }
  
  Set(attr, value) {
     attr = attr.toLowerCase();
     if (attr.startsWith("title")) {
        this.values[0] = value.trim(); //string
     } else if ( attr.startsWith("desc") ) {
        this.values[1] = value.trim(); //string
     } else if ( attr.startsWith("key") ) {
        this.values[2] = value.trim(); //string csv
     } else if ( attr.startsWith("link") ) {
        this.values[3] = value.trim().split(',');
     } else if ( attr.startsWith("style") ) {
        this.values[4] = value.trim().split(',');
     } else if ( attr.startsWith("script") ) {
        this.values[5] = value.trim().split(',');
     }
  }
  ResetValues() { this.values[0] = ""; this.values[1] = ""; this.values[2] = ""; this.values[3] = [];
  	this.values[4] = []; this.values[5] = []; }
  ParseOffParams(content) {
     this.ResetValues();
     let ibegin = content.search(/[^( |\n)]/); //skip spacing type seperators
     content = content.slice(ibegin);
     let iend = content.search(/:|\n/); //Find which comes first of ':' or newline
     let attr;
     let val;
     while (content.charAt(iend) != '\n') {
        attr = content.slice(ibegin, iend);
        
        content = content.slice(iend + 1);//past ':'
        iend = content.search(/;/); //content[iend] == ';'
        val = content.slice(0, iend);
        content = content.slice(iend + 1);//past ';'
        this.Set(attr, val);
        ibegin = content.search(/[^( |\n)]/);
        content = content.slice(ibegin);
        ibegin = 0;
        iend = content.search(/:|\n/);
     }
     return content.slice(ibegin);
  }
  
  GenInitBody() {
  return "<body>" +
"<nav class=\"topnav\">" +
"<div class=\"navClassCont\">" +
"<p> Navigate </p>" +
"<div class=\"dropTopNav\">" +
GetLinkHTML(this.values[3]) +
"</div>" +
"</div>" +
"<div class=\"navClassCont\" style=\"left: 50vw;\">" +
"<a href=\"https://mainintelligence.org/\"> Home </a>" +
"</div>" +
"</nav>" +
"<div class=\"main_title\">" +
"<h1>" + this.values[0] + "</h1>"+
"</div>"
  }
  Morph(content, url) {
    content = this.ParseOffParams(content);
    return HeadGen(this.values[0], this.values[1], this.values[2], this.values[4], this.values[5], url) +
       this.GenInitBody() + content + "</body></html>";
  }
}

