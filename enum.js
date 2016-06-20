/**
 * @class enum
 * @public
 * 
 * Provides the standard enumerators: copy, clone, each, config, extend,
 * test, and initialize.
 * */

function ENUM(opts) {
	this.args = process.argv;
	this.mergekey = "merge";
	this.inits = [];
	
	this.config(opts);
}

/**
 * @method copy
 * @public
 * @param {Object} src source hash
 * @param {Object} tar target hash
 * @param {Function} cb callback(idx,val) returns true to drop
 * @return {Object} target hash
 * 
 * Shallow copy of source hash under supervision of callback. If
 * a MERGEKEY key is encountered, the copy becomes a deep MERGEKEY. 
 * If a constructor source key is encountered, the key's methods 
 * are added to the source's prototype.
 */
ENUM.prototype.copy = function copy(src,tar,cb) {

	var mergekey = this.mergekey;
	
	if (mergekey)
		if (cb) {
			for (var key in src)  {
				var val = src[key];
				if ( !cb(key,val) ) 
					if (val == null) 
						tar[key] = val;
					else
					if (val.constructor == Object)
						if (mergekey in val) 
							this.copy(val.mergekey, tar[key]);
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
				else
				if (val.constructor == Object)
					if (mergekey in val) 
						this.copy(val[mergekey], tar[key]);
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
ENUM.prototype.clone = function(src,cb) {
	return this.copy(src,{},cb);
};
	
/**
 * @method each
 * @public
 * @param {Object} src source hash
 * @param {Function} cb callback (idx,val) returning true or false
 * 
 * Shallow enumeration over source hash until callback returns true.
 * */
ENUM.prototype.each = function(src,cb) {
	
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
 * Extend ENUM prototypes with specified methods.
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
				default:
					this[key] = opts[key];
			}
};

/**
 * Extend or replace the existing ENUM configuration.
 * */
ENUM.prototype.config = function (opts) {
	if (opts) {
		if (opts.init) this.inits.push(opts.init);
		return this.copy(opts,this);
	}
};

/**
 * @method test
 * 
 * Unit-test this ENUM as documented in the client.js units.
 * */
ENUM.prototype.test = function (opts, cb) {
	
	this.config(opts);
	
	var N = this.args[3];
	
	if (N in this)
		if (typeof this[N] == "function") {
			
			this[N]();
			
			if (cb) cb(this);
		}
		else
			console.log(`${N} must be a function`);
	else {
		var tests = [];
		for (var n in this)
			if (typeof this[n] == "function")
				if (this.hasOwnProperty(n))
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

}

/**
 * @method init
 * 
 * Calls all ENUM init initializers that were passed during config.
 * */
ENUM.prototype.initialize = function () {
	
	this.inits.each( function (n,init) {
		init();
	});
	
}

Array.prototype.each = function (cb) {
	for (var n=0,N=this.length; n<N; n++) cb(n,this[n]);
};

module.exports = new ENUM;

