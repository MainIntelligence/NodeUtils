
/*For notation of ObjectGenerator argument, start with an array, 
  descend into a subarray when:
	1. You want to limit the scope of classes to which your resource is given OR
	2. You want to specify a class that gets the resources specified on stack
-The current array contains no subarrays IFF all of its elements are classes to initialize
	with the current stack of resource parameters. */
let nofunc = () => {};

export function * ObjectGenerator(arr, rscfunc = nofunc, argarr = []) {
     if ( arr.every(x => !Array.isArray(x)) ) { //runs iff init time
     	//if every element is not an array
        for (const C of arr) {
           yield new C(...argarr);
        }
     }
     let currargs = argarr.length;
     for (const X of arr) {
        if (Array.isArray(X)) {
           yield *ObjectGenerator(X, rscfunc, argarr);
        } else {
           argarr.push(X);
           rscfunc(X);
        }
     };
     //remove args added in this 'frame'
     argarr.slice(0, currargs); 
};

/*apply the function to every object constructed (probably storing their
	reference somewhere for usage*/
export default function ObjectProcess( ctorspec, func, onrsc = nofunc) {
  for (const o of ObjectGenerator(ctorspec, onrsc)) {
     func(o);
  }
}
