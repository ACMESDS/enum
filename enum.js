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
	
	Copy: (src,tar,deep,cb) => {
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
	 * 			... ]
	 * 
	 * 		} 
	 * 
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
			}
			
			else
			if (cb) 
				tar[key] = cb( key, val);

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

}

const {Copy, Log} = ENUM;

[
	function trace(msg,sql) {	
		var pre = this+"";

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
	}
].extend(String);

[ 

	function Copy(tar, dot, cb) {
	/*
		[a, g1.b, g1.c, g1.g2.f, g1.g2.e, g3.x, g3.y]
		--> { 
			a: null,
			"g1.": [b,c],
			"g1.g2.": [f,e]
			
		--> [a, {g1: [b,c, g2:[f,e]}, g3: [x,y] ]
		--> "a,g1(b,c, g2(d,e)), g3(x,y)"								
	*/
		var src = {};
		
		this.forEach( (key) => {
			var 
				keys = key.split(dot),
				tail = keys.pop(),
				index = keys.join(dot)+dot,
				list = src[index];

			if ( !list ) list = src[index] = [];
			
			list.push(tail);
			
			srcKey.split(dot).forEach( (key,idx) => {			
				if (idx == grp.length-1) {
					var set = src[grp+
					if (set[grp+dot] = [];
				
		});
	}
].extend(Array);

// UNCLASSIFIED
