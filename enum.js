/// UNCLASSIFIED 

function ENUM(opts) { 
	if (opts) this.copy(opts,this,".");
	this.callStack = [];
}

ENUM.prototype = {
	trace: function (pre,msg,sql) {	
		if (msg.constructor == String)
			if (sql) {
				var 
					parts = msg.split(" "),
					action = parts[0],
					target = parts[1],
					client = "";

				parts.each( function (n,part) {
					if ( part == "FOR" ) client = parts[n+1];
				});

				sql.query("INSERT INTO openv.syslogs SET ?", {
					Action: action,
					Target: target,
					Module: pre,
					t: new Date(),
					Client: client
				});
				
				console.log(pre,msg);
			}
			else
				console.log(pre,msg);
		
		else
			console.log(pre,msg);
	},
	
	/**
	 * @method copy
	 * @member ENUM
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
	copy: function (src,tar,deep,cb) {

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
			if (cb) 
				tar[key] = cb( key, val);

			else
				tar[key] = val;
		}

		return tar;
	},
	
	/**
	 * @method each
	 * @member ENUM
	 * @param {Object} src source hash
	 * @param {Function} cb callback (idx,val) returning true or false
	 * 
	 * Enumerate over source until optional callback(key,val,isLast) returns isEmpty.  Returns isEmpty.
	 * */
	each: function (src,cb) {

		if  (src.constructor == Object) 
			if ( cb ) {
				var last = null; 

				for (var key in src) last = key;

				if ( last && cb )
					for (var key in src)  
						if ( cb( key, src[key], key == last) ) return true;

				return last == null;
			}
			
			else {
				for (var key in src) return false;
				return true;
			}
		
		else {
			var keys = Object.keys(src), N=keys.length, last = N-1;
			
			if ( cb )
				for (var n=0; n<N; n++)  
					if ( cb( key=keys[n], src[key], n == last ) ) return true;
			
			return last<0;
		}
			
		/*
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
			*/
	},

	/**
	 * @method extend
	 * @member ENUM
	 * Extend the opts prototype with specified methods, or, if no methods are provided, 
	 * extend this ENUM with the given opts.  Array, String, Date, and Object keys are 
	 * interpretted to extend their respective prototypes.  A Function key is interpretted
	 * to push the function to the ENUM callStack (which can be drained by the ENUM flush
	 * method).
	 * */
	extend: function (opts,methods) {
	
		if (methods) {
			methods.each(function (n,method) {
				opts.prototype[method.name] = method;
			});
			return this;
		}
		else
		if (opts)
			return this.copy(opts,this,"."); 
	},

	/**
	 * @method test
	 * @member ENUM
	 * Unit-test a module as documented in its config.js.
	 * */
	test: function (opts) {

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

		return this;
	},

	/**
	 * @method flush
	 * @private
	 * @member ENUM
	 * Flush the ENUM call stack defined by the extend() Function keys.
	 * */
	flush: function () {

		this.callStack.each( function (n,call) {
			call();
		});

	}

};

/**
@method each
@member Array
Enumerate through array until optional callback(idx, val, isLast) returns isEmpty.  Returns isEmpty.
*/
Array.prototype.each = 	function (cb) {
	var N=this.length, last=N-1;
	
	if (cb) 
		for (var n=0; n<N; n++) 
			if ( cb(n, this[n], n == last) ) return true;
		
	return last<0;
	
}

Array.prototype.joinify = 	function (sep,cb) {
	
	if (cb) {
		var rtn = [];
		this.each( function (n,rec) {
			rtn.push( cb(rec) );
		});
		return rtn.join(sep);
	}

	else
		return this.join(sep);
}

module.exports = new ENUM({
	String: [
		function tagurl(at) {
			var rtn = this;
			
			for (var n in at) {
				rtn += n + "=";
				switch ( (at[n] || 0).constructor ) {
					//case Array: rtn += at[n].join(",");	break;
					case Array:
					case Date:
					case Object: rtn += JSON.stringify(at[n]); break;
					default: rtn += at[n];
				}
				rtn += "&";
			}
			return rtn;
		},	
		
		/**
		@method tag
		@member String
		*/
		function tag(el,at) {

			var rtn = "<"+el+" ";

			if (at)  
				for (var n in at) rtn += n + "='" + at[n] + "' ";

			switch (el) {
				case "embed":
				case "img":
				case "link":
				case "input":
					return rtn+">" + this;
				default:
					return rtn+">" + this + "</"+el+">";
			}

		}
		
	]
});

// UNCLASSIFIED
