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
						val.extend(Object);
						break;

					/*case "Function": 
						this.callStack.push( val ); 
						break; */

					default:

						var 
							keys = key.split(deep), 
							Tar = tar,
							idx = keys[0];
						
						for (  // index to the element to set/append
								var n=0,N=keys.length-1 ; 
								n < N ; 
								idx = keys[++n]	) 	
								
							if ( idx in Tar ) 
								Tar = Tar[idx];
							else
								Tar = Tar[idx] = new Array();

						if (idx)  // set target
							Tar[idx] = val;

						else  // append to target
						if (val.constructor == Object) 
							for (var n in val) 
								Tar[n] = val[n];

						else
							Tar.push( val );

						/*
						for (var n=0,N=keys.length-1,idx=keys[0] ; 
								n < N && idx ; 
								idx = keys[++n]	) 	
								
							if ( idx in Tar ) 
								Tar = Tar[idx];
							else
								Tar = Tar[idx] = new Array();

						if (idx)  // set target
							Tar[idx] = val;

						else  // append to target
						if (val.constructor == Object) 
							for (var n in val) 
								Tar[n] = val[n];

						else
							Tar.push( val );
					*/
				}
			}
			
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
	function serialize(fetch, cb) {  //< callback cb(rec,info) or cb(null,fails) given an info fetcher fetch( rec, (info) => )
		function fetchInfo(rec, cb) {  
			fetch(rec , (info) => cb(rec, info) );
		}

		var fetched = 0, fails = 0, recs = this;

		if ( fetches = recs.length ) // number of records to be fetched
			recs.forEach( (rec,idx) => {  // fetch results for each record
				fetchInfo( rec, (rec, results) => {  // process results
					if (results)   // fetch worked so feed results to callback
						cb( rec, results );  
					
					else  // fetch failed
						fails++;

					if (++fetched == fetches) cb( null, fails );  // fetches exhausted so we are done
				});
			});

		else  // no records so we are done
			cb( null, fails);
	}
].extend(Array);

[
	/*
	function serialize( fetcher, regex, key, cb ) {
		
		var 
			fetches = [],
			parses = 0,
			fails = 0,
			results = this.replace(new RegExp(regex, "g"), (str, url) => {   // /<!---fetch ([^>]*)?--->/g
				//Log("fetch scan", parses);

				fetcher( url, ( info ) => {
					if ( info )
						fetches.push( info );
					
					else
						fails++;

					//Log("fetch", fetches.length, parses);

					if ( fetches.length == parses ) {  // all expressions parsed so we are done
						fetches.forEach( (sub, idx) => {	// substitute fecthed results at key tokens
							results = results.replace(key+idx, sub);
						});
						cb( results, fails );
					}
				});
				return key+(parses++);
			});
		
		//Log("#fetched found=", parses, results);
		if ( !parses ) cb(results, fails);
	} */
	function serialize( fetch, regex, key, cb ) {
		var 
			recs = [],
			results = this.replace(new RegExp(regex, "g"), (str, url) => {
				recs.push( new Object( {idx: recs.length, url: url} ) );
				return key+(recs.length-1);
			});

		recs.serialize( fetch, (rec,info) => {
			if (rec) 
				results = results.replace(key+rec.idx, info);
			
			else
				cb( results );
		});

	}
	
].extend(String);

// UNCLASSIFIED
