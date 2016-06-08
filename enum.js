var ENUM = module.exports = {
	config: function (opts) {
		
		/**
		 * @method copy
		 * @public
		 * @param {Object} src source hash
		 * @param {Object} tar target hash
		 * @param {Function} cb callback(idx,val) returns true to drop
		 * @return {Object} target hash
		 * 
		 * Shallow copy of source hash under supervision of callback. If
		 * a merge key is encountered, the copy becomes a deep merge. 
		 * If a constructor source key is encountered, the key's methods 
		 * are added to the source's prototype.
		 */
		opts.copy= function(src,tar,cb) {

			var merge = GEO.merge;
			
			if (merge)
				if (cb) {
					for (var key in src)  {
						var val = src[key];
						if ( !cb(key,val) ) 
							if (val == null) 
								tar[key] = val;
							else
							if (val.constructor == Object)
								if (merge in val) 
									GEO.copy(val.merge, tar[key]);
								else
									tar[key] = val;
							else 
								tar[ke] = val;
					}
				}
				else 
					for (var key in src) {
						var val = src[key];
						if (val == null) 
							tar[key] = val;
						else
						if (val.constructor == Object)
							if (merge in val) 
								GEO.copy(val.merge, tar[key]);
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
		 * a merge key is encountered, the clone becomes a deep merge.
		 */
		opts.clone= function(src,cb) {
			return GEO.copy(src,{},cb);
		};
		
		/**
		 * @method each
		 * @public
		 * @param {Object} src source hash
		 * @param {Function} cb callback (idx,val) returning true or false
		 * 
		 * Shallow enumeration over source hash until callback returns true.
		 * */
		opts.each= function(src,cb) {
			
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
		opts.extend= function (classes,methods) {
			
			if (methods)
				opts.copy(methods, classes.prototype);
			else
				opts.each(classes, function (cls, methods) {
					opts.copy(methods, cls.prototype);				
				});	
		};
		
	}
};	
