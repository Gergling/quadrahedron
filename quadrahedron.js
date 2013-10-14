// Requirejs is required.
// Angularjs is required.
// jQuery is required.

var quadrahedron = {};
var qh = quadrahedron;

qh.loadLib = function(a) {
	// Loads a path or array of paths indicating the locations of necessary libraries.
	var paths = a;
	if (typeof a === 'string') {paths = [a];}
	requirejs(paths, function() {
		// Perhaps once all loaded (qh.checkList({silent:true}) returns true), run all modules.
		// This sounds as though it should be prompted from a separate function, if the user 
		// decides they want to load the libs with their own functions.
	});

};

qh.getType = function(a) {
	if (jQuery.isArray(a)) {return "array";}
	if (jQuery.isPlainObject(a)) {return "object";}
	if (typeof a === 'string') {return "string";}
	
	// Might be better to use this snippet:
	//var what = Object.prototype.toString;
	//alert(what.call(new Date()));   // "[object Date]" 
	//alert(what.call(function(){})); // "[object Function]" 
	//alert(what.call([]));           // "[object Array]"
};

qh.checkList = function(args) {
	var def = function(arg, defaultValue) {args[arg] = args[arg] || defaultValue;};
	var args = args || {};
	def("verbose", false);
	def("silent", false);

	// Run a bunch of tests to give the dev feedback.

	var tests = {
		requirejs: function() {return requirejs;},
		jQuery: function() {return jQuery;},
		angular: function() {return angular;},
	};
	var success = true;
	for(var testName in tests) {
		var test = tests[i];
		var testSuccess = test();
		var msg = "FAILED";
		var fnc = "error";
		if (testSuccess) {
			msg = "Success";
			fnc = "log";
		} else {
			success = false;
		}
		if ((args.verbose || !testSuccess) && !args.silent) {console[fnc]("Checking", testName, ":", msg);}
	}

	return success;
};

qh.modules = function(a, b) {
	if (!qh.checkList({silent:true})) {
		throw "Missing one or more required packages. Run 'qh.checkList()' for more information.";
	}

	// Check type.
	var ml = qh.moduleLoader;
	switch(qh.getType(a)) {
		case "string": {
			// This is either a path to a list of modules in JSON or a path containing the modules.
			if (b) {
				// a is a module folder path, b is the list of modules. An array is expected for b.
				ml.loadModulesInPath(a, b);
			} else {
				// a is a path to a json file containing the list of modules.
				ml.loadModuleList(a);
			}
		} break;
		case "object": {
			// This is a complex configuration object.
			ml.loadModuleConfig(a);
		} break;
		case "array": {
			// This is a list of modules expected in the folder 'module'.
			ml.loadModulesByArray(a);
		} break;
	}
};

qh.moduleLoader = (function() {
	// Module loader currently kicks off loading of modules. It may be worth creating a 
	// list of items to load, and kick off everything once dependencies have loaded.
	// Best test for race conditions first until they become an issue.
	var ml = {};
	ml.loadModuleConfig = function(moduleConfig) {
		var c = moduleConfig;
		if (c.src) {
			ml.loadModuleList(c.src);
		}
		if (c.list) {
			switch(qh.getType(c.list)) {
				case "array": {
					ml.loadModulesByArray(c.list);
				} break;
				case "object": {
					angular.forEach(c.list, function(moduleList) {
						ml.loadModulesByArray(moduleList);
					});
				} break;
			}
		}
	};
	ml.loadModuleList = function(moduleListPath) {
		// Ajax in the json file. Interpret the json file. Get a list of modules.
		jQuery.getJSON(moduleListPath, function(a,b,c,d) {
			ml.loadModuleConfig(response);
		});
	};
	ml.loadModulesInPath = function(path, moduleNames) {
		angular.forEach(moduleNames, function(moduleName) {
			// Load [path]/[moduleName]/module.js
		});
	};
	ml.loadModulesByArray = function(moduleNames) {
		return ml.loadModulesInPath('module', moduleNames);
	};
	return ml;
}());
