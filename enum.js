// UNCLASSIFIED 

/**
 * @class enum
 * */

function ENUM(opts) { 
	if (opts) this.copy(opts,this);
	this.callStack = [];
}

/**
 * @method copy
 * @public
 * @param {Object} src source hash
 * @param {Object} tar target hash
 * @param {String} deep copy key deliminator
 * @param {Function} cb callback(idx,val) returns true to drop
 * @return {Object} target hash
 * 
 * Copy source hash to target hash under supervision of optional callback. 
 * If a deep key deliminator (e.g. ".") is specified, the copy is deep where src 
 * keys are treated as keys into the target thusly:
 * 
 * 		{	
 * 			A: value,			// sets target[A] = value
 * 
 * 			"A.B.C": value, 	// sets target[A][B][C] = value
 * 
 * 			"A.B.C.": {			// appends X,Y to target[A][B][C]
 * 				X:value, Y:value, ...
 * 			},	
 * 
 * 			OBJECT: [ 			// prototype OBJECT (Array,String,Date,Object) = method X,Y, ...
 * 				function X() {}, 
 * 				function Y() {}, 
 * 			... ],
 * 
 * 			Function: 			// append method X to ENUM callback stack
 * 				function X() {}
 * 		} 
 * 
 */
ENUM.prototype.copy = function (src,tar,deep,cb) {

	for (var key in src) {
		var val = src[key];
		
		if (deep)
			switch (key) {
				case "Array": 
					val.each(function (n,val) {
						Array.prototype[val.name] = val; 
					});
						
					break;

				case "String": 
					val.each(function (n,val) {
						String.prototype[val.name] = val; 
					});
						
					break;
					
				case "Date": 
					val.each(function (n,val) {
						Date.prototype[val.name] = val; 
					});
						
					break;

				case "Object": 	
					val.each(function (n,val) {
						Object.prototype[val.name] = val; 
					});
						
					break;
					
				case "Function": 
					this.callStack.push( val ); 

					break;
			
				default:
				
					var keys = key.split(deep), Tar=tar;
					
					for (var n=0,N=keys.length-1,idx=keys[0] ; 
							n<N && idx ; 
							idx=keys[++n]	) 	Tar = Tar[idx];


					if (cb && cb(key,val)) {
						var x=1;
					}
					
					else
					if (!Tar)
						throw new Error(`no copy target "${keys}"`);

					else
					if (idx)
						Tar[idx] = val;

					else
					if (val.constructor == Object) 
						for (var n in val) 
							Tar[n] = val[n];

					else
						Tar[idx] = val;
						
			}
		else
			tar[key] = val;
	}

	return tar;
};
	
/*
 * @method legacy-copy
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
 * ENUM.prototype.copy = function (src,tar,cb) {

	if (MERGEKEY)
		if (cb) {
			for (var key in src)  {
				var val = src[key];
				if ( !cb(key,val) ) 
					if (val == null) 
						tar[key] = val;
					
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
				if (val == null) 
					tar[key] = val;

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
*/

/**
 * @method clone
 * @public
 * @param {Object} src source hash
 * @param {Function} cb callback(idx,val) returns true to drop
 * @return {Object} cloned hash
 * 
 * Shallow clone of source hash under supervision of callback.  
 */
ENUM.prototype.clone = function (opts,cb) {
	return this.copy(opts,{},null,cb);
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
	
	if (methods) {
		methods.each(function (n,method) {
			opts.prototype[method.name] = method;
		});
		return this;
	}
	else
		return this.copy(opts,this,"."); 
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
 * Unit-test a module as documented in its config.js.
 * */
ENUM.prototype.test = function (opts) {
	
	var N = opts.N || process.argv[2];

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
				console.log(`Configurations ${tests} are available`);
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

/*
Array.prototype.each = function (cb) {
	for (var n=0,N=this.length; n<N; n++) cb(n,this[n]);
};

String.prototype.parse = function(def) {
	try {
		return JSON.parse(this);
	}
	catch (err) {
		if (typeof def == "function") 
			return def(this);
		else
			return def;
	}
}

String.prototype.tag = function (el,at) {
	
	if (at) {
		var rtn = "<"+el+" ";
		
		for (var n in at) rtn += n + "='" + at[n] + "' ";
		
		switch (el) {
			case "embed":
			case "img":
			case "link":
				return rtn+">" + this;
			default:
				return rtn+">" + this + "</"+el+">";
		}
		//return rtn+">" + this + "</"+el+">";
	}
	else {
		var rtn = this + "?";

		for (var n in el) rtn += n + "=" + el[n] + "&";
		return rtn;
	}
		
}
*/

Array.prototype.each = function (cb) {
	for (var n=0,N=this.length; n<N; n++) cb(n,this[n]);
}

module.exports = new ENUM();

// UNCLASSIFIED
