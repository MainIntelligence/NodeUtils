
//Thought: Make an uber-dynamic protocol where class definitions can be transmitted if unknown
/*
*/
export let tID = {
  uint8:  0,
  int8:   1,
  uint16: 2,
  int16:  3,
  uint32: 4,
  int32:  5,
  uint64: 6,
  int64:  7
};

function TypeSize(tid) { return Math.trunc(1 + tid/2); }

//b, o, (l) = ...args
let ctor = function (arrtype) {
  return ((...args) => new arrtype(...args));
}

let ctors = [ ctor(Uint8Array),
   ctor(Int8Array),
   ctor(Uint16Array),
   ctor(Int16Array),
   ctor(Uint32Array),
   ctor(Int32Array),
   ctor(BigUint64Array),
   ctor(BigInt64Array),
];

//utf8 string to ArrayBuffer data
const decoder = new TextDecoder();
const encoder = new TextEncoder();

//Specify the binary type sequence, branch points?
//	ie. dependence of format continuation upon content
//	ie. dynamic interpreted protocol configuration


/*A spec consists of a SEQUENCE (order matters!) of either:
  - A single value (representing a tID above)
  1. Array of 2 values (length and type)
  2. 
*/
export class Protocol {
  constructor(...spec) {
    this.type = spec.map(t => {
      if (Array.isArray(t)) {
        return t[1];
      } else {
        return t;
      }
    });
    let sumv = 0;
    let summap = (v) => { let rv = sumv; sumv += v; return rv; }
    
    this.offsets = spec.map(t => {
      if (Array.isArray(t)) {
        return summap(t[0]*TypeSize(t[1]));
      } else {
        return summap(TypeSize(t)); 
      }
    });
    this.offsets.push(sumv);
  }

  SizeTotal() { return this.offsets[this.offsets.length - 1]; }
  Size(i) { return this.offsets[i + 1] - this.offsets[i]; }
  TypeSize(i) { return TypeSize(this.type[i]); }
  IsSingle(i) { return this.Size(i) == this.TypeSize(i); }
  GetSubArray(arrbuf, i) {
     let ctori = this.type[i];
     if (Array.isArray(ctori)) { ctori = ctori[1]; }
     return ctors[ctori](arrbuf, this.offsets[i], this.Size(i)/this.TypeSize(i));
  }
  GetRest(arrbuf) { return ctors[0](arrbuf, this.SizeTotal()); }
  
  Str(buf) {
     return decoder.decode(this.GetRest(buf));
  }
};


export class DataInterpreter {
  constructor(protocol, buf) {
    this.proto = protocol;
    this.buf = buf;
  }
  
  SetData(arrbuf) { this.buf = arrbuf; } //for attaching to ArrayBuffer
  CreateData(str, ...items) { //for sending
     this.buf = new ArrayBuffer(this.proto.SizeTotal() + str.length);
     
     for (let i = 0; i < items.length; i++) {
        if (!Array.isArray(items[i])) {
          this.GetArray(i)[0] = items[i];
          continue;
        }
        for (let j = 0; j < items[i].length; j++) {
          this.GetArray(i)[j] = items[i][j];
        }
     }
     
     let strbuf = this.proto.GetRest(this.buf);
     let arrstr = encoder.encode(str);
     for (let i = 0; i < arrstr.length; i++) {
       strbuf[i] = arrstr[i];
     }
  }
  GetArray(i) {
     return this.proto.GetSubArray(this.buf, i);
  }
}

//Generally we desire separate receiving and sending protocols for a connection
//	Use a Protocol for receiver (to interpret received data)
//	Use a DataInterpreter for transmitter (to package data at Send)
export default class DPTransceiver {
  constructor(cnxn, recvpcol, packager) {
    this.cyph = packager;
    this.decyph = recvpcol;
    this.cnxn = cnxn;
  }
  Send(msg, ...values) {
    this.cyph.CreateData(msg, ...values); 
    this.cnxn.send(this.cyph.buf, {binary: true});
  }
  //On receive we just need to unpack/use values
  Str(msg) { return this.decyph.Str(msg); }
  Codes(msg, i) { return this.decyph.GetSubArray(msg, i); }
  Code(msg, i, j) { return this.Codes(msg,i)[j]; }
}




