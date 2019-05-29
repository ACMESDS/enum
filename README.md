/**
@class ENUM 
	[SourceForge](https://sourceforge.net) 
	[github](https://github.com/acmesds/enum.git) 
	[geointapps](https://git.geointapps.org/acmesds/enum)
	[gitlab](https://gitlab.weat.nga.ic.gov/acmesds/enum.git)
	
# ENUM

ENUM provides simple enumerators:

	Copy(src,tar,deep)  // shallow or deep copy src to tar 
	Each(opts,cb) 				// enumerate opts with callback cb( n, opts[n], isLast )
	[ rec, ...].each( cb )		// enumerate list with callback cb(rec , idx)
	
a means to extend a constructor:

 	[ prototype, ...].extend( Array || String || Date || Object ) 	// extend constructor with prototypes
	
and list, string, and function serializers:

	[ rec, ...].serialize(fetcher, cb)  // run fetcher( rec, (info) => {...}) with callback cb(rec,info) or cb(null,fails) at end
	"...".serialize( fetcher, regex, key, cb ) {  //< replace regex using fetcher( rec, (ex) => "replace" ) and placeholder key with callback cb(str)
	Function.serialize( indexer, cb ) //< run Function(rec, done) using indexer( (rec) => {...}) with callback cb(rec) or cb(null) at end 
	
If a deep copy key (e.g. ".") is specified, the copy is deep with src keys treated as keys 
into the target thusly:

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