const Ci = Components.interfaces;
const Cc = Components.classes;

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const gPrefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
const gPrefBranch = gPrefService.getBranch(null).QueryInterface(Components.interfaces.nsIPrefBranch2);

function PrefAutoCompleteSearchHandler() {}

PrefAutoCompleteSearchHandler.prototype = {
  startSearch : function startSearch(searchString, searchParam, previousResult, listener) {
    var simpleresult;
    var result = Components.classes["@mozilla.org/autocomplete/simple-result;1"].createInstance();
    simpleresult = result.QueryInterface(Components.interfaces.nsIAutoCompleteSimpleResult);
    simpleresult.setSearchString(searchString);
    simpleresult.setDefaultIndex(0);
    var prefCount = { value: 0 };
    var prefArray = gPrefBranch.getChildList("", prefCount);
    prefArray = prefArray.sort();
    for (var i = 0; i < prefCount.value; ++i) 
    {
      if (prefArray[i].indexOf(searchString) == 0) { 
       simpleresult.appendMatch(prefArray[i], "");
      }
    }
    if (simpleresult.matchCount > 0) {
      simpleresult.setSearchResult(Components.interfaces.nsIAutoCompleteResult.RESULT_SUCCESS);
    } else {
      simpleresult.setSearchResult(Components.interfaces.nsIAutoCompleteResult.RESULT_NOMATCH);
    }
    listener.onSearchResult(this, simpleresult);  
  },

  stopSearch : function stopSearch() {
  },

  classDescription: "Preference Auto Complete Search",
  contractID: "@mozilla.org/autocomplete/search;1?name=prefs",
  classID: Components.ID("{f0747ed9-764a-4501-a7e5-4d1493605430}"),
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAutoCompleteSearch])
};

if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory([PrefAutoCompleteSearchHandler]);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule([PrefAutoCompleteSearchHandler]);
