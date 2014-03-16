/*global  document, console, $, window */

/**
 * Create the global VTLearn object for storing all functions etc. in
 */
//MAGICWALL = MAGICWALL || {};
var MAGICWALL = MAGICWALL || {};

MAGICWALL.namespace = function (ns_string) {
	"use strict";

	var parts = ns_string.split('.'),
		parent = MAGICWALL,
		i;

	// strip redundant leading global
	if (parts[0] === "MAGICWALL") {
		parts = parts.slice(1);
	}
	for (i = 0; i < parts.length; i = i + 1) {
		// create a property if it doesn't exist
		if (typeof parent[parts[i]] === "undefined") {
			parent[parts[i]] = {};
		}
		parent = parent[parts[i]];
	}
	return parent;
};

MAGICWALL.require = function (file, callback) {
	"use strict";
	var script = document.getElementsByTagName('script')[0],
		newjs = document.createElement('script');

	// IE
	newjs.onreadystatechange = function () {
		if (newjs.readyState === 'loaded' || newjs.readyState === 'complete') {
			newjs.onreadystatechange = null;
		}
		callback();
	};

	// others
	newjs.onload = function () {
		callback();
	};
	newjs.src = file;
	script.parentNode.insertBefore(newjs, script);
};

MAGICWALL.namespace('MAGICWALL.BaseObject');
MAGICWALL.BaseObject = {
    create: function create() {
		"use strict";
		var instance = Object.create(this);
		instance._construct.apply(instance, arguments);
		return instance;
	},

	extend: function extend(properties, propertyDescriptors) {
		"use strict";
		var simpleProperties = Object.getOwnPropertyNames(properties), i, propertyName, len;
		propertyDescriptors = propertyDescriptors || {};

		if (properties) {
			for (i = 0, len = simpleProperties.length; i < len; i += 1) {
				propertyName = simpleProperties[i];
				if (propertyDescriptors.hasOwnProperty(propertyName)) {
					continue;
				}

				propertyDescriptors[propertyName] = Object.getOwnPropertyDescriptor(properties, propertyName);
			}
		}

		return Object.create(this, propertyDescriptors);
	},

	_construct: function _construct() {
		"use strict";
	},

	_super: function _super(definedOn, methodName, args) {
		"use strict";
		if (typeof methodName !== "string") {
			args = methodName;
			methodName = "_construct";
		}

		return Object.getPrototypeOf(definedOn)[methodName].apply(this, args);
	}
};
