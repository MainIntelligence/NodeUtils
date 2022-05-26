/*ADMIN PROTOCOL
 1.ADMIN CONNECTS TO SERVER
 2.SERVER SEES localhost CONNECT AND CALLS THEM ADMIN
 3.SERVER FORWARDS DATA TO ADMIN BY APPENDING A STREAM ID
 	-IF STREAM ID IS NEW, ALWAYS EXPECT AN IDENTIFICATION FOR THE STREAM NEXT (MAKE DIALOG WINDOW)
 		-IDENTIFICATION IS IP FOR CLIENTS
 	-IF STREAM ID IS OLD, WE HAVE A DIALOG WINDOW AND ADD TO THAT WINDOW
*/
import * as gen from "./GenHelpers.mjs"
import WSClient from "./WSClient.mjs";
import Hash from "./../Hash.mjs";
import DynamicExtension, {RelativelyResizable} from "./ResizerExtension.mjs";
import beep from "./beep.mjs";

class ContainerPositionMixer {
  constructor() {
    this.mode = true;
    this.id = 0;
  }
  Update() {
    if (this.mode) {
       if (this.id == 74/2) { this.mode = false; this.id--; }
       else { this.id++; }
    }
    else {
      if (this.id == 0) { this.mode = true; this.id++; }
      else { this.id--; }
    }
  }
  Get() {
    let div = gen.CSSDiv("position:absolute;display:flex;flex-direction:column;height:25vh;width:25vw; border:solid green;top:"+ 2*this.id + "vh;left:"+2*this.id+"vw;" );
    this.Update();
    return div;
  }
};
let containermaker = new ContainerPositionMixer();
let NewContainer = () => {
  return containermaker.Get();
}

let TitleTag = (title, xtra = "") => {
  let tag = gen.CSSDiv("width:100%;margin:0;padding:0;text-align:center;height:calc(var(--little-text) + 5px);" + xtra);
  tag.className = "Box";
  tag.innerHTML = title;
  return tag;
};

class Container {
  constructor(title) {
    this.cont = NewContainer();
    this.title = TitleTag(title, "cursor:move");
    gen.AppendChildren(this.cont, this.title);
  }
};
class IOContainer extends Container { //bottom 15% reserved
  constructor(title) {
     super(title);
     this.input = gen.CSSElm('textarea', "resize:none;width:90%");
     this.send = gen.CSSElm("button", "width:9%");
  }
  
  End() {
     let kb = gen.CSSDiv("display:flex;flex-direction:row;height:15%;bottom:0");
     let sep = gen.CSSDiv("width:1%");
     gen.AppendChildren(kb, this.input, sep, this.send);
     gen.AppendChildren(this.cont, kb);
  }
};

class ChatFormat extends IOContainer {
  constructor(parent, title) {
     super(title);
     this.dlg = gen.CSSDiv("overflow-y:auto; height:85%;");
     gen.AppendChildren(this.cont, this.dlg);
     this.End();
     
     gen.AppendChildren(parent, this.cont);
     let dynext = new DynamicExtension(this.cont, this.title);
  }
  AttachSender(cli, key) {
     this.send.onclick = () => {
        if (!this.input.value) { return; }
        cli.Send([key, this.input.value]);
        Record(this.dlg, this.input.value, 'right');
        this.input.value = "";
        this.dlg.scrollTop = this.dlg.scrollHeight;
     }
  }
};

//ChatFormat with one shared text input/button
//	Multiple log section 
// TODO: Temporal links: See the last message on log/info before an error occured
class ControlModule extends IOContainer {
  constructor(parent, title, hash,...subtitles) {
     super(title);
     
     /*Height is: Whole container height (100%) - Height of Keyboard (15%) 
         - Height of top title ( var(--little-text) + 5px )
     ...And we fit each card title and dialogue in this height
     */
     let cards = gen.CSSDiv("display:flex; flex-direction:row; width:100%; height:calc(85% - var(--little-text) - 5px);");
     let i = 0;
     for (let item of subtitles) {
       let card = gen.CSSDiv("display:flex; flex-direction:column; width:40%; overflow:hidden; border: solid green 1px");
       let title = TitleTag(item, "position:relative");
       let dlg = gen.CSSDiv("overflow-y:auto; flex:auto; ");
       
       gen.AppendChildren(card, title, dlg);
       gen.AppendChildren(cards, card);
       let ext = new RelativelyResizable(cards, card, title);
       hash.Add(i++, dlg);
     }
     gen.AppendChildren(this.cont, cards);
     this.End();
     gen.AppendChildren(parent, this.cont);
     let dynext = new DynamicExtension(this.cont, this.title);
  }
  
  AttachSender(cli, hash) {
     let dlg = hash.Value(1);
     this.send.onclick = () => {
        if (!this.input.value) { return; }
        cli.Send([0, this.input.value]);
        Record(dlg, this.input.value, 'right');
        this.input.value = "";
        dlg.scrollTop = dlg.scrollHeight;
     }
  }
};

function Record(dlg, text, lr, width = "96%", cssextra) {
  let elm = gen.CSSDiv('display:inline-block;margin:0;float:' + lr + ';width:' + width + ';' + cssextra);
  elm.className = "Box";
  elm.innerHTML = text;
  dlg.appendChild(elm);
}

export default class AdminClient {
  constructor(scheme, host, port){
    let cli = new WSClient(scheme, host, port);
    cli.Open();
    this.hash = new Hash(16);
    
    
    let div = gen.Div();
    let control = new ControlModule(div, "Control", this.hash, "Logs", "Info", "Errors");
    control.AttachSender(cli, this.hash);
    document.body.appendChild(div);
    
    let MakeChat = (id, title) => {
      div = gen.Div();
      let cont = new ChatFormat(div, title)
      this.hash.Add(id, cont.dlg);
      document.body.appendChild(div);
      return cont;
    }
    let MakeDialog = (id, title) => {
       let cont = MakeChat(id, title);
       cont.AttachSender(cli, id);
    }
    
    cli.OnRecv(event => {
      let sep = event.data.indexOf(',');
      let vs = [event.data.slice(0,sep), event.data.slice(sep + 1)];
      
      if (this.hash.Value(Number(vs[0])) == null) {
        MakeDialog(Number(vs[0]), vs[1]);
      } else {
        let dialog = this.hash.Value(Number(vs[0]));
        Record(dialog, vs[1], "left");
        dialog.scrollTop = dialog.scrollHeight;
      }
      beep();
    });
     
    cli.OnClosed(event => {
       Record(this.hash.Value(1), "Connection terminated", "none", "100%", "text-align:center");
    });
    
    cli.OnError(event => {
      Record(this.hash.Value(1), "Error: It's likely there's nobody listening for chat requests", "none", "100%", "text-align:center");
    });
  }


}
