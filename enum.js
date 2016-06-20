/**
 * @class enum
 * @public
 * 
 * Provides a new object with the following enumerators:
 * 
 * 		config(opts) adjusts this enumerator with given opts
 * 		test(opts,cb) unit-tests a client.js with the function opts.N in opts
 * 		copy(src,tar,drop)  copies shallow src (deep if src.merge) to tar, if !drop(n,src[n])
 * 		each(opts,cb) calls cb(n,opts[n])
 * 		extend(opts,methods) extends opts with methods
 * 		flush() calls all Function opts passed during an extend
 * */

var MERGEKEY = "merge";
	
function ENUM(opts) {
	this.opts = opts;
	this.callStack = [];
}

/**
 * @method copy
 * @public
 * @param {Object} src source hash
 * @param {Object} tar target hash
 * @param {Function} cb callback(idx,val) returns true to drop
 * @return {Object} target hash
 * 
 * Shallow copy of source hash under supervision of callback. If a
 * MERGEKEY is encountered, the copy becomes a deep MERGEKEY, that 
 * is, a src {key:{merge:{items}}} will replace/add items to tar[key].
 * 
 * If a constructor source key is encountered, the key's methods 
 * are added to the source's prototype.  
 */
ENUM.prototype.copy = function (src,tar,cb) {

	if (MERGEKEY)
		if (cb) {
			for (var key in src)  {
				var val = src[key];
				if ( !cb(key,val) ) 
					if (val == null) 
						tar[key] = val;
					
					/*
					else
					if (key == EXTENDKEY)
						this.copy( val, tar ); */

					else
					if (val.constructor == Object)
						if (MERGEKEY in val) 
							this.copy(val.MERGEKEY, tar[key]);
						else
							tar[key] = val;
					else 
						tar[key] = val;
			}
		}
		else 
			for (var key in src) {
				var val = src[key];
				
				if (val == null) 
					tar[key] = val;
				
				/*
				else
				if (key == EXTENDKEY) 
					this.copy( val, tar ); */
					
				else
				if (val.constructor == Object)
					if (MERGEKEY in val) 
						this.copy(val[MERGEKEY], tar[key]);
					else
						tar[key] = val;
				else 
					tar[key] = val;
			}
	else 
		if (cb) {
			for (var key in src) 
				if ( !cb(key,src[key]) ) 
					tar[key] = src[key];
		}
		else 
			for (var key in src) 
				tar[key] = src[key];

	return tar;
};
	
/**
 * @method clone
 * @public
 * @param {Object} src source hash
 * @param {Function} cb callback(idx,val) returns true to drop
 * @return {Object} cloned hash
 * 
 * Shallow clone of source hash under supervision of callback.  If
 * a MERGEKEY is encountered, the clone becomes a deep merge.
 */
ENUM.prototype.clone = function (opts,cb) {
	return this.copy(opts,{},cb);
};

/**
 * @method each
 * @public
 * @param {Object} src source hash
 * @param {Function} cb callback (idx,val) returning true or false
 * 
 * Shallow enumeration over source hash until callback returns true.
 * */
ENUM.prototype.each = function (src,cb) {
	
	if (src)
	switch (src.constructor) {
		case String:
		
			for (var n=0,N=src.length; n<N; n++) 
				if (cb(n,src.charAt(n))) return true;
				
			return false;
		
		case Array:

			for (var n=0,N = src.length;n<N;n++) 
				if (cb(n,src[n])) return true;
				
			return false;
		
		case Object:

			for (var n in src)  
				if (cb(n,src[n])) return true;
			
			return false;

		default:
		
			for (var n in src)  
				if (src.hasOwnProperty(n)) 
					if (cb(n,src[n])) return true;
			
			return false;
			
	}
};

/**
 * @method extend
 * 
 * Extend the opts prototype with specified methods, or, if no methods are provided, 
 * extend this ENUM with the given opts.  Array, String, Date, and Object keys are 
 * interpretted to extend their respective prototypes.  A Function key is interpretted
 * to push the function to the ENUM callStack (which can be drained by the ENUM flush
 * method).
 * */
ENUM.prototype.extend = function (opts,methods) {
		
	if (methods)
		for (var key in methods) 
			opts.prototype[key] = methods[key];
	else
		for (var key in opts) 
			switch (key) {
				case "Array": 	this.extend(Array, opts.Array); break;
				case "String": 	this.extend(String, opts.String); break;
				case "Date": 	this.extend(Date, opts.Date); break;
				case "Object": 	this.extend(Object, opts.Object); break;
				case "Function": this.callStack.push( opts[key] ); break;
				
				default:

					if (MERGEKEY) {
						var val = opts[key];
						
						if (val == null)
							this[key] = val;
						else
						if (val.constructor == Object)
							if (MERGEKEY in val) 
								this.copy(val[MERGEKEY], this[key]);
							else
								this[key] = val;
						else 
							this[key] = val;						
					}
					else
						this[key] = opts[key];
			}
			
	return this;
};

ENUM.prototype.revise = function(opts) {	
	return this.copy( opts , this.opts);
}

/**
 * extend or replace the existing ENUM configuration.
 * */
ENUM.prototype.config = function (opts) {
	return new ENUM(opts);
};

/**
 * @method test
 * 
 * Unit-test this ENUM as documented in the client.js units.
 * */
ENUM.prototype.test = function (opts) {
	
	var N = opts.N || process.argv[3];

	if (N in opts)
		if (typeof opts[N] == "function") {
			
			opts[N]();

		}
		else
			console.log(`Test ${N} must be a function`);
	else {
		var tests = [];
		for (var n in opts)
			if (typeof opts[n] == "function")
				if ( opts[n] != this[n] )
					tests.push(n);
				
		switch (tests.length) {
			case 0: 
				return console.log("No tests are available");
			case 1:
				return console.log(`Test ${tests} is available`);
				
			default:						
				console.log(`Tests ${tests} are available`);
		}
	}
	
	return ENUM;
}

/**
 * @method initialize
 * 
 * Flush the ENUM call stack defined by Function keys in the extend.
 * */
ENUM.prototype.flush = function () {
	
	this.callStack.each( function (n,call) {
		call();
	});
	
}

Array.prototype.each = function (cb) {
	for (var n=0,N=this.length; n<N; n++) cb(n,this[n]);
};

module.exports = new ENUM({});

