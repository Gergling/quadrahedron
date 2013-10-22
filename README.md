quadrahedron
============

Quadrahedron is designed to set up a predictable modular code file structure for angular-based apps.

The developer will choose locations for the angular component files and indicate to quadrahedron where they will be.

Required Frameworks
-------------------

<ul>
  <li>requirejs</li>
  <li>angularjs</li>
  <li>jQuery</li>
</ul>

Folder Structure
----------------

While flexible, QH expects certain things from the code folder structure. In my example I have assumed that index.html 
and adjacent files are at the root directory.

<ul>
  <li><a href="#setup">index.html</a> - it is assumed that you have a starting html page of some kind. In this case, we are using a 
  simple html file.</li>
  <li>module - QH will assume all modules are in this folder. There are plans to allow for more flexibility later on.
    <ul>
      <li>application - I like using an 'application' module for application-specific code, but if specified, 
        any module name can be used.
        <ul>
          <li><a href="#modulejs">module.js</a> - if 'application' is given as a module, this file will be expected in the folder. Example 
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
              <li><a href="#module-components">fancy-factory.js</a></li>
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
  <li>vendor - in my example the vendor file is only referenced from index.html (not QH itself), so the 
  contents of this folder could be anything, as long as quadrahedron is loaded from somewhere.
    <ul>
      <li>quadrahedron
        <ul>
          <li>quadrahedron.js</li>
        </ul>
      </li>
      <li>requirejs
        <ul>
          <li>requirejs.js</li>
        </ul>
      </li>
      <li>jQuery
        <ul>
          <li>jQuery.js</li>
        </ul>
      </li>
      <li>angularjs
        <ul>
          <li>angularjs.js</li>
        </ul>
      </li>
    </ul>
  </li>
</ul>

Setup
-----

Now we need to tell QH what to look for.

We need to specify where jQuery and angularjs are. We can do this using script tags, but if slow loading 
times and race conditions are a concern, QH uses requirejs to ensure everything is loaded after their required
items are loaded.

In our example, we would find this in the index.html file before the modules are specified:

<pre>

qh.loadLib([
  "vendor/jQuery/jQuery.js",
  "vendor/angularjs/angularjs.js"
]);

</pre>

We also need to choose an app element before the modules are specified. In this case, I'm just using 'document';

<pre>

qh.app(function() {return document;});

</pre>

We now need to specify the modules. Without an app element, jquery, and angular the module specification will
simply fail (check the browser console for errors). Those will need to happen first. By specifying the modules, 
we are saying it's ok to load everything. This function can only be run once at present, and in the future it 
is planned that it will be able to accept a module path to contain specified modules, and have the option of a
separate bootstrap function if necessary (once everything is loaded, QH runs angular bootstrap). There are also
plans to allow this to reference a JSON file containing the list of modules, for people who want to minimise 
their interaction with the equivalent index.html file.

<pre>

qh.modules([
	"application",
	"fancy-module",
]);

</pre>

module.js
---------

Every module folder has a 'module.js' file. QH will fail without it. It is expected to contain the following:

<pre>

qh.setModule("application", {
  factory: [
    "navigation.js"
    "some-list.js"
  ],
});

</pre>

Another module.js example for the 'fancy-module' module.

<pre>

qh.setModule("fancy-module", {
  factory: [
    "fancy-factory.js"
  ],
  controller: [
    "index.js"
  ],
  directive: [
    "fancy-widget1.js",
    "fancy-widget2.js"
  ],
});

</pre>

Module Components
-----------------

Finally, we need to get the actual angular code running. In this example, I specify an angular factory:

<pre>

qh.getModule('fancy-module').factory("fancy-module.factory.fancy-factory", ["$rootScope", function ($rootScope) {
	return {"fancy-value": 12};
}]);

</pre>

'getModule' simply returns the angular module object.

My choice of component naming convention is a personal preference, but not necessary to run QH. That said, QH does
store component meta-data by this naming convention.
