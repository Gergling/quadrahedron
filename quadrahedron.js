// Requirejs is required.
// Angularjs is required.
// jQuery is required.

var quadrahedron = {};
var qh = quadrahedron;

// Probably need a 'setup' function to load base libraries and jquery for app directive from one object, or multiple arguments.
	
qh.loadLib = function(a) {
	// We're ignoring this for now, letting the user take care of their own library loading. It seems to be much effort to avoid writing two script tags.

	// Loads a path or array of paths indicating the locations of necessary libraries.
	var paths = a;
	if (typeof a === 'string') {paths = [a];}
	requirejs(paths, function() {
		console.log('loadLib complete');
		// Perhaps once all loaded (qh.checkList({silent:true}) returns true), run all modules.
		// This sounds as though it should be prompted from a separate function, if the user 
		// decides they want to load the libs with their own functions.
		qh.loader.load();
	});

};

qh.getType = function(a) {
	var what = Object.prototype.toString;
	//if (jQuery.isArray(a)) {return "array";}
	if (what.call([])=="[object Array]") {return "array";}
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
		requirejs: function() {return !(typeof(requirejs)=="undefined");},
		jQuery: function() {return !(typeof(jQuery)=="undefined");},
		angular: function() {return !(typeof(angular)=="undefined");},
	};
	var success = true;
	for(var testName in tests) {
		var test = tests[testName];
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
	// Check type.
	var ml = qh.moduleLoader;
	switch(qh.getType(a)) {
		case "string": {
			// This is either a path to a list of modules in JSON or a path containing the modules.
			if (b) {
				// a is a module folder path, b is the list of modules. An array is expected for b.
				ml.loadModulesInPath(b, a);
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
	qh.loader.load();
};

qh.app = function(getAppElement) {qh.moduleManager.app.getAppElement = getAppElement;}

qh.loader = (function() {
	var ldr = {};
	ldr.addPath = function(path) {ldr.paths.push(path);};
	ldr.loaded = false;
	ldr.paths = [];
	ldr.readyFunctions = [];
	ldr.load = function() {
		// We cannot load anything until we have the basic software loaded.
		if (qh.checkList({silent:true})) {
			// The getAppDirective function will return a jQuery object, so we need to be certain that the DOM is fully loaded.
			$(function() {
				// All angular module path files will now be loaded.
				requirejs(ldr.paths, function() {
					ldr.loaded = true;
					// Once all the angular module files are loaded, we can bootstrap angular.
					
					angular.bootstrap(
						qh.moduleManager.app.getAppElement(), 
						qh.moduleManager.app.modules
					);

					// We now have the option to run a custom 'ready' function once everything else is complete, 
					// but I have no use for this yet so I doubt it's working.
					angular.forEach(ldr.readyFunctions, function(fnc) {
						// Arguments could go into this function.
						fnc();
					});
				});
			});
		}
	};
	return ldr;
}());

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
			//ml.loadModuleConfig(response);
			//qh.loader.addPath(path+"/"+moduleName+"/"+module.js);
		});
	};
	ml.loadModulesInPath = function(moduleNames, path) {
		for(var i in moduleNames) {
			var moduleName = moduleNames[i];
			// Load [path]/[moduleName]/module.js
			var qhModule = qh.moduleManager.qhModules.add(moduleName, path);
			qh.loader.addPath(qhModule.getPath()+"/module.js");
		};
	};
	ml.loadModulesByArray = function(moduleNames) {
		return ml.loadModulesInPath(moduleNames);
	};
	ml.loadModuleComponent = function() {
		
	};
	return ml;
}());

// qh.ready = function(fnc) {qh.loader.readyFunctions.push(fnc);};

qh.moduleManager = (function() {
	var man = {};
	man.qhModules = (function() {
		var qhm = {};
		qhm.qhModule = function(name, basePath) {
			var _this = this;
			_this.name = name;
			_this.basePath = basePath || "module";
			_this.getPath = function() {
				return _this.basePath+"/"+_this.name;
			};
		};
		qhm.list = {};
		qhm.add = function(name, basePath) {
			qhm.list[name] = new qhm.qhModule(name, basePath);
			return qhm.get(name);
		};
		qhm.get = function(name) {
			var got = qhm.list[name];
			if (!got) {throw "Attempted to get module '"+name+"' which doesn't exist.";}
			return got;
		};
		
		return qhm;
	}());
	man.app = {modules:[]}; // Only supports one app directive for now.
	man.angularModules = {};
	man.setModule = function(name, config) {
		// Load component files as a requirejs array
		var childModules = [];
		var paths = [];
		jQuery.each(config, function(componentType, a) {
			switch(componentType) {
				case "app": {
					// Special case, do nothing.
				} break;
				default: {
					var components = a;
					childModules.push(components);
					paths.push(man.qhModules.get(name).getPath());
				} break;
			}
		});
		man.angularModules[name] = angular.module(name, childModules);
		if (config.app) {man.app.modules.push(name);}
		//window[name] = man.angularModules[name];
		//console.log(name);
		requirejs(childModules);
	};
	return man;
}());
qh.setModule = function(name, config) {
	qh.moduleManager.setModule(name, config);
};
qh.getModule = function(name) {
	return qh.moduleManager.angularModules[name];
};