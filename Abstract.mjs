
//for algebraic systems with a binary operation +, and an element through which 
//	an identity morphism can be established on + (there exists I such that forall x: I + x = x)
export class UnitalMagma {
  constructor(func, ident) {
    this.func = func;
    this.ident = ident;
  }
}

export class Cumulator {
  constructor(umag) {
    this.umag = umag;
    //this.ident = umag.ident;
    //this.func = umag.func;
    
    this.vi;
    this.cumf = (value) => {
      let rv = this.vi;
      this.vi = this.umag.func(value, this.vi);
      return rv;
    }
  }
  GetMapper(basis) {
    this.vi = this.umag.ident;
    let mapper = basis.map(this.cumf);
    //Push an extra value just to preserve all structure from original basis
    mapper.push(this.umag.func(mapper[mapper.length-1],basis[basis.length-1]));
    //This only serves to ensure we can extend the basis later if we wish,
    //	and determine what kind of structure we're prepared to deal with now
    return mapper;
  }
};
//With Cumulator(1, (x,y)=>x*y)
//GetMapper([3,2,1]) == [1, 3, 6, 6]
//GetMapper([1,2,3]) == [1, 1, 2, 6]
