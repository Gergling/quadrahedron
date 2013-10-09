quadrahedron
============

The idea of this framework will be to help set up angularjs projects in a predictable modular style. 
The developer can then list module names and module components, and the software will work out where 
the files are going to be to load them in. Requirejs would likely be involved.

I have included some sample usage below.

Expected folder structure:
index.html
vendor:
  quadrahedron:
    quadrahedron.js
module:
  application:
    module.js
    directive
    factory
    controller
    partial
    image
    css
    other-stuff
  other-module
    module.js
    etc...
other-folder-of-modules

index.html:
&lt;script type="text/javascript" src="vendor/quadrahedron/quadrahedron.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript"&gt;
  qh.modules([ // Assumes module folders are in 'module'.
    "application", // Assumes a module.js file is in 'application' folder. If this doesn't work, it will 
      // complain in the console in shining red letters so that the dev knows how to fix the problem.
    "other-module",
  ]);
  qh.modules("other-folder-of-modules", [
    "some-module"
  ]);
  qh.modules({
    src: "path/to/modules/list.json", // Could be a string or an array. This will obviously be slower.
    list: {
      "module": [
        "application",
        "other-module"
      ],
      "other-folder-of-modules": [
        "some-module"
      ],
    },
  });
  
</script>

module/application/module.js:
qh.setModule("other-module", {
  // Follows component names
  directive: [
    "wideView", // Refers to 'wideView.js' in the directive folder. The html will be "<data-wide-view/> 
      // or <ANY data-wide-view>" depending on the directive configuration.
    "narrowView", // Refers to 'narrowView.js' in the directive folder.
  ],
  factory: [
  ],
  controller: [
  ],
  "other-stuff": [
  ],
});

// All files given above will be listed against a requirejs function and loaded.

// Usage (e.g. wideView.js):

qh.getModule("other-module")
.directive("wideView", function() {
  // Angular directive stuff
});
