
//We get a byte representing all the effects
import {SubStateUnpacker} from "./../SSUnpacker.mjs"
import {Div} from "./../CtrlPanel/GenHelpers.mjs"
//8 colors, 3 topologies (normal, bold, underlined), intense (0/1), blink(0/1), bg(0/1)
const ansiunpack = new SubStateUnpacker(8, 3, 2, 2, 2);

const colors = ["black", "red", "green", "yellow", "blue", "purple", "cyan", "white" ];
const topos = ["", "b", "u"]; //tags
const intensity = ["", "strong"] //tag

class HTMLOutput {
  constructor() {
    this.style = "";
    this.inner = "";
    this.toblink = false;
  }
};

export default function Decorate(text, code) {
    let html = new HTMLOutput();
    let i = ansiunpack.SubState(code, 0);
    html.style += ("color:" + colors[i]);
    
    i = ansiunpack.SubState(code, 3);
    html.toblink = i;
    //let newtext = blink[i](text);
    
    //Get the tags
    let tags = [];
    
    i = ansiunpack.SubState(code, 1);
    if (topos[i] != "") { tags.push(topos[i]); }
    
    i = ansiunpack.SubState(code, 2);
    if (intensity[i] != "") { tags.push(intensity[i]); }
    
    //Apply the tags
    for (i = 0; i < tags.length; i++) {
      html.inner += ('<' + tags[i] + '>');
    }
    html.inner += text;
    for (i = tags.length - 1; i >= 0; i--) {
      html.inner += ('</' + tags[i] + '>');
    }
    return html;
};

