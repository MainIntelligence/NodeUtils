
let currentZIndex = 50;

//Let 'anchor' acts as a horizontal resizer for 'box' while keeping it within 'parent'
export class RelativelyResizable {
  constructor(parent, box, anchor) {
     let start = [0,0];
     let initDrag = (e) => {
       start[0] = e.clientX;
       start[1] = parseInt(
         document.defaultView.getComputedStyle(box).width,
         10
       );
       document.documentElement.addEventListener("mousemove", doDrag, false);
       document.documentElement.addEventListener("mouseup", stopDrag, false);
     }

     let doDrag = (e) => {
       box.style.width = 100*(start[1] + e.clientX - start[0])/parent.clientWidth + "%";
       //box.style.height = 100*(start[3] + e.clientY - start[1])/window.innerHeight + "vh";
     }
   
     let stopDrag = () => {
       document.documentElement.removeEventListener("mousemove", doDrag, false);
       document.documentElement.removeEventListener("mouseup", stopDrag, false);
     }
     
     let right = document.createElement("div");
     right.className = "resizer-right";
     anchor.appendChild(right);
     right.addEventListener("mousedown", initDrag, false);
  }
};

//NO constraints: drag 'anchor' to drag 'box', box can be resized horizontally, vertically
export default class FullyDynamicExtension {
  constructor(box, anchor) {
     this.box = box;
     this.anchor = anchor;
     
     //MOVING
     box.onmousedown = () => {
       box.style.zIndex = "" + ++currentZIndex;
     };
     
     let pos = [0,0,0,0];
     anchor.onmousedown = e => {
       box.style.zIndex = "" + ++currentZIndex;
       e = e || window.event;
       // get the mouse cursor position at startup:
       pos[2] = e.clientX;
       pos[3] = e.clientY;
       document.onmouseup = () => {
         document.onmouseup = null;
         document.onmousemove = null;
       };
       // call a function whenever the cursor moves:
       document.onmousemove = (e) => {
         e = e || window.event;
         // calculate the new cursor position:
         pos[0] = pos[2] - e.clientX;
         pos[1] = pos[3] - e.clientY;
         pos[2] = e.clientX;
         pos[3] = e.clientY;
         // set the element's new position:
         box.style.top = 100*(box.offsetTop - pos[1])/window.innerHeight + "vh";
         box.style.left = 100*(box.offsetLeft - pos[0])/window.innerWidth + "vw";
       };
     };
     
     
     //RESIZING
     let start = [0,0,0,0];
     let initDrag = (e) => {

       start[0] = e.clientX;
       start[1] = e.clientY;
       start[2] = parseInt(
         document.defaultView.getComputedStyle(box).width,
         10
       );
       start[3] = parseInt(
         document.defaultView.getComputedStyle(box).height,
         10
       );
       document.documentElement.addEventListener("mousemove", doDrag, false);
       document.documentElement.addEventListener("mouseup", stopDrag, false);
     }

     let doDrag = (e) => {
       box.style.width = 100*(start[2] + e.clientX - start[0])/window.innerWidth + "vw";
       box.style.height = 100*(start[3] + e.clientY - start[1])/window.innerHeight + "vh";
     }
   
     let stopDrag = () => {
       document.documentElement.removeEventListener("mousemove", doDrag, false);
       document.documentElement.removeEventListener("mouseup", stopDrag, false);
     }
     let right = document.createElement("div");
     right.className = "resizer-right";
     box.appendChild(right);
     right.addEventListener("mousedown", initDrag, false);

     let bottom = document.createElement("div");
     bottom.className = "resizer-bottom";
     box.appendChild(bottom);
     bottom.addEventListener("mousedown", initDrag, false);

     let both = document.createElement("div");
     both.className = "resizer-both";
     box.appendChild(both);
     both.addEventListener("mousedown", initDrag, false);
  }
};
