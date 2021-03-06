/// UNCLASSIFIED 

/**
@class ENUM
Provides basic enumerators as documented in README.md.

@requires os
@requires cluster
*/

var
	OS = require("os"),
	CLUSTER = require("cluster");

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

const { Copy, Each, Log, isArray, typeOf, Stream, isObject } = module.exports = {
	typeOf: obj => obj.constructor.name,
	isString: obj => typeOf(obj) == "String",
	isNumber: obj => typeOf(obj)== "Number",
	isArray: obj => typeOf(obj) == "Array",
	isKeyed: obj => Object.keys(obj).length ? true : false,
	isObject: obj => typeOf(obj) == "Object",
	isDate: obj => typeOf(obj) == "Date",
	isFunction: obj => typeOf(obj) == "Function",
	isError: obj => typeOf(obj) == "Error",
	isBoolean: obj => typeOf(obj) == "Boolean",
	isBuffer: obj => typeOf(obj) == "Buffer",
	
	isEmpty: opts => {
		for ( var key in opts ) return false;
		return true;
	},
	
	Log: console.log,

	Copy: (src,tar,deep) => {
	/**
	@method Copy
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
	@method Each
	@member ENUM
	@param {Object, Array} A source object or array
	@param {Function} cb callback (key,val) 
	 
	Enumerates all elements of A (null or not) with callback cb(key,val).
	*/
		if ( A.forEach ) 
			A.forEach( (val,idx) => cb( idx, val ) );

		else
			Object.keys(A).forEach( key => cb( key, A[key] ) );
	},
	
	Stream: (A,cb) => {	
	/**
	@method Stream
	@member ENUM
	@param {Object, Array} A source object or array
	@param {Function} cb callback ( rec, key, xcb) 
	 
	Stream Array/Object A to callback at each record, then callback again at end, where:
	
		cb( (rec,key,xcb) => {
			if ( xcb ) // still indexing 
				xcb( msg )  // pass nothing to bypass msg stacking

			else 
				// indexing done key contains msg stack
		})
	*/
		var 
			returns = 0, 
			indexed = isArray(A),
			calls = indexed ? A.length : Object.keys(A).length, 
			msgs = indexed ? [] : {};

		Each( A, (key, rec) => {
			cb( rec, key, msg => {
				if ( msg != undefined ) 
					if ( indexed ) 
						msgs.push( msg );
					else
						msgs[key] = msg;

				if ( ++returns == calls ) 
					cb( null, msgs );
			});
		});
		
		if ( !calls ) cb( null, msgs );
	}
};

[	
	function serialize(fetcher, cb) {
	/*
	Serialize this Array to the callback cb(rec,info) or cb(null,stack) at end given 
	a sync/async fetcher( rec, xcb ).
	*/
		
		Stream( this, (rec, key, xcb) => {
			if ( xcb )
				fetcher( rec, info => {
					cb(rec, info);	// forward results
					xcb();	// signal record processed w/o stacking any results
				});	
			
			else 
				cb( null, xcb );
		});
	}
].Extend(Array);

[
	function trace(msg,req,fwd) {	
		function cpu() {
			var sum = 0, util = OS.loadavg();
			for ( var n=0, N = util.length; n<N; n++) sum += util[0];
			return sum / N;
		}
		
		function mem() {
			return OS.freemem() / OS.totalmem();
		}
		
		function node() {
			return OS.hostname()+"."+(CLUSTER.isMaster ? 0 : CLUSTER.worker.id);
		}
		
		if ( fwd ) fwd(this.substr(0,2).toUpperCase()+">"+msg);
		
		if ( req ) {
			const { sql, query, client, action, table } = req;
			
			if ( sql ) 
				sql.query( "INSERT INTO openv.syslogs SET ? ", {
					Node: node(),
					Client: client,
					Table: table,
					At: new Date(),
					Case: query.Name || "",
					Action: action,
					Module: this,
					cpuUtil: cpu(),
					memUtil: mem(),
					Message: msg+""
				});
		}
		
		else
			Log(this.substr(0,2).toUpperCase()+">"+msg);
	},
		
	function serialize( fetcher, regex, key, cb ) {  //< callback cb(str) after replacing regex using fetcher( rec, (ex) => "replace" ) and string place holder key
	/*
	Serialize this String to the callback(results) given a sync/asyn fetcher(rec,xcb) where
	rec = {ID, arg0, arg1, ...} contains args produced by regex.  Provide a unique placeholder
	key to back-substitute results.
	
	For example:
	
		"junkabc;junkdef;"
		.serialize( (rec,cb) => cb("$"), /junk([^;]*);/g, "@tag", msg => console.log(msg) )
	
	produces:
	
		"$$"
*/
		var 
			recs = [],
			results = this.replace( regex, (arg0, arg1, arg2, arg3, arg4) => {  // put in place-holders
				recs.push( {ID: recs.length, arg0:arg0, arg1:arg1, arg2:arg2, arg3:arg3, arg4:arg4} );
				return key+(recs.length-1);
			});

		recs.serialize( fetcher, (rec,info) => {  // update place-holders with info 
			if (rec) 
				results = results.replace( key+rec.ID, str => info );

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
