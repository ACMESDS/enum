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
	
	copy: function (src,tar,deep,cb) {
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
	
	each: function (src,cb) {
	/**
	 * @method each
	 * @member ENUM
	 * @param {Object} src source hash
	 * @param {Function} cb callback (idx,val, isLast) returns true or false to terminate
	 * 
	 * Enumerates src with optional callback cb(idx,val,isLast) and returns isEmpty.
	 * */

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
			
	},

	extend: function (opts,protos) {
	/**
	 * @method extend
	 * @member ENUM
	 * Extend the opts prototype with specified methods, or, if no methods are provided, 
	 * extend this ENUM with the given opts.  Array, String, Date, and Object keys are 
	 * interpretted to extend their respective prototypes.  A Function key is interpretted
	 * to push the function to the ENUM callStack (which can be drained by the ENUM flush
	 * method).
	 * */
	
		if (protos) {
			protos.each(function (n,proto) {
				opts.prototype[proto.name] = proto;
			});
			return this;
		}
		
		if (opts)
			return this.copy(opts, this, "."); 
	},

	test: function (N, opts) {
	/**
	 * @method test
	 * @member ENUM
	 * Unit-test opts[N].
	 * */

		//var N = opts.N || process.argv[2];

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

	flush: function () {
	/**
	 * @method flush
	 * @private
	 * @member ENUM
	 * Flush the ENUM call stack defined by the extend() Function keys.
	 * */

		this.callStack.each( function (n,call) {
			call();
		});

	}

};

Array.prototype.each = 	function (cb) {
/**
@method each
@member Array
Enumerate through array until optional callback(idx, val, isLast) returns isEmpty.  Returns isEmpty.
*/
	var N=this.length, last=N-1;
	
	if (cb) 
		for (var n=0; n<N; n++) 
			if ( cb(n, this[n], n == last) ) return true;
		
	return last<0;
	
}

module.exports = new ENUM();

// UNCLASSIFIED
