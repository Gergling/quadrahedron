quadrahedron
============

The idea of this framework will be to help set up angularjs projects in a predictable modular style. 
The developer can then list module names and module components, and the software will work out where 
the files are going to be to load them in. Requirejs would likely be involved.

Expected folder structure:
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

module/application/module.js:
qh.module("other-module", {
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

qh.component("other-module", function(module) {
  module.directive("wideView", function() {
    // Angular directive stuff
  });
});
