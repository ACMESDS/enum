/**
@class ENUM 
	[SourceForge](https://sourceforge.net) 
	[github](https://github.com/acmesds/enum.git) 
	[geointapps](https://git.geointapps.org/acmesds/enum)
	[gitlab](https://gitlab.weat.nga.ic.gov/acmesds/enum.git)
	
# ENUM

ENUM provides a common set of enumerators:

	Copy(src,tar,deep,cb)  // shallow or deep copy src to tar with optional callback cb()
	Each(opts,cb) 				// enumerate opts Object with callback cb( n, opts[n], isLast )
 	[ prototype, ...].extend( Array || String || Date || Object ) 	// add prototype functions to constructor
	[ rec, ...].each( cb )		// enumerate records with callback cb(rec , idx)
	[ rec, ...].serialize(fetcher, cb)  // serialize list with callback cb(rec,info) or cb(null,fails) at end using fetcher( rec, (info) => {...})
	"...".serialize( fetcher, regex, key, cb ) {  //< serialize string callback cb(str) after replacing regex using fetcher( rec, (ex) => "replace" ) and placeholder key
	Function.serialize( indexer, cb ) //< serialize Function(rec, done) using indexer( (rec) => {...}) with callback cb(rec) or cb(null) at end 
	
where 

* copy() will copy the source src to a target tar under supervision of an optional callback 
cb(value) which returns true to drop.  If a deep key deliminator (e.g. ".") is 
specified, the copy is deep with src keys treated as keys into the target thusly:

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

+ Each() will shallow enumerate over its opts with callback cb(key,value).
	
## Installation

Clone [ENUM basic enumerators](https://github.com/acmesds/enum) into your PROJECT/enum folder.  

## Usage

From some assembly:

	var
		ENUM = require("enum"),
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