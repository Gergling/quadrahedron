// Requirejs is required.
// Angularjs is required.
// jQuery is required.

var quadrahedron = {};
var qh = quadrahedron;

qh.setup = function(config) {
	// Perhaps allow for config to be a path to a json file or an array of paths.
	if (config.angular) {}
	if (config.require) {}
	if (config.jquery) {}
};

qh.modules = function(a, b) {
	// Fire all of these once setup has completed loading items.
	// Check for requirejs or send exception.
	// Check for jquery or send exception.
	// Check for angularjs or send exception.
	
	// Check type.
	var ml = qh.moduleLoader;
	switch(type(a)) {
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
	var ml = {};
	ml.loadModuleConfig = function(moduleConfig) {
		var c = moduleConfig;
		if (c.src) {
			ml.loadModuleList(c.src);
		}
		if (c.list) {
			// Establish the type
			switch(type) {
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
		$.getJSON(moduleListPath, function(a,b,c,d) {
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