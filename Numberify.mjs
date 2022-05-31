import {UnitalMagma, Cumulator} from "./Abstract.mjs"

export class SubStateCombinator {
  constructor(...totals) {
    let cum = new Cumulator( new UnitalMagma(((v, m) => v * m), 1) );
    this.maps = cum.GetMapper(totals);
  }
  Extend(total) {
    this.maps.push(this.maps[this.maps.length - 1] * total);
  }
  //Make sure 0 <= substates[i] <= this.ssTotals[i] - 1 to ensure uniqueness
  Value(...substates) {
    let rv = 0;
    for (let i = 0; i < substates.length; i++) {
       rv += this.maps[i] * substates[i];
    }
    return rv;
  }
};

/*
SubStateCombinator(8, 3, 2, 2, 2)
  -> s0 + s1 * 8 + s2 * 24 + s3 * 48 + s4 * 96
  -> number from 0-7, 0-2, 0/1, 0/1, 0/1
*/
