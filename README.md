quadrahedron
============

Quadrahedron is designed to set up a predictable modular code file structure for angular-based apps.

The developer will choose locations for the angular component files and indicate to quadrahedron where they will be.

An expected default folder structure:

<ul>
  <li>index.html</li>
  <li>module - if not specified, QH will assume all modules are in this folder.
    <ul>
      <li>application - I like using an 'application' module for application-specific code, but if specified, 
        any module name can be used.
        <ul>
          <li>module.js - if 'application' is given as a module, this file will be expected in the folder. Example 
            contents are given further down.</li>
          <li>factory - if we assume all application-wide factories go in here, we can list this folder and all
            component files inside module.js.
            <ul>
              <li>navigation.js - maybe you would like to put your primary links here. If so, you can specify that
              this file exists, and it will be loaded with the rest of the module. An example of a component file is 
              given further down.</li>
              <li>some-list.js - who knows what factories one might need?</li>
            </ul>
          </li>
          <li>partial - angular uses partials, but you would not specify this folder as an angular component.
            <ul>
              <li>navigation-primary.js</li>
            </ul>
          </li>
        </ul>
      </li>
      <li>fancy-module - another module example
        <ul>
          <li>module.js</li>
          <li>factory
            <ul>
              <li>fancy-factory.js</li>
            </ul>
          </li>
          <li>controller
            <ul>
              <li>index.js</li>
            </ul>
          </li>
          <li>directive
            <ul>
              <li>fancy-widget1.js</li>
              <li>fancy-widget2.js</li>
            </ul>
          </li>
          <li>partial
            <ul>
              <li>fancy-widget1.html</li>
              <li>fancy-widget2.html</li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </li>
  <li>dev-packages - this folder will contain more modules to demonstrate how one might include modules in other 
  folders.
    <ul>
      <li>included-package1
        <ul>
          <li>useful-module
            <ul>
              <li>module.js</li>
              <li>... various components...</li>
            </ul>
          </li>
          <li>another-useful-module
            <ul>
              <li>module.js</li>
              <li>... various components...</li>
            </ul>
          </li>
        </ul>
      </li>
      <li>included-package2</li>
      <li>ignored-package</li>
    </ul>
  </li>
  <li>vendor - in my example the vendor file is only referenced from index.html (not QH itself), so the 
  contents of this folder could be anything, as long as quadrahedron is loaded from somewhere.
    <ul>
      <li>quadrahedron
        <ul>
          <li>quadrahedron.js</li>
        </ul>
      </li>
    </ul>
  </li>
</ul>

<pre>

index.html:
&lt;script type="text/javascript" src="vendor/quadrahedron/quadrahedron.js"&gt;&lt;/script&gt;
&lt;script type="text/javascript"&gt;
  // Requirejs would be well used to run any other requires once this has completed, and then run the 
  // given angular scripts.
  qh.angular("path/to/angular.js");
  
  // An array interprets a list of modules in the 'module' folder.
  qh.modules([
    "application", // Assumes a module.js file is in 'application' folder. If this doesn't work, it will 
      // complain in the console in shining red letters so that the dev knows how to fix the problem.
    "other-module",
  ]);
  
  // A string with an array interprets a list of modules in a folder named after the given string.
  qh.modules("other-folder-of-modules", [
    "some-module"
  ]);
  
  // A string on its own indicates a path to a json list of modules.
  qh.modules("path/to/modules/list.json");
  // JSON will be in the list format in the example given below, as though specific module folders exist,
  // or as an array assuming all modules are stored in 'module'.
  
  // An object can be submitted in the following format.
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

</pre>
