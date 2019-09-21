/**
@class ENUM 
	[SourceForge](https://sourceforge.net) 
	[github](https://github.com/acmesds/enum.git) 
	[geointapps](https://git.geointapps.org/acmesds/enum)
	[gitlab](https://gitlab.weat.nga.ic.gov/acmesds/enum.git)
	
# ENUM

ENUM provides simple enumerators:

	Copy(src,tar)  		// shallow copy src to tar 
	Each(opts,cb) 		// enumerate opts with callback cb( n, opts[n], isLast )
	
If a deep copy is required:

	Copy(src,tar,key)  // deep copy src to tar 

src keys index the target thusly (with key = "."):

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

ENUM also provides a means to extend constructors:

 	[ prototype, ...].Extend( Array || String || Date || Object )
	
as well as a list serializer:

	function fetcher( rec, info => { 
	});
	
	[ rec, ...].serialize( fetcher, (rec, fails) => {
		if ( rec ) 
			// rec = record being serialized
		else
			// done. fails = number of failed fetches
	}
	
a string serializer:

	function fetcher( rec, ex => {
		// regexp arguments rec.arg0, rec.arg1, rec.arg2, ...
		// rec.ID = record number being processed
		return "replaced string";
	});
	
	"string to search".serialize( fetcher, regex, "placeholder key", str => { 
		// str = final string with all replacements made
	});
	
a function serializer:

	function indexer( rec => {
	...
	});
	
	Function.serialize( indexer, rec => {  // runs Function(rec, done) until rec is null 
		if ( rec )
			// rec = record being serialized
		else
			// done
	}) 
	
and an object serializer:

	function fetcher(val, cb) {
		fetch( val, result => cb(result) );
	}
	
	Serialize( obj, fetcher, obj => {
		// obj will all keys fetched
	})

## Installation

Clone [ENUM basic enumerators](https://github.com/acmesds/enum) into your PROJECT/enum folder.  

### Manage 

	npm run [ edit || start ]			# Configure environment
	npm test [ ? || E1 || ...]					# Unit test
	npm run [ prmprep || prmload ]		# Revise PRM

## Usage

From some assembly:

	var ENUM = require("enum");
		
	const { Copy, Each } = ENUM;  	// extract these from enum
	
## License

[MIT](LICENSE)

*/