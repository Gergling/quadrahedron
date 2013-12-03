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
		// Perhaps once all loaded (qh.checkList({silent:true}) returns true), run all modules.
		// This sounds as though it should be prompted from a separate function, if the user 
		// decides they want to load the libs with their own functions.
		qh.loader.load();
	});

};

qh.getType = function(a) {
	var what = Object.prototype.toString;
	//if (jQuery.isArray(a)) {return "array";}
	if (jQuery.isPlainObject(a)) {return "object";}
	if (typeof a === 'string') {return "string";}
	if (what.call([])=="[object Array]") {return "array";}
	
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
		moduleCount: function() {return qh.moduleManager.qhModules.getPaths("module").length;},
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
qh.preloader = function(getPreloaderElement) {qh.loader.getPreloaderElement = getPreloaderElement;}

qh.loader = (function() {
	var ldr = {};
	//ldr.addPath = function(path) {console.log("Adding path", path);ldr.paths.push(path);};
	ldr.loaded = false;
	//ldr.paths = [];
	ldr.readyFunctions = [];
	ldr.getPreloaderElement = function() {};
	ldr.load = function() {
		// We cannot load anything until we have the basic software loaded.
		if (qh.checkList({silent:true})) {
			// The getAppDirective function will return a jQuery object, so we need to be certain that the DOM is fully loaded.
			$(function() {
				// All angular module path files will now be loaded.
				// Get module paths
				requirejs(qh.moduleManager.qhModules.getPaths("module"), function() {
					// Get component paths
					requirejs(qh.moduleManager.qhModules.getPaths("component"), function() {
						ldr.loaded = true;
						// Once all the angular module files are loaded, we can bootstrap angular.
						// Bootstrap will need to be run once a checklist of modules and their components is complete.
						if (qh.moduleManager.app.modules.length) {
							angular.bootstrap(qh.moduleManager.app.getAppElement(), qh.moduleManager.app.modules);
							$(ldr.getPreloaderElement()).hide();

							// We now have the option to run a custom 'ready' function once everything else is complete, 
							// but I have no use for this yet so I doubt it's working.
							angular.forEach(ldr.readyFunctions, function(fnc) {
								// Arguments could go into this function.
								fnc();
							});
						} else {
							throw "No app element is set. A module must have a configuration property 'app' set to 'true'.";
						}
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
		var basePath = c.basePath || "";
		if (c.src) {
			ml.loadModuleList(c.src);
		}
		if (c.list) {
			switch(qh.getType(c.list)) {
				case "array": {
					ml.loadModulesInPath(c.list, basePath);
				} break;
				case "object": {
					//$.each(c.list, function(moduleList) {
						//ml.loadModulesInPath(moduleList, path);
					//});
					console.error("Loading config objects is not supported yet");
				} break;
			}
		}
	};
	ml.loadModuleList = function(moduleListPath) {
		// Ajax in the json file. Interpret the json file. Get a list of modules.
		jQuery.getJSON(moduleListPath, function(response,status,jqxhr) {
			ml.loadModuleConfig(response);
			qh.loader.load();
		}).fail(function() {
			throw "Module listing JSON at "+moduleListPath+" is invalid.";
		});
	};
	ml.loadModulesInPath = function(moduleNames, path) {
		for(var i in moduleNames) {
			var moduleName = moduleNames[i];
			var qhModule = qh.moduleManager.qhModules.add(moduleName, path);
		};
	};
	ml.loadModulesByArray = function(moduleNames) {
		return ml.loadModulesInPath(moduleNames);
	};
	ml.loadModuleComponent = function() {
		console.error("Should there really be module components loaded from here.");
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
			_this.getConfigFilePath = function() {
				return _this.getPath()+"/module.js";
			};
			_this.getComponent = function(type, name) {
				if (_this.components[type][name]) {
					return _this.components[type][name];
				} else {
					throw "No component in module '"+_this.name+"' with a '"+type+"' named '"+name+"'";
				}
			};
			_this.components = {};
			_this.addComponent = function(type, name) {
				if (!_this.components[type]) {_this.components[type] = {};}
				_this.components[type][name] = new qhm.qhModuleComponent(_this.name, type, name);
				return _this.getComponent(type, name);
			};
			_this.getComponentPaths = function() {
				var ret = [];
				jQuery.each(_this.components, function(type, components) {
					jQuery.each(components, function(name, component) {
						ret.push(component.getPath());
					});
				});
				return ret;
			};
		};
		qhm.qhModuleComponent = function(moduleName, componentType, name) {
			var _this = this;
			_this.name = name;
			_this.type = componentType;
			_this.qhModule = qhm.get(moduleName);
			_this.getPath = function() {
				return ([_this.qhModule.getPath(), _this.type, _this.name].join("/"))+".js";
			};
			_this.getFullName = function() {
				return [_this.qhModule.name, _this.type, _this.name].join(".");
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
		qhm.getPaths = function(type) {
			var ret = [];
			angular.forEach(qhm.list, function(module) {
				switch(type) {
					case "module": {
						ret.push(module.getConfigFilePath());
					} break;
					case "component": {
						ret = ret.concat(module.getComponentPaths());
					} break;
				}
			});
			return ret;
		};
		return qhm;
	}());
	man.app = {getAppElement: function() {}, modules:[]}; // Only supports one app directive for now.
	man.angularModules = {};
	man.setModule = function(name, config) {
		// Load component files as a requirejs array
		var childModules = [];
		var paths = [];
		var qhModule = man.qhModules.get(name);
		var requiredModules = [];
		jQuery.each(config, function(componentType, a) {
			switch(componentType) {
				case "app": {
					// Special case, do nothing.
				} break;
				case "require": {
					requiredModules = a;
				} break;
				default: {
					var components = a;
					angular.forEach(components, function(componentName) {
						var component = qhModule.addComponent(componentType, componentName);
						//childModules.push(component.getFullName());
					});
					//paths.push(man.qhModules.get(name).getPath());
				} break;
			}
		});
		//man.angularModules[name] = angular.module(name, childModules);
		// Need a system for modules which are included.
		man.angularModules[name] = angular.module(name, requiredModules);
		if (config.app) {man.app.modules.push(name);}
		//requirejs(childModules);
	};
	return man;
}());
qh.setModule = function(name, config) {
	qh.moduleManager.setModule(name, config);
};
qh.getModule = function(name) {
	return qh.moduleManager.angularModules[name];
};
qh.getQHModule = function(name) {
	return qh.moduleManager.qhModules.get(name);
};
qh.component = function(moduleName, moduleComponentSetup) {
	return moduleComponentSetup(qh.getModule(moduleName), qh.getQHModule(moduleName));
};