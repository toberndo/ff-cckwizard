(function () {
  function startup()
  {
	var prefBranch = Components.classes["@mozilla.org/preferences-service;1"]
		                       .getService(Components.interfaces.nsIPrefService)
		                       .getBranch("extensions.cckwizard.");
  
	
	var firstrun = prefBranch.getBoolPref("firstrun");
  
	var curVersion = "0.0.0";
  
	function startPage(pageName) {
	  gBrowser.selectedTab = gBrowser.addTab("http://mike.kaply.com/addons/cckwizard/" + pageName);
	}
  
	if (firstrun) {
	  window.setTimeout(function() {startPage("install");}, 0);
	  prefBranch.setBoolPref("firstrun", false);
	  prefBranch.setCharPref("installedVersion", curVersion);
	} else {
	  try {
		var installedVersion = prefBranch.getCharPref("installedVersion");
		if (curVersion > installedVersion) {
	      window.setTimeout(function() {startPage("upgrade");}, 0);
		  prefBranch.setCharPref("installedVersion", curVersion);
		}
	  } catch (ex) {
		/* Somehow installedVersion isn't there. Set it */
		prefBranch.setCharPref("installedVersion", curVersion);
	  }
	}
  
	window.removeEventListener("load", startup, false);
  }
  
  function shutdown()
  {
	window.removeEventListener("unload", shutdown, false);
  }

  window.addEventListener("load", startup, false);
  window.addEventListener("unload", shutdown, false);
})();
