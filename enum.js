/// UNCLASSIFIED 

Array.prototype.each = 	function (cb) {
/**
@method each
@member Array
Enumerate through array until optional callback(idx, val, isLast) returns isEmpty.  Returns isEmpty.
*/
	
	if (cb) {
		var last = this.length-1;
		this.forEach( (val,idx) => cb( idx, this[idx], idx == last ) );
	}
	
	else
		return !this.length;	
}

Array.prototype.extend = function (con) {
/**
 * @method extend
 * @member ENUM
 * Extend the opts prototype with specified methods, or, if no methods are provided, 
 * extend this ENUM with the given opts.  Array, String, Date, and Object keys are 
 * interpretted to extend their respective prototypes.  
 * */
	this.forEach( function (proto) {
		//console.log("ext", proto.name, con);
		con.prototype[proto.name] = proto;
	});
}

var ENUM = module.exports = {
	Log: console.log,

	/*Test: function (opts,N) {
	/* *
	 * @method test
	 * @member ENUM
	 * Unit-test opts[N].
	 * * /

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
	}, */
	
	Copy: (src,tar,deep) => {
	/**
	 @method copy
	 @member ENUM
	 @param {Object} src source hash
	 @param {Object} tar target hash
	 @param {String} deep copy key 
	 @return {Object} target hash
	 
	 Copy source hash to target hash under supervision of optional callback. 
	 If a deep key deliminator (e.g. ".") is specified.  If a deep key delimininator is 
	 provided, src  keys are treated as keys into the target thusly:
	 
	 		{	
	 			A: value,			// sets target[A] = value
	 
	 			"A.B.C": value, 	// sets target[A][B][C] = value
	 
	 			"A.B.C.": {			// appends X,Y to target[A][B][C]
	 				X:value, Y:value, ...
	 			},	
	 
	 			OBJECT: [ 			// prototype OBJECT (Array,String,Date,Object) = method X,Y, ...
	 				function X() {}, 
	 				function Y() {}, 
	 			... ]
	 
	 		} 
	 
	 */
		for (var key in src) {
			var val = src[key];

			if (deep) {
				//Log("deep", key);
				switch (key) {
					case Array: 
						val.extend(Array);
						break;

					case "String": 
						val.extend(String);
						break;

					case "Date": 
						val.extend(Date);
						break;

					case "Object": 	
						cal.extend(Object);
						break;

					/*case "Function": 
						this.callStack.push( val ); 
						break; */

					default:

						var keys = key.split(deep), Tar=tar;

						for (var n=0,N=keys.length-1,idx=keys[0] ; 
								n<N && idx ; 
								idx=keys[++n]	) 	
								
							if ( idx in Tar ) 
								Tar = Tar[idx];
							else
								Tar = Tar[idx] = new Array();

						/*if (cb && cb(key,val)) {
							var x=1;
						}*/

						/*else
						if (!Tar)
							throw new Error(`no copy target "${keys}"`);  

						else */
						if (idx)  // set target
							Tar[idx] = val;

						else	// append to target
						if (val.constructor == Object) 
							for (var n in val) 
								Tar[n] = val[n];

						else
							Tar.push( val );

				}
			}
			
			/*else
			if (cb) 
				tar[key] = cb( key, val);  */

			else
				tar[key] = val;
		}

		return tar;
	},

	Each: (src,cb) => {
	/**
	 * @method each
	 * @member ENUM
	 * @param {Object} src source hash
	 * @param {Function} cb callback (idx,val, isLast) returns true or false to terminate
	 * 
	 * Enumerates src with optional callback cb(idx,val,isLast) and returns isEmpty.
	 * */
		var 
			keys = Object.keys(src),
			last = keys.length-1;

		if (cb)
			keys.forEach( (key,idx) => cb(key, src[key], idx == last ) );

		return keys.length==0;

		/*		
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
		}*/
	}

};

const {Each, Copy, Log} = ENUM;

[	
	function joinify(cb) {
	/*
	Joins a list 
		[	a: null,
			g1: [ b: null, c: null, g2: [ x: null ] ],
			g3: [ y: null ] ].joinify()
	
	into a string
		"a,g1(b,c,g2(x)),g3(y)"
			
	A callback cb(head,list) can be provided to join the current list with the current head.
	*/

		var 
			src = this,
			rtn = [];
		
		Each(src, (key, list) => {
			if ( typeof list == "string" ) 
				rtn.push( list );
			
			else
				try {
					rtn.push( cb 
						? cb( key, list ) 
						: key + "(" + list.joinify() + ")" 
					);
				}
				catch (err) {
					rtn.push(list);
				}
		});
		
		return cb ? cb(null,rtn) : rtn.join(",");
	},

	function splitify(dot) {
	/*
	Splits a list 
		["a", "g1.b", "g1.c", "g1.g2.x", "g3.y"].splitify( "." )
		
	into a list
		 [	a: null,
			g1: [ b: null, c: null, g2: [ x: null ] ],
			g3: [ y: null ] ]
	
	*/
		var src = {};
		this.forEach( (key) => {
			src[key] = key;
		}); 
		
		return Copy(src,[],dot || ".");
	}
].extend(Array);

// UNCLASSIFIED
