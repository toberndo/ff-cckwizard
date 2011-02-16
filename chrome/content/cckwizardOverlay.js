(function () {
  function startup()
  {
	var prefBranch = Components.classes["@mozilla.org/preferences-service;1"]
		                       .getService(Components.interfaces.nsIPrefService)
		                       .getBranch("extensions.cckwizard.");
  
	
	var firstrun = prefBranch.getBoolPref("firstrun");
  
	var curVersion = "0.0.0";
  
	function startPage(pageName) {
	  gBrowser.selectedTab = gBrowser.addTab("http://kaply.com/addons/cckwizard/" + pageName);
	}
  
	if (firstrun) {
	  window.setTimeout(startPage, 1000, "install");
	  prefBranch.setBoolPref("firstrun", false);
	  prefBranch.setCharPref("installedVersion", curVersion);
	} else {
	  try {
		var installedVersion = prefBranch.getCharPref("installedVersion");
		if (curVersion > installedVersion) {
		window.setTimeout(startPage, 1000, "upgrade");
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
