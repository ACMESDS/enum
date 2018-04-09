/**
@class ENUM 
	[SourceForge](https://sourceforge.net) 
	[github](https://github.com/acmesds/enum.git) 
	[geointapps](https://git.geointapps.org/acmesds/enum)
	[gitlab](https://gitlab.weat.nga.ic.gov/acmesds/enum.git)
	
# ENUM

ENUM provides a common set of enumerators:

	test(N, opts) 				// unit-test the callback opts[ N ]()
	copy(src,tar,deep,cb)  // shallow or deep copy src to tar with optional callback cb()
	each(opts,cb) 				// enumerate opts with callback cb( n, opts[n], isLast )
	extend(opts,protos)  // configure ENUM with options and prototypes
	flush() 						// callback Function configuration opts
 
where:

+ copy() will copy the source src to a target tar under supervision of an optional callback 
cb(value) returning true to drop.  If a deep key deliminator (e.g. ".") is 
specified, the copy is deep where src keys are treated as keys into the target thusly:

	{
		A: value,			// sets target[A] = value

		"A.B.C": value, 	// sets target[A][B][C] = value

		"A.B.C.": {			// appends X,Y to target[A][B][C]
			X:value, Y:value, ...
		},	

		OBJECT: [ 			// prototype OBJECT (Array,String,Date,Object) = method X,Y, ...
			function X() {}, 
			function Y() {}, 
		... ],

		Function: 			// append method X to ENUM callback stack
			function X() {}
	}

+ clone() will shallow copy the src source hash under supervision of a copy() callback.  

+ each() will shallow enumerate over its opts with callback cb(key,value).
	
+ extend() will extend the opts prototype with specified methods, or, if no methods are provided, 
extend this ENUM with the given opts.  Array, String, Date, and Object keys are 
interpretted to extend their respective prototypes.  A Function key is interpretted
to push the function to the ENUM callStack (which can be drained by the ENUM flush
method).
	
+ test() will unit-test a module as documented in its config.js.

## Installing

Clone from one of the repos. 
	
## Using

From some asm.js

	var
		ENUM = require("enum"),
		Copy = ENUM.copy,
		Clone = ENUM.close,
		Each = ENUM.each,
		ASM = module.exports = ENUM.extend({  // see ENUM.copy for key syntax
			key: value,
			key: value,
			:
			:
		});

then extended again from some nextasm.js

	var 
		ASM = require("asm"),
		NEXTASM = module.exports = ASM.extend({
			key: value,
			:
			:
		});


## License

[MIT](LICENSE)

*/