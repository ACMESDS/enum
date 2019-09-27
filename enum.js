/// UNCLASSIFIED 

Array.prototype.Extend = function (con) {
/*
@method Extend
@member ENUM
Extend the opts prototype with specified methods, or, if no methods are provided, 
extend this ENUM with the given opts.  Array, String, Date, and Object keys are 
interpretted to extend their respective prototypes.  
*/
	this.forEach( function (proto) {
		//console.log("ext", proto.name, con);
		con.prototype[proto.name] = proto;
	});
}

const { Copy, Each, Log, isArray } = module.exports = {
	isString: obj => obj.constructor.name == "String",
	isNumber: obj => obj.constructor.name== "Number",
	isArray: obj => obj.constructor.name == "Array",
	isKeyed: obj => Object.keys(obj).length ? true : false,
	isDate: obj => obj.constructor.name == "Date",
	isFunction: obj => obj.constructor.name == "Function",
	isError: obj => obj.constructor.name == "Error",
	isBoolean: obj => obj.constructor.name == "Boolean",
	isBuffer: obj => obj.constructor.name == "Buffer",
	
	isEmpty: opts => {
		for ( var key in opts ) return false;
		return true;
	},
	
	Serialize: function (obj, fetcher, cb) {
		
		function fetch(rec, cb) {
			fetcher( rec.arg1, info => {
				obj[ rec.arg0 ] = info; 
				cb(rec,info);
			});
		}
		
		var recs = [];
		Each( obj, (key, val) => recs.push( {ID: recs.length, arg0: key, arg1: val} ) );
		
		recs.serialize( fetch, (rec,info) => { if (!rec) cb(obj); });
	},
	
	Log: console.log,

	Copy: (src,tar,deep) => {
	/**
	@method copy
	@member ENUM
	@param {Object} src source hash
	@param {Object} tar target hash
	@param {String} deep copy key 
	@return {Object} target hash

	Copy source hash to target hash; thus Copy({...}, {}) is equivalent to new Object({...}).
	If a deep deliminator (e.g. ".") is provided, src  keys are treated as keys into the target thusly:

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

			if (deep) 
				switch (key) {
					case Array: 
						val.Extend(Array);
						break;

					case "String": 
						val.Extend(String);
						break;

					case "Date": 
						val.Extend(Date);
						break;

					case "Object": 	
						val.Extend(Object);
						break;

					/*case "Function": 
						this.callStack.push( val ); 
						break; */

					default:

						var 
							keys = key.split(deep), 
							Tar = tar,
							idx = keys[0],
							N = keys.length-1;

						for ( var n=0; n < N ;  idx = keys[++n]	) { // index to the element to set/append
							if ( idx in Tar ) {
								if ( !Tar[idx] ) Tar[idx] = new Object();
								Tar = Tar[idx];
							}

							else
								Tar = Tar[idx] = new Array();
						}

						if (idx)  // not null so update target
							Tar[idx] = val;

						else  // null so append to target
						if (val.constructor == Object) 
							for (var n in val) 
								Tar[n] = val[n];

						else
							Tar.push( val );
				}

			else
				tar[key] = val;
		}

		return tar;
	},

	Each: ( A, cb ) => {
	/**
	@method each
	@member ENUM
	@param {Object} A source object or array
	@param {Function} cb callback (key,val, cb) 
	 
	Enumerates A with callback cb(key,val,xcb).  If the cb wishes to be serialized, then it
	should test and callback xcb according to:
	
			if (xcb) 
				xcb( rec )  // where rec = null to bypass rec stacking
			
			else 
				// key is resulting rec stack when indexing of A has finished
	*/
		
		var 
			calls = 0, returns = 0, keys = Object.keys(A);

		if ( keys.length ) {
			var recs = {};
			keys.forEach( key => {
				calls++;
				cb( key, A[key], rec => {
					if (rec) recs[key] = rec;
					if ( ++returns == calls ) cb(recs);
				});
			});
		}
		
		else
		if ( A.forEach ) {
			var recs = [];
			A.forEach( (key,val) => {
				calls++;
				cb( key, val, rec => {
					if (rec) recs.push(rec);
					if ( ++returns == calls ) cb(recs);
				});
			});
		}
		
		// if ( !calls && returns ) cb(recs);
	}
	 
	/*
	Each = (src,cb) => {
	/ **
	 * @method each
	 * @member ENUM
	 * @param {Object} src source hash
	 * @param {Function} cb callback (idx,val, isLast) returns true or false to terminate
	 * 
	 * Enumerates src with optional callback cb(idx,val,isLast) and returns isEmpty.
	 * * /
		var 
			keys = Object.keys(src),
			last = keys.length-1;

		if (cb)
			keys.forEach( (key,idx) => cb(key, src[key], idx == last ) );

		return keys.length==0;
	};
	*/
};

[	
	function serialize(fetcher, cb) {  
		/*
		callback cb(rec,info) for each record and cb(null,fails) at end, where the
		fetcher( rec, info => {...}) provides the cb info on each record.
		*/
		function fetchInfo(rec, cb) {  
			fetcher(rec , info => cb(rec, info) );
		}

		var fetched = 0, fails = 0, recs = this, fetches = recs.length;

		if ( fetcher ) // serialize
			if ( fetches ) // number of records to be fetched
				recs.forEach( rec => {  // fetch results for each record
					fetchInfo( rec, (rec, results) => {  // process results
						cb( rec, results );   // feed results to callback

						if ( !results) fails++;

						if (++fetched == fetches) cb( null, fails );  // fetches exhausted so we are done
					});
				});

			else  // no records so we are done
				cb( null, fails);
		
		else // just enumerate
			recs.forEach( cb );
	}
].Extend(Array);

[ 
	function serialize( indexer, cb ) {
		var 
			recs = [],
			did = 0,
			This = this;
		
		if (cb) {
			indexer( rec => {		// index over the records
				recs.push( new Object(rec) ); 	// push the returned record
				This( rec, () => {
					if ( ++did == recs.length )  { // if all records have been indexed  ..
						recs.forEach( rec => cb(rec) ); 	// feed all records to callback
						cb( null ); // signal at end
					}
				});
			});
			
			if ( !did ) cb( null );  // signal at end
		}
		
		else
			indexer( This );
			
	}
].Extend(Function);

[
	function trace(msg,sql) {	
		console.log(this+"",msg);

		if (sql) {
			var 
				log = "INSERT INTO openv.syslogs SET ? ON DUPLICATE KEY UPDATE Count=Count+1",
				tokens = msg.toLowerCase().split(" "),
				info = {action: tokens[0], target: tokens[1], module: this+"", t: new Date(), on: "", for: ""};
			
			tokens.forEach( (token, idx) => {
				if ( idx ) 
					if ( idx % 2 == 0 )
						if ( token in info )
							info[token] = tokens[idx+1];
			});
			
			switch ( token = tokens[0] ) {
				case "select":
				case "update":
				case "insert":
				case "delete":
					info.action = "sql";
					info.target = "dataset";
					sql.query(log, info);
					break;

				case "sendfile": 
					info.target = info.target.split(".").pop();
					sql.query(log, info);
					break;
					
				default:

					if ( token.startsWith("db") ) {
						info.action = token.substr(2);
						sql.query(log, info);
					}
						
					else
					if ( token.startsWith("dog") ) {
						info.target = "db";
						sql.query(log, info);
					}
						
					else
					if ( token.endsWith("ds") ) {
					}
					
					else
						sql.query(log, info);
			}
					

		}
	},
		
	function serialize( fetcher, regex, key, cb ) {  //< callback cb(str) after replacing regex using fetcher( rec, (ex) => "replace" ) and string place holder key
		var 
			recs = [],
			results = this.replace( regex, (arg0, arg1, arg2, arg3, arg4) => {  // put in place-holders
				//recs.push( new Object( {idx: recs.length, url: url, opt:opt} ) );
				//recs.push( new Object( {ID: recs.length, arg0:arg0, arg1:arg1, arg2:arg2, arg3:arg3, arg4:arg4} ) );  //<<<< need new Object ??
				recs.push( {ID: recs.length, arg0:arg0, arg1:arg1, arg2:arg2, arg3:arg3, arg4:arg4} );
				return key+(recs.length-1);
			});

		recs.serialize( fetcher, (rec,info) => {  // update place-holders with info 
			if (rec) 
				//results = results.replace(key+rec.idx, info);
				results = results.replace(key+rec.ID, info);
			
			else
				cb( results );
		});

	}
	
].Extend(String);

//================== Unit testing

switch (process.argv[2]) {	//< unit testers
	case "?":
		Log("unit test with 'npm enum.js [E1 || ...]'");
		break;
		
	case "E1": 
		Log({
			shallowCopy: Copy( {a:1,b:2}, {} ),
			deepCopy: Copy({ a:1,"b.x":2 }, {b:{x:100}}, ".")
		});
		break;
}

// UNCLASSIFIED
