import {UnitalMagma, Cumulator} from "./Abstract.mjs"

export class SubStateUnpacker {
  constructor(...totals) {
    let cum = new Cumulator( new UnitalMagma(((v, m) => v * m), 1) );
    this.maps = cum.GetMapper(totals);
  }
  Extend(total) {
    this.maps.push(this.maps[this.maps.length - 1] * total);
  }
  SubState(value, i) {
    let rv = value % this.maps[i + 1];
    rv = Math.trunc(rv / this.maps[i]);
    return rv;
  }
};

/*
SubStateUnpacker(8, 3, 2, 2, 2)
  -> s0 + s1 * 8 + s2 * 24 + s3 * 48 + s4 * 96
  -> number from 0-7, 0-2, 0/1, 0/1, 0/1
*/
