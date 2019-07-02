/**
@class ENUM 
	[SourceForge](https://sourceforge.net) 
	[github](https://github.com/acmesds/enum.git) 
	[geointapps](https://git.geointapps.org/acmesds/enum)
	[gitlab](https://gitlab.weat.nga.ic.gov/acmesds/enum.git)
	
# ENUM

ENUM provides simple enumerators:

	Copy(src,tar)  		// shallow copy src to tar 
	Copy(src,tar,key)  // deep copy src to tar 
	Each(opts,cb) 		// enumerate opts with callback cb( n, opts[n], isLast )
	
If a deep copy key (e.g. ".") is specified, src keys treated as keys into the target thusly:

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
	
	[ rec, ...].serialize(fetcher, (rec, failures) => {
		// rec = record || null at end
		// failures = number of failed fetches
	}
	
a string serializer:

	function fetcher( rec, ex => {
		// regexp arguments rec.arg0, rec.arg1, rec.arg2, ...
		// rec.ID = record number being processed
		return "replaced string";
	});
	
	"string to search".serialize( fetcher, regex, "placeholder key", str => { 
		// str is final string with all replacements
	});
	
and a function serializer:

	function indexer( rec => {
	...
	});
	
	Function.serialize( indexer, rec => {  // runs Function(rec, done) until rec is null 
		// rec = record || null at end
	}) 

## Installation

Clone [ENUM basic enumerators](https://github.com/acmesds/enum) into your PROJECT/enum folder.  

### Manage 

	npm run [ edit || start ]			# Configure environment
	npm test [ ? || E1 || ...]					# Unit test
	npm run [ prmprep || prmload ]		# Revise PRM

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