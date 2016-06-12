/**
 * @module enum
 * @public
 * 
 * Appends the standard enumerators (copy, clone, each, and extend) to the config argument.
 * */
module.exports = {
	config: function (ENUM) {
		
		/**
		 * @method copy
		 * @public
		 * @param {Object} src source hash
		 * @param {Object} tar target hash
		 * @param {Function} cb callback(idx,val) returns true to drop
		 * @return {Object} target hash
		 * 
		 * Shallow copy of source hash under supervision of callback. If
		 * a mergeKey key is encountered, the copy becomes a deep mergeKey. 
		 * If a constructor source key is encountered, the key's methods 
		 * are added to the source's prototype.
		 */
		ENUM.copy = function(src,tar,cb) {

			var mergeKey = ENUM.mergeKey;
			
			if (mergeKey)
				if (cb) {
					for (var key in src)  {
						var val = src[key];
						if ( !cb(key,val) ) 
							if (val == null) 
								tar[key] = val;
							else
							if (val.constructor == Object)
								if (mergeKey in val) 
									ENUM.copy(val.mergeKey, tar[key]);
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
							if (mergeKey in val) 
								ENUM.copy(val[mergeKey], tar[key]);
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
		 * a mergeKey is encountered, the clone becomes a deep merge.
		 */
		ENUM.clone = function(src,cb) {
			return ENUM.copy(src,{},cb);
		};
		
		/**
		 * @method each
		 * @public
		 * @param {Object} src source hash
		 * @param {Function} cb callback (idx,val) returning true or false
		 * 
		 * Shallow enumeration over source hash until callback returns true.
		 * */
		ENUM.each = function(src,cb) {
			
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
		 * Extend classes with specified methods.
		 * */
		ENUM.extend = function (opts,methods) {
			
			if (methods)
				for (var key in methods) 
					opts.prototype[key] = methods[key];
			else
				for (var key in opts) 
					switch (key) {
						case "Array": 	ENUM.extend(Array, opts.Array); break;
						case "String": 	ENUM.extend(String, opts.String); break;
						case "Date": 	ENUM.extend(Date, opts.Date); break;
						case "Object": 	ENUM.extend(Object, opts.Object); break;
						default:
							ENUM[key] = opts[key];
					}
		};
		

		return ENUM;
	}
};	
