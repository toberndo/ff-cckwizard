/*
 * $Revision$
 * $Date$
 * $Author$
 *
//@line 40 "/Users/mkaply/Projects/Firefox/mozilla/extensions/cck/browser/resources/content/cckwizard/cckwizard.js"
*/

var currentconfigname;
var currentconfigpath;
var configarray = new Array();

const nsIPrefBranch = Components.interfaces.nsIPrefBranch;
var gPrefBranch = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(nsIPrefBranch);

var gPromptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                               .getService(Components.interfaces.nsIPromptService);

function choosefile(labelname)
{
  try {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    var bundle = document.getElementById("bundle_cckwizard");
    fp.init(window, bundle.getString("chooseFile"), nsIFilePicker.modeOpen);
    fp.appendFilters(nsIFilePicker.filterAll);
    var destdir = Components.classes["@mozilla.org/file/local;1"]
                            .createInstance(Components.interfaces.nsILocalFile);

    if (currentconfigpath) {
      destdir.initWithPath(currentconfigpath);
      fp.displayDirectory = destdir;
    }


    if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
    	var label = document.getElementById(labelname);
    	label.value = fp.file.path;
    }
  }
  catch(ex) {
  }
}

function choosedir(labelname)
{
  try {
    var keepgoing = true;
    while (keepgoing) {
      var nsIFilePicker = Components.interfaces.nsIFilePicker;
      var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
      var bundle = document.getElementById("bundle_cckwizard");
      fp.init(window, bundle.getString("chooseDirectory"), nsIFilePicker.modeGetFolder);
      fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterText |
                       nsIFilePicker.filterAll | nsIFilePicker.filterImages | nsIFilePicker.filterXML);

      if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
        var label = document.getElementById(labelname);
        label.value = fp.file.path;
      }
      keepgoing = false;
    }
  }
  catch(ex) {
  }
}

function chooseimage(labelname, imagename)
{
  try {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    var bundle = document.getElementById("bundle_cckwizard");
    fp.init(window, bundle.getString("chooseImage"), nsIFilePicker.modeOpen);
    fp.appendFilters(nsIFilePicker.filterImages);
    var destdir = Components.classes["@mozilla.org/file/local;1"]
                            .createInstance(Components.interfaces.nsILocalFile);

    if (currentconfigpath) {
      destdir.initWithPath(currentconfigpath);
      fp.displayDirectory = destdir;
    }

    if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
    	var label = document.getElementById(labelname);
    	label.value = fp.file.path;
    	document.getElementById(imagename).src = fp.fileURL.spec;
    }
  }
  catch(ex) {
  }
}

function initimage(labelname, imagename)
{
  var sourcefile = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);
  try {
    sourcefile.initWithPath(document.getElementById(labelname).value);
    var ioServ = Components.classes["@mozilla.org/network/io-service;1"]
                           .getService(Components.interfaces.nsIIOService);
    var foo = ioServ.newFileURI(sourcefile);
    document.getElementById(imagename).src = foo.spec;
  } catch (e) {
    document.getElementById(imagename).src = '';
  }
}

function OpenConfig()
{
  try {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    var bundle = document.getElementById("bundle_cckwizard");
    fp.init(window, bundle.getString("chooseFile"), nsIFilePicker.modeOpen);
    fp.appendFilters(nsIFilePicker.filterAll);
    var destdir = Components.classes["@mozilla.org/file/local;1"]
                            .createInstance(Components.interfaces.nsILocalFile);

   if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
	var name;
	var version;
	var stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
						   .createInstance(Components.interfaces.nsIFileInputStream);
	var cis = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
						.createInstance(Components.interfaces.nsIConverterInputStream);

	stream.init(fp.file, 0x01, 0644, 0);
	cis.init(stream,  null, 1024, Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
	var lis = cis.QueryInterface(Components.interfaces.nsIUnicharLineInputStream);
	var line = {value:null};

	var configarray = new Array();
	do {
	  var more = lis.readLine(line);
	  var str = line.value;
	  var equals = str.indexOf('=');
	  if (equals != -1) {
		var firstpart = str.substring(0,equals);
		var secondpart = str.substring(equals+1);
		if (firstpart == "name") {
		  name = secondpart;
		}
		if (firstpart == "version") {
		  version = secondpart;
		}
	  }
	} while (more);
	stream.close();
	var configname = name + " (" + version + ")";
	gPrefBranch.setCharPref("cck.config." + configname, fp.file.parent.path);
	setcurrentconfig(configname);
	updateconfiglist();
   }
  }
  catch(ex) {
  }
}


function CreateConfig()
{
  window.openDialog("chrome://cckwizard/content/config.xul","createconfig","chrome,centerscreen,modal");
  updateconfiglist();
}

function CopyConfig()
{
  window.openDialog("chrome://cckwizard/content/config.xul","copyconfig","chrome,centerscreen,modal");

  updateconfiglist();
}

function DeleteConfig()
{
  var bundle = document.getElementById("bundle_cckwizard");

  var button = gPromptService.confirmEx(window, bundle.getString("windowTitle"), bundle.getString("deleteConfirm"),
                                        gPromptService.BUTTON_TITLE_YES * gPromptService.BUTTON_POS_0 +
                                        gPromptService.BUTTON_TITLE_NO * gPromptService.BUTTON_POS_1,
                                        null, null, null, null, {});
  if (button == 0) {
    gPrefBranch.deleteBranch("cck.config."+currentconfigname);
    currentconfigname = "";
    currentconfigpath = "";
    updateconfiglist();
  }
}

function SetSaveOnExitPref()
{
    gPrefBranch.setBoolPref("cck.save_on_exit", document.getElementById("saveOnExit").checked);
}

function OpenCCKWizard()
{
   try {
     document.getElementById("saveOnExit").checked = gPrefBranch.getBoolPref("cck.save_on_exit");
   } catch (ex) {
   }
}

function ShowMain()
{
   document.getElementById('example-window').canRewind = false;
   updateconfiglist();
}

function updateconfiglist()
{
  var menulist = document.getElementById('byb-configs')
  menulist.selectedIndex = -1;
  menulist.removeAllItems();
  var configname;
  var selecteditem = false;



  var list = gPrefBranch.getChildList("cck.config.", {});
  for (var i = 0; i < list.length; ++i) {
    configname = list[i].replace(/cck.config./g, "");
    var menulistitem = menulist.appendItem(configname,configname);
    menulistitem.minWidth=menulist.width;
    if (configname == currentconfigname) {
      menulist.selectedItem = menulistitem;
      selecteditem = true;
      document.getElementById('example-window').canAdvance = true;
      document.getElementById('byb-configs').disabled = false;
      document.getElementById('deleteconfig').disabled = false;
      document.getElementById('showconfig').disabled = false;
      document.getElementById('copyconfig').disabled = false;
    }
  }
  if ((!selecteditem) && (list.length > 0)) {
    menulist.selectedIndex = 0;
    setcurrentconfig(list[0].replace(/cck.config./g, ""));
  }
  if (list.length == 0) {
    document.getElementById('example-window').canAdvance = false;
    document.getElementById('byb-configs').disabled = true;
    document.getElementById('deleteconfig').disabled = true;
    document.getElementById('showconfig').disabled = true;
    document.getElementById('copyconfig').disabled = true;
    currentconfigname = "";
    currentconfigpath = "";
  }
}

function setcurrentconfig(newconfig)
{
  var destdir = Components.classes["@mozilla.org/file/local;1"]
                          .createInstance(Components.interfaces.nsILocalFile);

  if (currentconfigpath) {
    destdir.initWithPath(currentconfigpath);
    CCKWriteConfigFile(destdir);
  }
  currentconfigname = newconfig;
  currentconfigpath = gPrefBranch.getCharPref("cck.config." + currentconfigname);
  destdir.initWithPath(currentconfigpath);
  ClearAll();
  CCKReadConfigFile(destdir);
}

function saveconfig()
{


  if (currentconfigpath) {
  var destdir = Components.classes["@mozilla.org/file/local;1"]
                          .createInstance(Components.interfaces.nsILocalFile);



    destdir.initWithPath(currentconfigpath);
    CCKWriteConfigFile(destdir);
  }

}

function CloseCCKWizard()
{
  if (document.getElementById('example-window').pageIndex == 0)
    return;
  var saveOnExit;
  try {
    saveOnExit = gPrefBranch.getBoolPref("cck.save_on_exit");
 } catch (ex) {
    saveOnExit = false;
 }

  var button;
  if (!saveOnExit) {
    var bundle = document.getElementById("bundle_cckwizard");

    var button = gPromptService.confirmEx(window, bundle.getString("windowTitle"), bundle.getString("cancelConfirm"),
                                          (gPromptService.BUTTON_TITLE_YES * gPromptService.BUTTON_POS_0) +
                                          (gPromptService.BUTTON_TITLE_NO * gPromptService.BUTTON_POS_1),
                                          null, null, null, null, {});
  } else {
    button = 0;
  }

  if (button == 0) {
    saveconfig();
  }
}


function OnConfigLoad()
{
  configCheckOKButton();
}


function ClearAll()
{
    /* clear out all data */
    var elements = document.getElementsByAttribute("id", "*");
    for (var i=0; i < elements.length; i++) {
      if ((elements[i].nodeName == "textbox") ||
          (elements[i].nodeName == "radiogroup") ||
          (elements[i].id == "RootKey1") ||
          (elements[i].id == "Type1")) {
        if (elements[i].id != "saveOnExit") {
          elements[i].value = "";
        }
      } else if (elements[i].nodeName == "checkbox") {
        if (elements[i].id != "saveOnExit")
          elements[i].checked = false;
      } else if (elements[i].className == "ccklist") {
        document.getElementById(elements[i].id).clear();
      } else if (elements[i].id == "defaultSearchEngine") {
        document.getElementById(elements[i].id).removeAllItems();
        document.getElementById(elements[i].id).value = "";
      }
    }
}

function OnConfigOK()
{

  if (!(ValidateDir('cnc-location'))) {
    return false;
  }
  var configname = document.getElementById('cnc-name').value;
  var configlocation = document.getElementById('cnc-location').value;
  if (window.name == 'copyconfig') {
    var destdir = Components.classes["@mozilla.org/file/local;1"]
                            .createInstance(Components.interfaces.nsILocalFile);
    destdir.initWithPath(configlocation);
    this.opener.CCKWriteConfigFile(destdir);
  }

  gPrefBranch.setCharPref("cck.config." + configname, configlocation);
  this.opener.setcurrentconfig(configname);
  return true;
}

function configCheckOKButton()
{
  if ((document.getElementById("cnc-name").value) && (document.getElementById("cnc-location").value)) {
    document.documentElement.getButton("accept").setAttribute( "disabled", "false" );
  } else {
    document.documentElement.getButton("accept").setAttribute( "disabled", "true" );
  }
}

function onNewPreference()
{
  window.openDialog("chrome://cckwizard/content/pref.xul","newpref","chrome,centerscreen,modal");
}

function onEditPreference()
{
  window.openDialog("chrome://cckwizard/content/pref.xul","editpref","chrome,centerscreen,modal");
}

function arrayItemExists(inArray, inItem) {
    for (var i = 0; i < this.length; i++) {
        if (inArray[i] == inItem) return true;
    }
    return false;
}

var prefsLockOnly = ["browser.startup.homepage", "browser.throbber.url",
                     "startup.homepage_override_url", "startup.homepage_welcome_url",
                     "browser.search.defaultenginename", "browser.search.order.1",
                     "network.proxy.type", "network.proxy.http", "network.proxy.http_port",
                     "network.proxy.share_proxy_settings", "network.proxy.ssl",
                     "network.proxy.ssl_port", "network.proxy.ftp", "network.proxy.ftp_port",
                     "network.proxy.socks",
                     "network.proxy.socks_port", "network.proxy.socks_version",
                     "network.proxy.no_proxies_on", "network.proxy.autoconfig_url"];

function OnPrefLoad()
{
  var listbox = this.opener.document.getElementById('prefList');
  if (window.name == 'editpref') {
    window.title = listbox.selectedItem.cck['type'];
    if (listbox.selectedItem.cck['type'] == "integer") {
      document.getElementById('prefvalue').preftype = nsIPrefBranch.PREF_INT;
    }
    document.getElementById('prefname').value = listbox.selectedItem.label;
    if (arrayItemExists(prefsLockOnly, listbox.selectedItem.label)) {
      document.getElementById('prefvalue').disabled = true;
      document.getElementById('prefvalue').value = this.opener.document.getElementById("bundle_cckwizard").getString("lockError");
    } else {
      document.getElementById('prefvalue').value = listbox.selectedItem.value;
    }
    document.getElementById('prefname').disabled = true;
    if (listbox.selectedItem.cck['lock'] == "true")
      document.getElementById('lockPref').checked = true;
    if (listbox.selectedItem.cck['type'] == "boolean") {
      document.getElementById('prefvalue').hidden = true;
      document.getElementById('prefvalueboolean').hidden = false;
      document.getElementById('prefvalueboolean').value = listbox.selectedItem.value;
    }
  }
  prefCheckOKButton();

}

function prefCheckOKButton()
{
  if (document.getElementById("prefname").value) {
    document.documentElement.getButton("accept").setAttribute( "disabled", "false" );
  } else {
    document.documentElement.getButton("accept").setAttribute( "disabled", "true" );
  }
}

function prefSetPrefValue()
{
  var prefname = document.getElementById('prefname').value;
  try {
    var preftype = gPrefBranch.getPrefType(prefname);
    switch (preftype) {
      case nsIPrefBranch.PREF_STRING:
        document.getElementById('prefvalue').value = gPrefBranch.getCharPref(prefname);
        document.getElementById('prefvalue').hidden = false;
        document.getElementById('prefvalueboolean').hidden = true;
        document.getElementById('prefvalue').preftype = nsIPrefBranch.PREF_STRING;
        break;
      case nsIPrefBranch.PREF_INT:
        document.getElementById('prefvalue').value = gPrefBranch.getIntPref(prefname);
        document.getElementById('prefvalue').hidden = false;
        document.getElementById('prefvalueboolean').hidden = true;
        document.getElementById('prefvalue').preftype = nsIPrefBranch.PREF_INT;
        break;
      case nsIPrefBranch.PREF_BOOL:
        document.getElementById('prefvalue').value = gPrefBranch.getBoolPref(prefname);
        document.getElementById('prefvalue').hidden = true;
        document.getElementById('prefvalueboolean').hidden = false;
        document.getElementById('prefvalueboolean').value = gPrefBranch.getBoolPref(prefname);
        document.getElementById('prefvalue').preftype = nsIPrefBranch.PREF_BOOL;
        break;
      default:
        document.getElementById('prefvalue').hidden = false;
        document.getElementById('prefvalueboolean').hidden = true;
        break;
    }
  } catch (ex) {
    document.getElementById('prefvalue').hidden = false;
    document.getElementById('prefvalueboolean').hidden = true;
  }
  if (arrayItemExists(prefsLockOnly, prefname)) {
    document.getElementById('prefvalue').disabled = true;
    document.getElementById('prefvalue').value = this.opener.document.getElementById("bundle_cckwizard").getString("lockError");
  } else {
    document.getElementById('prefvalue').disabled = false;
  }
}

function OnPrefOK()
{
  var bundle = this.opener.document.getElementById("bundle_cckwizard");

  var listbox = this.opener.document.getElementById("prefList");
  for (var i=0; i < listbox.getRowCount(); i++) {
    if ((document.getElementById('prefname').value == listbox.getItemAtIndex(i).label) && (window.name == 'newpref')) {
      gPromptService.alert(window, bundle.getString("windowTitle"),
                           bundle.getString("prefExistsError"));
      return false;
    }
  }

  if (arrayItemExists(prefsLockOnly, document.getElementById('prefname').value)) {
     document.getElementById('prefvalue').value = "";
  }

  var value = document.getElementById('prefvalue').value;

  if ((document.getElementById('prefvalue').preftype == nsIPrefBranch.PREF_INT) && (!(arrayItemExists(prefsLockOnly, document.getElementById('prefname').value)))) {
    if (parseInt(value) != value) {
      gPromptService.alert(window, bundle.getString("windowTitle"),
                           bundle.getString("intError"));
      return false;
    }
  }

  listbox = this.opener.document.getElementById('prefList');
  var listitem;
  if (window.name == 'newpref') {
    var preftype;
    if ((value.toLowerCase() == "true") || (value.toLowerCase() == "false")) {
      preftype = "boolean";
    } else if (parseInt(value) == value) {
      preftype = "integer";
    } else {
      preftype  = "string";
      if (value.charAt(0) == '"')
        value = value.substring(1,value.length);
      if (value.charAt(value.length-1) == '"')
        if (value.charAt(value.length-2) != '\\')
          value = value.substring(0,value.length-1);
    }
    listitem = listbox.appendItem(document.getElementById('prefname').value, value);
    listitem.cck['type'] = preftype;
  } else {
    listitem = listbox.selectedItem;
    listitem.setAttribute("label", document.getElementById('prefname').value);
    value = document.getElementById('prefvalue').value;
    if (value.charAt(0) == '"')
      value = value.substring(1,value.length);
    if (value.charAt(value.length-1) == '"')
      if (value.charAt(value.length-2) != '\\')
        value = value.substring(0,value.length-1);
    listitem.setAttribute("value", value);
  }
  if (document.getElementById('lockPref').checked) {
    listitem.cck['lock'] = "true";
  } else {
    listitem.cck['lock'] = "";
  }
}

function getPageId()
{
  var temp = document.getElementById('example-window');
  if (!temp)
    temp = this.opener.document.getElementById('example-window');
  return temp.currentPage.id;
}


function onNewBookmark()
{
  window.openDialog("chrome://cckwizard/content/bookmark.xul","newbookmark","chrome,centerscreen,modal");
}

function onEditBookmark()
{
  window.openDialog("chrome://cckwizard/content/bookmark.xul","editbookmark","chrome,centerscreen,modal");
}

function OnBookmarkLoad()
{
  var listbox = this.opener.document.getElementById(getPageId() +'.bookmarkList');
  if (window.name == 'editbookmark') {
    document.getElementById('bookmarkname').value = listbox.selectedItem.label;
    document.getElementById('bookmarkurl').value = listbox.selectedItem.value;
    document.getElementById('bookmarktype').value = listbox.selectedItem.cck['type'];
  }
  bookmarkCheckOKButton();
}

function bookmarkCheckOKButton()
{
  if (document.getElementById('bookmarktype').value == "separator") {
    document.getElementById('bookmarkname').disabled = true;
    document.getElementById('bookmarkurl').disabled = true;
  } else {
    document.getElementById('bookmarkname').disabled = false;
    document.getElementById('bookmarkurl').disabled = false;
  }
  if ((document.getElementById('bookmarktype').value == "separator") || ((document.getElementById("bookmarkname").value) && (document.getElementById("bookmarkurl").value))) {
    document.documentElement.getButton("accept").disabled = false;
  } else {
    document.documentElement.getButton("accept").disabled = true;
  }
}

function OnBookmarkOK()
{

  var listbox = this.opener.document.getElementById(getPageId() +'.bookmarkList');
  var listitem;
  if (window.name == 'newbookmark') {
    if (document.getElementById('bookmarktype').value == "separator") {
      listitem = listbox.appendItem("----------", "");
    } else {
      listitem = listbox.appendItem(document.getElementById('bookmarkname').value, document.getElementById('bookmarkurl').value);
    }
    listitem.setAttribute("class", "listitem-iconic");
  } else {
    listitem = listbox.selectedItem;
    if (document.getElementById('bookmarktype').value == "separator") {
      listitem.setAttribute("label", "----------");
      listitem.setAttribute("value", "");
    } else {
      listitem.setAttribute("label", document.getElementById('bookmarkname').value);
      listitem.setAttribute("value", document.getElementById('bookmarkurl').value);
    }
  }
  listitem.cck['type'] = document.getElementById('bookmarktype').value;
  if (document.getElementById('bookmarktype').value == "live") {
    listitem.setAttribute("image", "chrome://browser/skin/page-livemarks.png");
  } else if (document.getElementById('bookmarktype').value == "separator") {
    listitem.setAttribute("image", "");
  } else {
    listitem.setAttribute("image", "chrome://browser/skin/Bookmarks-folder.png");
  }
}

function enableBookmarkButtons() {
  var listbox = document.getElementById(getPageId() +'.bookmarkList');
  if (listbox.selectedItem) {
    document.getElementById(getPageId() +'editBookmarkButton').disabled = false;
    document.getElementById(getPageId() +'deleteBookmarkButton').disabled = false;
  } else {
    document.getElementById(getPageId() +'editBookmarkButton').disabled = true;
    document.getElementById(getPageId() +'deleteBookmarkButton').disabled = true;
  }
}

function onNewBrowserPlugin()
{
  try {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    var bundle = document.getElementById("bundle_cckwizard");
    fp.init(window, bundle.getString("chooseFile"), nsIFilePicker.modeOpen);
    fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterText |
                     nsIFilePicker.filterAll | nsIFilePicker.filterImages | nsIFilePicker.filterXML);

    if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
      var listbox = document.getElementById('browserPluginList');
      var listitem = listbox.appendItem(fp.file.path, "");
    }
  }
  catch(ex) {
  }
}

function onEditBrowserPlugin()
{
  var listbox = document.getElementById('browserPluginList');
  var filename = listbox.selectedItem.label;
  var sourcefile = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);
  try {
    sourcefile.initWithPath(filename);
    var ioServ = Components.classes["@mozilla.org/network/io-service;1"]
                           .getService(Components.interfaces.nsIIOService);

  } catch (ex) {
  }

  try {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    var bundle = document.getElementById("bundle_cckwizard");
    fp.init(window, bundle.getString("chooseFile"), nsIFilePicker.modeOpen);
    fp.displayDirectory = sourcefile.parent;
    fp.defaultString = sourcefile.leafName;
    fp.appendFilters(nsIFilePicker.filterAll);
    if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
      listbox.selectedItem.label = fp.file.path;
    }
  }
  catch(ex) {
  }
}

function onNewRegKey()
{
  window.openDialog("chrome://cckwizard/content/reg.xul","newreg","chrome,centerscreen,modal");
}

function onEditRegKey()
{
  window.openDialog("chrome://cckwizard/content/reg.xul","editreg","chrome,centerscreen,modal");
}

function OnRegLoad()
{
  var listbox = this.opener.document.getElementById('regList');
  if (window.name == 'editreg') {
    document.getElementById('PrettyName').value = listbox.selectedItem.label;
    document.getElementById('RootKey').value = listbox.selectedItem.cck['rootkey'];
    document.getElementById('Key').value = listbox.selectedItem.cck['key'];
    document.getElementById('Name').value = listbox.selectedItem.cck['name'];
    document.getElementById('NameValue').value = listbox.selectedItem.cck['namevalue'];
    document.getElementById('Type').value = listbox.selectedItem.cck['type'];
  }
  regCheckOKButton();
}

function regCheckOKButton()
{
  if ((document.getElementById("PrettyName").value) &&
      (document.getElementById("Key").value) &&
      (document.getElementById("Name").value) &&
      (document.getElementById("NameValue").value)) {
      document.documentElement.getButton("accept").setAttribute( "disabled", "false" );
  } else {
    document.documentElement.getButton("accept").setAttribute( "disabled", "true" );
  }
}

function OnRegOK()
{
  var listbox = this.opener.document.getElementById('regList');
  var listitem;
  if (window.name == 'newreg') {
    listitem = listbox.appendItem(document.getElementById('PrettyName').value, "");
  } else {
    listitem = listbox.selectedItem;
    listitem.setAttribute("label", document.getElementById('PrettyName').value);
  }
  listitem.cck['rootkey'] = document.getElementById('RootKey').value;
  listitem.cck['key'] = document.getElementById('Key').value;
  listitem.cck['name'] = document.getElementById('Name').value;
  listitem.cck['namevalue'] = document.getElementById('NameValue').value;
  listitem.cck['type'] = document.getElementById('Type').value;
}

function RefreshDefaultSearchEngines()
{
  var menulist;
  menulist = document.getElementById('defaultSearchEngine');
  if (!menulist)
    menulist = this.opener.document.getElementById('defaultSearchEngine');

  var listbox;
  listbox = document.getElementById('searchEngineList');
  if (!listbox)
    listbox = this.opener.document.getElementById('searchEngineList');

  var curitem = menulist.value;
  menulist.selectedIndex = -1;
  menulist.removeAllItems();

  var setcuritem = false;

  var bundle = document.getElementById("bundle_cckwizard");
  var menulistitem = menulist.appendItem(bundle.getString("useBrowserDefault"), "");
  menulistitem.minWidth=menulist.width;
  for (var i=0; i < listbox.getRowCount(); i++) {
    var listitem = listbox.getItemAtIndex(i);
    name = listitem.getAttribute("label");
    menulistitem = menulist.appendItem(name, name);
    if (name == curitem)
      setcuritem = true;
    menulistitem.minWidth=menulist.width;
  }
  var ss = Components.classes["@mozilla.org/browser/search-service;1"]
                     .getService(Components.interfaces.nsIBrowserSearchService);
  var engines = ss.getVisibleEngines({ });
  for (var i=0; i < engines.length; i++) {
    name = engines[i].name;
    menulistitem = menulist.appendItem(name, name);
    if (name == curitem)
      setcuritem = true;
    menulistitem.minWidth=menulist.width;
  }


  if (setcuritem)
    menulist.value = curitem;
  else
    menulist.selectedIndex = 0;
}

function onNewSearchEngine()
{
  window.openDialog("chrome://cckwizard/content/searchengine.xul","newsearchengine","chrome,centerscreen,modal");
}

function onEditSearchEngine()
{
  window.openDialog("chrome://cckwizard/content/searchengine.xul","editsearchengine","chrome,centerscreen,modal");
}

function OnSearchEngineLoad()
{
  var listbox = this.opener.document.getElementById('searchEngineList');
  if (window.name == 'editsearchengine') {
    document.getElementById('searchengine').value = listbox.selectedItem.cck['engineurl'];
    document.getElementById('searchengineicon').value = listbox.selectedItem.cck['iconurl'];
    if (listbox.selectedItem.cck['iconurl'].length > 0) {
      document.getElementById('icon').src = listbox.selectedItem.cck['iconurl'];
    } else {
      document.getElementById('icon').src = getSearchEngineImage(listbox.selectedItem.cck['engineurl']);
    }
  }
  searchEngineCheckOKButton();

}

function searchEngineCheckOKButton()
{
  if (document.getElementById("searchengine").value) {
    document.documentElement.getButton("accept").setAttribute( "disabled", "false" );
  } else {
    document.documentElement.getButton("accept").setAttribute( "disabled", "true" );
  }
  if (!(document.getElementById("searchengineicon").value)) {
    var searchengineimage;
    if (searchengineimage = getSearchEngineImage(document.getElementById("searchengine").value)) {
      document.getElementById('icon').src = searchengineimage;
      document.getElementById("searchengineicon").setAttribute( "disabled", "true" );
    } else {
      document.getElementById('icon').src = "";
      document.getElementById("searchengineicon").removeAttribute( "disabled");
    }
  } else {
    try {
      var sourcefile = Components.classes["@mozilla.org/file/local;1"]
                                 .createInstance(Components.interfaces.nsILocalFile);
      sourcefile.initWithPath(document.getElementById('searchengineicon').value);
      var ioServ = Components.classes["@mozilla.org/network/io-service;1"]
                             .getService(Components.interfaces.nsIIOService);
      var imgfile = ioServ.newFileURI(sourcefile);
      document.getElementById('icon').src = imgfile.spec;
    } catch (ex) {
      document.getElementById('icon').src = "";
    }
  }
}

function OnSearchEngineOK()
{
  if (!(ValidateFile('searchengine', 'searchengineicon'))) {
    return false;
  }

  var listbox = this.opener.document.getElementById('searchEngineList');
  var listitem;
  var name = getSearchEngineName(document.getElementById('searchengine').value);
  if (!name) {
    var bundle = document.getElementById("bundle_cckwizard");
    gPromptService.alert(window, bundle.getString("windowTitle"),
                         bundle.getString("searchEngine.error"));
    return false;
  }
  if (window.name == 'newsearchengine') {
    listitem = listbox.appendItem(name, "");
    listitem.setAttribute("class", "listitem-iconic");
  } else {
    listitem = listbox.selectedItem;
    listbox.selectedItem.label = name;
  }
  if (document.getElementById('searchengineicon').value) {
    var sourcefile = Components.classes["@mozilla.org/file/local;1"]
                               .createInstance(Components.interfaces.nsILocalFile);
    sourcefile.initWithPath(document.getElementById('searchengineicon').value);
    var ioServ = Components.classes["@mozilla.org/network/io-service;1"]
                           .getService(Components.interfaces.nsIIOService);
    var imgfile = ioServ.newFileURI(sourcefile);
    listitem.setAttribute("image", imgfile.spec);
  } else {
    listitem.setAttribute("image", getSearchEngineImage(document.getElementById('searchengine').value));
  }

  listitem.cck['name'] = name;
  listitem.cck['engineurl'] = document.getElementById('searchengine').value;
  listitem.cck['iconurl'] = document.getElementById('searchengineicon').value;

  RefreshDefaultSearchEngines();
}

/* This code was lifted from nsSearchService.js.
   It's only purpose is to get the name of the search engine */

const kUselessLine = /^\s*($|#)/i;


function onNewCert()
{
  window.openDialog("chrome://cckwizard/content/cert.xul","newcert","chrome,centerscreen,modal");
}

function onEditCert()
{
  window.openDialog("chrome://cckwizard/content/cert.xul","editcert","chrome,centerscreen,modal")
}

function OnCertLoad()
{
  var listbox = this.opener.document.getElementById('certList');
  if (window.name == 'editcert') {
    document.getElementById('certpath').value = listbox.selectedItem.label;
    var trustString = listbox.selectedItem.value;
    if (trustString.charAt(0) == 'C') {
      document.getElementById("trustSSL").checked = true;
    }
    if (trustString.charAt(2) == 'C') {
      document.getElementById("trustEmail").checked = true;
    }
    if (trustString.charAt(4) == 'C') {
      document.getElementById("trustObjSign").checked = true;
    }
  }
  certCheckOKButton();
}

function certCheckOKButton()
{
  if (document.getElementById("certpath").value) {
    document.documentElement.getButton("accept").setAttribute( "disabled", "false" );
  } else {
    document.documentElement.getButton("accept").setAttribute( "disabled", "true" );
  }
}

function OnCertOK()
{
  if (!(ValidateFile('certpath'))) {
    return false;
  }

  var trustString = "";
  if (document.getElementById("trustSSL").checked) {
    trustString += "C,"
  } else {
    trustString += "c,"
  }
  if (document.getElementById("trustEmail").checked) {
    trustString += "C,"
  } else {
    trustString += "c,"
  }
  if (document.getElementById("trustObjSign").checked) {
    trustString += "C"
  } else {
    trustString += "c"
  }

  var listbox = this.opener.document.getElementById('certList');
  var listitem;
  if (window.name == 'newcert') {
    listitem = listbox.appendItem(document.getElementById('certpath').value, trustString);
  } else {
    listitem = listbox.selectedItem;
    listbox.selectedItem.label = document.getElementById('certpath').value;
    listbox.selectedItem.value = trustString;
  }
}




function onNewBundle()
{
  try {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    var bundle = document.getElementById("bundle_cckwizard");
    fp.init(window, bundle.getString("chooseFile"), nsIFilePicker.modeOpen);
    fp.appendFilters(nsIFilePicker.filterHTML | nsIFilePicker.filterText |
                     nsIFilePicker.filterAll | nsIFilePicker.filterImages | nsIFilePicker.filterXML);

    if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
      var listbox = document.getElementById('bundleList');
      var listitem = listbox.appendItem(fp.file.path, "");
    }
  }
  catch(ex) {
  }
}

function onEditBundle()
{
  var listbox = document.getElementById('bundleList');
  var filename = listbox.selectedItem.label;
  var sourcefile = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);
  try {
    sourcefile.initWithPath(filename);
    var ioServ = Components.classes["@mozilla.org/network/io-service;1"]
                           .getService(Components.interfaces.nsIIOService);

  } catch (ex) {
  }

  try {
    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
    var bundle = document.getElementById("bundle_cckwizard");
    fp.init(window, bundle.getString("chooseFile"), nsIFilePicker.modeOpen);
    fp.displayDirectory = sourcefile.parent;
    fp.defaultString = sourcefile.leafName;
    fp.appendFilters(nsIFilePicker.filterAll);
    if (fp.show() == nsIFilePicker.returnOK && fp.fileURL.spec && fp.fileURL.spec.length > 0) {
      listbox.selectedItem.label = fp.file.path;
    }
  }
  catch(ex) {
  }
}

function CreateCCK()
{
  var uuidGenerator = Components.classes["@mozilla.org/uuid-generator;1"]
                                .getService(Components.interfaces.nsIUUIDGenerator);
  var uuid = uuidGenerator.generateUUID().toString();

/* ---------- */
  var destdir = Components.classes["@mozilla.org/file/local;1"]
                          .createInstance(Components.interfaces.nsILocalFile);
  destdir.initWithPath(currentconfigpath);

  CCKWriteConfigFile(destdir);

  destdir.initWithPath(currentconfigpath);
  destdir.append("xpi");
  try {
    destdir.remove(true);
  } catch(ex) {}
  try {
    destdir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
  } catch(ex) {}

  CCKWriteConfigFile(destdir);
  destdir.append("chrome");
  destdir.append("content");
  destdir.append("cck");
  try {
    destdir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
  } catch(ex) {}

  CCKWriteXULOverlay(destdir);
  CCKWriteXULOverlayMac(destdir);
  CCKWriteXULOverlayNonMac(destdir);
  if (document.getElementById("hidden").checked)
  {
    CCKWriteExtensionsOverlay(destdir);
  }
  CCKWriteDTD(destdir);
  CCKWriteCSS(destdir);
  CCKWriteProperties(destdir);
  CCKCopyFile(document.getElementById("iconURL").value, destdir);
  CCKCopyFile(document.getElementById("LargeAnimPath").value, destdir);
  CCKCopyFile(document.getElementById("LargeStillPath").value, destdir);
  CCKCopyChromeToFile("cck.js", destdir)
  if (document.getElementById("noaboutconfig").checked)
    CCKCopyChromeToFile("cck-config.xul", destdir)

  var listbox = document.getElementById('certList');

  for (var i=0; i < listbox.getRowCount(); i++) {
    var listitem = listbox.getItemAtIndex(i);
    CCKCopyFile(listitem.getAttribute("label"), destdir);
  }

  if (document.getElementById("networkProxyType").value == "10") {
    CCKCopyFile(document.getElementById("autoproxyfile").value, destdir);
  }


/* ---------- */

  destdir.initWithPath(currentconfigpath);
  destdir.append("xpi");
  destdir.append("modules");
  try {
    destdir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
  } catch(ex) {}

  CCKWriteCCKModuleJS(destdir);

/* ---------- */

  destdir.initWithPath(currentconfigpath);
  destdir.append("xpi");
  destdir.append("components");
  try {
    destdir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
  } catch(ex) {}

//  CCKCopyChromeToFile("cckService.js", destdir);
  CCKWriteCCKServiceJS(destdir, uuid);

/* ---------- */

  destdir.initWithPath(currentconfigpath);
  destdir.append("xpi");
  destdir.append("defaults");
  destdir.append("preferences");
  try {
    destdir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
  } catch(ex) {}

  CCKWriteDefaultJS(destdir)

/* ---------- */

  destdir.initWithPath(currentconfigpath);
  destdir.append("xpi");
  destdir.append("plugins");
  try {
    destdir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
  } catch(ex) {}

  listbox = document.getElementById('browserPluginList');

  for (var i=0; i < listbox.getRowCount(); i++) {
    listitem = listbox.getItemAtIndex(i);
    CCKCopyFile(listitem.getAttribute("label"), destdir);
  }

  listbox = document.getElementById('searchEngineList');

  destdir.initWithPath(currentconfigpath);
  destdir.append("xpi");
  destdir.append("searchplugins");
  try {
    destdir.remove(true);
    if (listbox.getRowCount() > 0)
      destdir.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
  } catch(ex) {}

  for (var i=0; i < listbox.getRowCount(); i++) {
    listitem = listbox.getItemAtIndex(i);
    CCKCopyFile(listitem.cck['engineurl'], destdir);
    if (listitem.cck['iconurl'].length > 0)
      CCKCopyFile(listitem.cck['iconurl'], destdir);
  }

  destdir.initWithPath(currentconfigpath);
  destdir.append("xpi");

  CCKWriteChromeManifest(destdir, uuid);
  CCKWriteInstallRDF(destdir);

  var filename = document.getElementById("filename").value;
  if (filename.length == 0)
    filename = "cck";
  filename += ".xpi";

  var zipContents = ["chrome", "plugins", "modules", "components", "defaults", "platform", "searchplugins", "chrome.manifest", "install.rdf", "cck.config"];


  if (document.getElementById('bundleList').getRowCount() > 0) {
    listbox = document.getElementById('bundleList');

    var tempfile = Components.classes["@mozilla.org/file/local;1"]
                               .createInstance(Components.interfaces.nsILocalFile);
    for (var i=0; i < listbox.getRowCount(); i++) {
      listitem = listbox.getItemAtIndex(i);
      CCKCopyFile(listitem.getAttribute("label"), destdir);
      tempfile.initWithPath(listitem.getAttribute("label"));
      zipContents.push(tempfile.leafName);
    }
  }

  CCKZip("cck.xpi", destdir,
         zipContents);

  var outputdir = Components.classes["@mozilla.org/file/local;1"]
                            .createInstance(Components.interfaces.nsILocalFile);

  outputdir.initWithPath(currentconfigpath);
  destdir.append("cck.xpi");

  outputdir.append(filename);
  try {
    outputdir.remove(true);
  } catch(ex) {}
  outputdir = outputdir.parent;
  destdir.copyTo(outputdir, filename);

  var bundle = document.getElementById("bundle_cckwizard");

  outputdir.append(filename);

  gPromptService.alert(window, bundle.getString("windowTitle"),
                       bundle.getString("outputLocation") + outputdir.path);
}

/* This function takes a file in the chromedir and creates a real file */

function CCKCopyChromeToFile(chromefile, location)
{
  var file = location.clone();
  file.append(chromefile);

  try {
    file.remove(false);
  } catch (ex) {
  }
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);

  fos.init(file, -1, -1, false);

  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components
    .classes["@mozilla.org/scriptableinputstream;1"]
    .getService(Components.interfaces.nsIScriptableInputStream);

  var channel=ioService.newChannel("chrome://cckwizard/content/srcfiles/" + chromefile + ".in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  fos.write(str, str.length);
  fos.close();
}

function zwRecurse(zipobj, dirobj, location) {
  var entries = dirobj.directoryEntries;

  while (entries.hasMoreElements()) {
    var file = entries.getNext().QueryInterface(Components.interfaces.nsILocalFile);;
    if (file.exists() && file.isDirectory()) {
      zwRecurse(zipobj, file, location);
    } else if (file.exists()) {
      /* Remove beginning of path */
      var path = file.path.replace(location.path, "");
      /* Remove beginning slash */
      path = path.substr(1);
      /* Change backslashes to forward slashes */
      path = path.replace(/\\/g, '/');
      zipobj.addEntryFile(path, Components.interfaces.nsIZipWriter.COMPRESSION_NONE, file, false);
    }
  }
}

/* This function creates a given zipfile in a given location */
/* It takes as parameters the names of all the files/directories to be contained in the ZIP file */
/* It works by creating a CMD file to generate the ZIP */
/* or using the nsIZipWriter interface */
/* files_to_zip is an array */

function CCKZip(zipfile, location, files_to_zip)
{
  var file = location.clone();
  file.append(zipfile);
  try {
    file.remove(false);
  } catch (ex) {}

  var archivefileobj = location.clone();
  archivefileobj.append(zipfile);

  var zipwriter = Components.Constructor("@mozilla.org/zipwriter;1", "nsIZipWriter");
  var zipwriterobj = new zipwriter();
  zipwriterobj.open(archivefileobj, 0x04 | 0x08 | 0x20);

  for (var i=0; i < files_to_zip.length; i++) {
	var sourcepathobj = location.clone();
	sourcepathobj.append(files_to_zip[i]);
	if (sourcepathobj.exists() && sourcepathobj.isDirectory()) {
	  zwRecurse(zipwriterobj, sourcepathobj, location);
	} else if (sourcepathobj.exists()) {
	  /* Remove beginning of path */
	  var path = sourcepathobj.path.replace(location.path, "");
	  /* Remove beginning slash */
	  path = path.substr(1);
	/* Convert backslashes to forward slashes */
	  path = path.replace(/\\/g, '/');
	  zipwriterobj.addEntryFile(path, Components.interfaces.nsIZipWriter.COMPRESSION_NONE, sourcepathobj, false);
	}
  }
  zipwriterobj.close();
  return;
}

function CCKWriteXULOverlay(destdir)
{
  var tooltipXUL  = '  <button id="navigator-throbber" oncommand="goClickThrobber(\'browser.throbber.url\', event)" onclick="checkForMiddleClick(this, event);" tooltiptext="&throbber.tooltip;" disabled="false"/>';
  var titlebarXUL = '  <window id="main-window" titlemodifier="&mainWindow.titlemodifier;"/>';
  var bookmarksbarXUL = '  <toolbar id="PersonalToolbar" collapsed="false"/>';
  var tabsonbottomXUL = '  <toolbox id="navigator-toolbox" tabsonbottom="false"/>';
  var menubarXUL = '  <toolbar id="toolbar-menubar" autohide="false"/>';
  var addonbarXUL = '  <toolbar id="addon-bar" collapsed="false"/>';

  var file = destdir.clone();
  file.append("cck-browser-overlay.xul");
  try {
    file.remove(false);
  } catch (ex) {}
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);

  fos.init(file, -1, -1, false);

  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .getService(Components.interfaces.nsIScriptableInputStream);

  var channel=ioService.newChannel("chrome://cckwizard/content/srcfiles/cck-browser-overlay.xul.in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  var throbberurl = document.getElementById("AnimatedLogoURL").value;
  if (throbberurl && (throbberurl.length > 0))
    str = str.replace(/%button%/g, tooltipXUL);
  else
    str = str.replace(/%button%/g, "");

  var titlebar = document.getElementById("CompanyName").value;
  if (titlebar && (titlebar.length > 0))
      str = str.replace(/%window%/g, titlebarXUL);
  else
    str = str.replace(/%window%/g, "");

  str = str.replace(/%OrganizationName%/g, document.getElementById("OrganizationName").value);

  if (document.getElementById("tabsonbottom").checked)
    str = str.replace(/%tabsonbottom%/g, tabsonbottomXUL);
  else
    str = str.replace(/%tabsonbottom%/g, "");

  var numToolbarFolders = document.getElementById('tbFolder.bookmarkList').getRowCount();
  var numToolbarBookmarks = document.getElementById('tb.bookmarkList').getRowCount();

  if (document.getElementById("bookmarksbar").checked ||
      numToolbarBookmarks > 0 ||
      numToolbarBookmarks > 0)
    str = str.replace(/%bookmarksbar%/g, bookmarksbarXUL);
  else
    str = str.replace(/%bookmarksbar%/g, "");

  if (document.getElementById("menubar").checked)
    str = str.replace(/%menubar%/g, menubarXUL);
  else
    str = str.replace(/%menubar%/g, "");

  if (document.getElementById("addonbar").checked)
    str = str.replace(/%addonbar%/g, addonbarXUL);
  else
    str = str.replace(/%addonbar%/g, "");


  fos.write(str, str.length);
  fos.close();
}


function CCKWriteXULOverlayNonMac(destdir)
{
  var helpmenu1 = '\n  <menupopup id="menu_HelpPopup">\n';
  var helpmenu2 = '    <menuseparator insertafter="aboutSeparator"/>\n';
  var helpmenu3 = '    <menuitem label="&cckHelp.label;" insertafter="aboutSeparator"\n';
  var helpmenu4 = '              accesskey="&cckHelp.accesskey;"\n';
  var helpmenu5 = '              oncommand="openUILink(getCCKLink(\'cckhelp.url\'), event, false, true);"\n';
  var helpmenu6 = '              onclick="checkForMiddleClick(this, event);"/>\n';
  var helpmenu7 = '  </menupopup>\n\n';
  var helpmenu8 = '  <!-- Firefox App Menu (4 and higher) -->\n'
  var helpmenu9 = '  <menupopup id="appmenu_helpMenupopup">\n';
  var helpmenu10 = '    <menuitem label="&cckHelp.label;" insertbefore="appmenu_about"\n';
  var helpmenu11 = '              accesskey="&cckHelp.accesskey;"\n';
  var helpmenu12 = '              oncommand="openUILink(getCCKLink(\'cckhelp.url\'), event, false, true);"\n';
  var helpmenu13 = '              onclick="checkForMiddleClick(this, event);"/>\n';
  var helpmenu14 = '    <menuseparator insertbefore="appmenu_about"/>\n'
  var helpmenu15 = '  </menupopup>\n';

  var file = destdir.clone();
  file.append("cck-browser-overlay-nonmac.xul");
  try {
    file.remove(false);
  }
  catch (ex) {}

  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);

  fos.init(file, -1, -1, false);

  var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                            .getService(Components.interfaces.nsIIOService);
  var scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"]
                                   .getService(Components.interfaces.nsIScriptableInputStream);

  var channel = ioService.newChannel("chrome://cckwizard/content/srcfiles/cck-browser-overlay-menu.xul.in", null, null);
  var input = channel.open();
  scriptableStream.init(input);
  var str = scriptableStream.read( input.available() );
  scriptableStream.close();
  input.close();

  var helpmenu = document.getElementById("HelpMenuCommandName").value;
  if (helpmenu && (helpmenu.length > 0)) {
    var helpmenuXUL = helpmenu1 + helpmenu2 + helpmenu3;
    var helpmenuakey = document.getElementById("HelpMenuCommandAccesskey").value;
    if (helpmenuakey && (helpmenuakey.length > 0)) {
      helpmenuXUL += helpmenu4;
    }

    helpmenuXUL += helpmenu5 + helpmenu6 + helpmenu7 + helpmenu8 + helpmenu9 + helpmenu10;
    if (helpmenuakey && (helpmenuakey.length > 0)) {
      helpmenuXUL += helpmenu11;
    }

    helpmenuXUL += helpmenu12 + helpmenu13 + helpmenu14 + helpmenu15;

    str = str.replace(/%menupopup%/g, helpmenuXUL);
  }
  else {
    str = str.replace(/%menupopup%/g, "");
  }

  str = str.replace(/%OrganizationName%/g, document.getElementById("OrganizationName").value);

  fos.write(str, str.length);
  fos.close();
}


function CCKWriteXULOverlayMac(destdir)
{
  var helpmenu1   = '  <menupopup id="menu_HelpPopup">\n';
  var helpmenu2   = '    <menuseparator/>\n';
  var helpmenu3   = '    <menuitem label="&cckHelp.label;"\n';
  var helpmenu4   = '              accesskey="&cckHelp.accesskey;"\n';
  var helpmenu5   = '              oncommand="openUILink(getCCKLink(\'cckhelp.url\'), event, false, true);"\n';
  var helpmenu6   = '              onclick="checkForMiddleClick(this, event);"/>\n';
  var helpmenu7   = '  </menupopup>\n';

  var file = destdir.clone();
  file.append("cck-browser-overlay-mac.xul");
  try {
    file.remove(false);
  } catch (ex) {}
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);

  fos.init(file, -1, -1, false);

  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .getService(Components.interfaces.nsIScriptableInputStream);

  var channel=ioService.newChannel("chrome://cckwizard/content/srcfiles/cck-browser-overlay-menu.xul.in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  var helpmenu = document.getElementById("HelpMenuCommandName").value;
  if (helpmenu && (helpmenu.length > 0)) {
    var helpmenuXUL = helpmenu1 + helpmenu2 + helpmenu3;
    var helpmenuakey = document.getElementById("HelpMenuCommandAccesskey").value;
    if (helpmenuakey && (helpmenuakey.length > 0)) {
      helpmenuXUL += helpmenu4;
    }
    helpmenuXUL += helpmenu5 + helpmenu6 + helpmenu7;
    str = str.replace(/%menupopup%/g, helpmenuXUL);
  } else {
    str = str.replace(/%menupopup%/g, "");
  }

  str = str.replace(/%OrganizationName%/g, document.getElementById("OrganizationName").value);

  fos.write(str, str.length);
  fos.close();
}


function CCKWriteExtensionsOverlay(destdir)
{
  var file = destdir.clone();
  file.append("cck-extensions-overlay.css");
  try {
    file.remove(false);
  } catch (ex) {}
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);

  fos.init(file, -1, -1, false);

  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .getService(Components.interfaces.nsIScriptableInputStream);

  var channel=ioService.newChannel("chrome://cckwizard/content/srcfiles/cck-extensions-overlay.css.in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  str = str.replace(/%id%/g, document.getElementById("id").value);

  fos.write(str, str.length);
  fos.close();
}

function CCKWriteCSS(destdir)
{

var animated1 = '#navigator-throbber[busy="true"] {\n';
var animated2 = 'toolbar[iconsize="small"] #navigator-throbber[busy="true"],\n';
var animated3 = 'toolbar[mode="text"] #navigator-throbber[busy="true"] {\n';
var atrest1 = '#navigator-throbber {\n';
var atrest2 = 'toolbar[iconsize="small"] #navigator-throbber,\n';
var atrest3 = 'toolbar[mode="text"] #navigator-throbber {\n';
var liststyleimage = '  list-style-image: url("chrome://cck-%OrganizationName%/content/';
var liststyleimageend = '");\n}\n';

  liststyleimage = liststyleimage.replace(/%OrganizationName%/g, document.getElementById("OrganizationName").value);

  var file = destdir.clone();
  file.append("cck.css");
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
  fos.init(file, -1, -1, false);

  var animatedlogopath = document.getElementById("LargeAnimPath").value;
  if (animatedlogopath && (animatedlogopath.length > 0)) {
    var file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(animatedlogopath);

    fos.write(animated1, animated1.length);
    fos.write(liststyleimage, liststyleimage.length);
    fos.write(file.leafName, file.leafName.length);
    fos.write(liststyleimageend, liststyleimageend.length);

    fos.write(animated2, animated2.length);
    fos.write(animated3, animated3.length);
    fos.write(liststyleimage, liststyleimage.length);
    fos.write(file.leafName, file.leafName.length);
    fos.write(liststyleimageend, liststyleimageend.length);
  }
  var atrestlogopath = document.getElementById("LargeStillPath").value;
  if (atrestlogopath && (atrestlogopath.length > 0)) {
    var file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);
    file.initWithPath(atrestlogopath);

    fos.write(atrest1, atrest1.length);
    fos.write(liststyleimage, liststyleimage.length);
    fos.write(file.leafName, file.leafName.length);
    fos.write(liststyleimageend, liststyleimageend.length);

    fos.write(atrest2, atrest2.length);
    fos.write(atrest3, atrest3.length);
    fos.write(liststyleimage, liststyleimage.length);
    fos.write(file.leafName, file.leafName.length);
    fos.write(liststyleimageend, liststyleimageend.length);
  }
  fos.close();
}

function CCKWriteDTD(destdir)
{
  var file = destdir.clone();
  file.append("cck.dtd");
  try {
    file.remove(false);
  } catch (ex) {}
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);
  var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterOutputStream);

  fos.init(file, -1, -1, false);
  cos.init(fos, null, 0, null);

  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .getService(Components.interfaces.nsIScriptableInputStream);

  var channel=ioService.newChannel("chrome://cckwizard/content/srcfiles/cck.dtd.in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  str = str.replace(/%throbber.tooltip%/g, htmlEscape(document.getElementById("AnimatedLogoTooltip").value));
  str = str.replace(/%mainWindow.titlemodifier%/g, htmlEscape(document.getElementById("CompanyName").value));
  str = str.replace(/%cckHelp.label%/g, htmlEscape(document.getElementById("HelpMenuCommandName").value));
  str = str.replace(/%cckHelp.accesskey%/g, document.getElementById("HelpMenuCommandAccesskey").value);
  cos.writeString(str);
  cos.close();
  fos.close();
}


function CCKWriteProperties(destdir)
{
  var file = destdir.clone();
  file.append("cck.properties");

  try {
    file.remove(false);
  } catch (ex) {}
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                      .createInstance(Components.interfaces.nsIFileOutputStream);
  var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterOutputStream);

  fos.init(file, -1, -1, false);
  cos.init(fos, null, 0, null);

  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
                          .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components.classes["@mozilla.org/scriptableinputstream;1"]
                                 .getService(Components.interfaces.nsIScriptableInputStream);

  var channel=ioService.newChannel("chrome://cckwizard/content/srcfiles/cck.properties.in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  str = str.replace(/%id%/g, document.getElementById("id").value);
  str = str.replace(/%version%/g, document.getElementById("version").value);
  str = str.replace(/%OrganizationName%/g, document.getElementById("OrganizationName").value);
  str = str.replace(/%browser.throbber.url%/g, document.getElementById("AnimatedLogoURL").value);
  str = str.replace(/%cckhelp.url%/g, document.getElementById("HelpMenuCommandURL").value);
  str = str.replace(/%browser.startup.homepage%/g, document.getElementById("HomePageURL").value);
  var overrideurl = document.getElementById('HomePageOverrideURL').value;
  if (overrideurl && overrideurl.length) {
    str = str.replace(/%startup.homepage_override_url%/g, overrideurl);
  } else {
    str = str.replace(/%startup.homepage_override_url%/g, document.getElementById("HomePageURL").value);
  }

  var bundle = document.getElementById("bundle_cckwizard");

  if (document.getElementById("defaultSearchEngine").value != bundle.getString("useBrowserDefault")) {
    str = str.replace(/%browser.search.defaultenginename%/g, document.getElementById("defaultSearchEngine").value);
    str = str.replace(/%browser.search.order.1%/g, document.getElementById("defaultSearchEngine").value);
  } else {
    str = str.replace(/%browser.search.defaultenginename%/g, "");
    str = str.replace(/%browser.search.order.1%/g, "");
  }

  str = str.replace(/%PopupAllowedSites%/g, document.getElementById("PopupAllowedSites").value);
  str = str.replace(/%InstallAllowedSites%/g, document.getElementById("InstallAllowedSites").value);
  str = str.replace(/%CookieAllowedSites%/g, document.getElementById("CookieAllowedSites").value);
  str = str.replace(/%PopupDeniedSites%/g, document.getElementById("PopupDeniedSites").value);
  str = str.replace(/%InstallDeniedSites%/g, document.getElementById("InstallDeniedSites").value);
  str = str.replace(/%CookieDeniedSites%/g, document.getElementById("CookieDeniedSites").value);
  cos.writeString(str);

  if (document.getElementById("hidden").checked)
  {
    str = "hidden=true\n";
    cos.writeString(str);
  }

  if (document.getElementById("appManaged").checked)
  {
    str = "appManaged=true\n";
    cos.writeString(str);
  }

  var radio = document.getElementById('ToolbarLocation');
  str = "ToolbarLocation=" + radio.value + "\n";
  cos.writeString(str);

/* Add toolbar/bookmark stuff at end */
  str = document.getElementById('ToolbarFolder1').value;
  if (str && str.length) {
    str = "ToolbarFolder1=" + str + "\n";
    cos.writeString(str);
    var listbox = document.getElementById('tbFolder.bookmarkList');
    for (var j=0; j < listbox.getRowCount(); j++) {
      listitem = listbox.getItemAtIndex(j);
      str = "ToolbarFolder1.BookmarkTitle" + (j+1) + "=" + listitem.getAttribute("label") + "\n";
      cos.writeString(str);
      var str = "ToolbarFolder1.BookmarkURL" + (j+1) + "=" + listitem.getAttribute("value") + "\n";
      cos.writeString(str);
      if (listitem.cck['type'] && listitem.cck['type'].length) {
        var str = "ToolbarFolder1.BookmarkType" + (j+1) + "=" + listitem.cck['type'] + "\n";
        cos.writeString(str);
      }
    }
  }

  listbox = document.getElementById('tb.bookmarkList');
  for (var j=0; j < listbox.getRowCount(); j++) {
    var listitem = listbox.getItemAtIndex(j);
    str = "ToolbarBookmarkTitle" + (j+1) + "=" + listitem.getAttribute("label") + "\n";
    cos.writeString(str);
    var str = "ToolbarBookmarkURL" + (j+1) + "=" + listitem.getAttribute("value") + "\n";
    cos.writeString(str);
    if (listitem.cck['type'] && listitem.cck['type'].length) {
      var str = "ToolbarBookmarkType" + (j+1) + "=" + listitem.cck['type'] + "\n";
      cos.writeString(str);
    }
  }

  radio = document.getElementById('BookmarkLocation');
  str = "BookmarkLocation=" + radio.value + "\n";
  cos.writeString(str);

  str = document.getElementById('BookmarkFolder1').value;
  if (str && str.length) {
    str = "BookmarkFolder1=" + str + "\n";
    cos.writeString(str);
    listbox = document.getElementById('bmFolder.bookmarkList');
    for (var j=0; j < listbox.getRowCount(); j++) {
      listitem = listbox.getItemAtIndex(j);
      str = "BookmarkFolder1.BookmarkTitle" + (j+1) + "=" + listitem.getAttribute("label") + "\n";
      cos.writeString(str);
      var str = "BookmarkFolder1.BookmarkURL" + (j+1) + "=" + listitem.getAttribute("value") + "\n";
      cos.writeString(str);
      if (listitem.cck['type'] && listitem.cck['type'].length) {
        var str = "BookmarkFolder1.BookmarkType" + (j+1) + "=" + listitem.cck['type'] + "\n";
        cos.writeString(str);
      }
    }
  }

  listbox = document.getElementById('bm.bookmarkList');
  for (var j=0; j < listbox.getRowCount(); j++) {
    listitem = listbox.getItemAtIndex(j);
    str = "BookmarkTitle" + (j+1) + "=" + listitem.getAttribute("label") + "\n";
    cos.writeString(str);
    var str = "BookmarkURL" + (j+1) + "=" + listitem.getAttribute("value") + "\n";
    cos.writeString(str);
    if (listitem.cck['type'] && listitem.cck['type'].length) {
      var str = "BookmarkType" + (j+1) + "=" + listitem.cck['type'] + "\n";
      cos.writeString(str);
    }
  }


  // Registry Keys
  listbox = document.getElementById("regList");
  for (var i=0; i < listbox.getRowCount(); i++) {
    listitem = listbox.getItemAtIndex(i);
    str = "RegName" + (i+1) + "=" + listitem.getAttribute("label") + "\n";
    cos.writeString(str);
    str = "RootKey" + (i+1) + "=" + listitem.cck['rootkey'] + "\n";
    cos.writeString(str);
    str = "Key" + (i+1) + "=" + listitem.cck['key'] + "\n";
    str = str.replace(/\\/g, "\\\\");
    cos.writeString(str);
    str = "Name" + (i+1) + "=" + listitem.cck['name'] + "\n";
    cos.writeString(str);
    str = "NameValue" + (i+1) + "=" + listitem.cck['namevalue'] + "\n";
    cos.writeString(str);
    str = "Type" + (i+1) + "=" + listitem.cck['type'] + "\n";
    cos.writeString(str);
  }

  // Pref locks
  listbox = document.getElementById("prefList");
  var j = 1;
  for (var i=0; i < listbox.getRowCount(); i++) {
    listitem = listbox.getItemAtIndex(i);
    if (listitem.cck['lock'] == "true") {
      str = "LockPref" + (j) + "=" + listitem.getAttribute("label") + "\n";
      cos.writeString(str);
      j++;
    }
  }


  listbox = document.getElementById('certList');

  for (var i=0; i < listbox.getRowCount(); i++) {
    listitem = listbox.getItemAtIndex(i);
    var file = Components.classes["@mozilla.org/file/local;1"]
                         .createInstance(Components.interfaces.nsILocalFile);
    try {
      file.initWithPath(listitem.getAttribute("label"));
      str = "Cert"+ (i+1) + "=" + file.leafName + "\n";
      cos.writeString(str);
      str = "CertTrust" + (i+1) + "=" + listitem.getAttribute("value") + "\n";
      cos.writeString(str);
	} catch(ex) {
      gPromptService.alert(window, bundle.getString("windowTitle"),
                                 "Unable to locate certificate: " + listitem.getAttribute("label"));
	}
  }

  cos.close();
  fos.close();
}

function prefIsLocked(prefname)
{
  var listbox = document.getElementById("prefList");
  for (var i=0; i < listbox.getRowCount(); i++) {
    var listitem = listbox.getItemAtIndex(i);
    if (prefname == listitem.getAttribute("label"))
      if (listitem.cck['lock'] == "true")
        return true;
  }

}

function CCKWriteDefaultJS(destdir)
{
  var throbber1 = 'pref("browser.throbber.url",            "';
  var homepage1 = 'pref("browser.startup.homepage",        "';
  var homepage2 = 'pref("startup.homepage_override_url",   "';
  var homepage3 = 'pref("startup.homepage_welcome_url",   "';

  var chromeurl =   "chrome://cck-%OrganizationName%/content/cck.properties";
  var prefend = '");\n';

  var searchengine1 = 'pref("browser.search.defaultenginename", "chrome://cck-%OrganizationName%/content/cck.properties");\n';
  var searchengine2 = 'pref("browser.search.order.1",           "chrome://cck-%OrganizationName%/content/cck.properties");\n';

  chromeurl = chromeurl.replace(/%OrganizationName%/g, document.getElementById("OrganizationName").value);
  searchengine1 = searchengine1.replace(/%OrganizationName%/g, document.getElementById("OrganizationName").value);
  searchengine2 = searchengine2.replace(/%OrganizationName%/g, document.getElementById("OrganizationName").value);

  var file = destdir.clone();
  file.append("firefox-cck.js");

  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
  fos.init(file, -1, -1, false);

  var logobuttonurl = document.getElementById("AnimatedLogoURL").value;
  if (logobuttonurl && (logobuttonurl.length > 0)) {
    /* If the pref is , we set it in our service using */
    /* The value from properties */
    if (!prefIsLocked("browser.throbber.url")) {
      fos.write(throbber1, throbber1.length);
      fos.write(chromeurl, chromeurl.length);
      fos.write(prefend, prefend.length);
    }
  }

  var browserstartuppage = document.getElementById("HomePageURL").value;
  var overrideurl = document.getElementById('HomePageOverrideURL').value;
  var welcomeurl = document.getElementById('HomePageWelcomeURL').value;
  if (browserstartuppage && (browserstartuppage.length > 0)) {
    /* If the pref is , we set it in our service using */
    /* The value from properties */
    if (!prefIsLocked("browser.startup.homepage")) {
      fos.write(homepage1, homepage1.length);
      fos.write(chromeurl, chromeurl.length);
      fos.write(prefend, prefend.length);
    }
  }
  if ((overrideurl && overrideurl.length) || (document.getElementById("noOverridePage").checked)) {
    fos.write(homepage2, homepage2.length);
    if (!document.getElementById("noOverridePage").checked) {
      fos.write(overrideurl, overrideurl.length);
    }
    fos.write(prefend, prefend.length);
  }
  if ((welcomeurl && welcomeurl.length) || (document.getElementById("noWelcomePage").checked)) {
    fos.write(homepage3, homepage3.length);
    if (!document.getElementById("noWelcomePage").checked) {
      fos.write(welcomeurl, welcomeurl.length);
    }
    fos.write(prefend, prefend.length);
  }

  var bundle = document.getElementById("bundle_cckwizard");

  if (document.getElementById("defaultSearchEngine").selectedItem.label != bundle.getString("useBrowserDefault")) {
    if (!prefIsLocked("browser.search.defaultenginename")) {
      fos.write(searchengine1, searchengine1.length);
    }
    if (!prefIsLocked("browser.search.order.1")) {
      fos.write(searchengine2, searchengine2.length);
    }
  }

  // Preferences
  var listbox = document.getElementById("prefList");
  for (var i=0; i < listbox.getRowCount(); i++) {
    var listitem = listbox.getItemAtIndex(i);
    /* allow for locking prefs without setting value */
    if ((listitem.getAttribute("value").length) && (!(arrayItemExists(prefsLockOnly, listitem.getAttribute("label"))))) {
      var line;
      /* If it is a string, put quotes around it */
      if (listitem.cck['type'] == "string") {
        line = 'pref("' + listitem.getAttribute("label") + '", ' + '"' + listitem.getAttribute("value") + '"' + ');\n';
      } else {
        line = 'pref("' + listitem.getAttribute("label") + '", ' + listitem.getAttribute("value") + ');\n';
      }
      fos.write(line, line.length);
    }
  }

  var radiogroup = document.getElementById("networkProxyType");
  if (radiogroup.value == "")
    radiogroup.value = "0";

  switch ( radiogroup.value ) {
    case "1":
      var proxystringlist = ["networkProxyHTTP","networkProxySSL","networkProxyFTP","networkProxyNone","networkProxyAutoconfigURL" ];

      for (i = 0; i < proxystringlist.length; i++) {
        var proxyitem = document.getElementById(proxystringlist[i]);
        if (proxyitem.value.length > 0) {
          var line = 'pref("' + proxyitem.getAttribute("preference") + '", "' + proxyitem.value + '");\n';
          fos.write(line, line.length);
        }
      }

      var proxyintegerlist = ["networkProxyHTTP_Port","networkProxySSL_Port","networkProxyFTP_Port","networkProxySOCKSVersion","networkProxyType"];

      for (i = 0; i < proxyintegerlist.length; i++) {
        var proxyitem = document.getElementById(proxyintegerlist[i]);
        if (proxyitem.value.length > 0) {
          var line = 'pref("' + proxyitem.getAttribute("preference") + '", ' + proxyitem.value + ');\n';
          fos.write(line, line.length);
        }
      }

      var proxyitem = document.getElementById("shareAllProxies");
      var line = 'pref("' + proxyitem.getAttribute("preference") + '", ' + proxyitem.checked + ');\n';
      fos.write(line, line.length);
      break;
    case "2":
      var proxystringlist = ["networkProxyAutoconfigURL"];

      for (i = 0; i < proxystringlist.length; i++) {
        var proxyitem = document.getElementById(proxystringlist[i]);
        if (proxyitem.value.length > 0) {
          var line = 'pref("' + proxyitem.getAttribute("preference") + '", "' + proxyitem.value + '");\n';
          fos.write(line, line.length);
        }
      }

      var proxyintegerlist = ["networkProxyType"];

      for (i = 0; i < proxyintegerlist.length; i++) {
        var proxyitem = document.getElementById(proxyintegerlist[i]);
        if (proxyitem.value.length > 0) {
          var line = 'pref("' + proxyitem.getAttribute("preference") + '", ' + proxyitem.value + ');\n';
          fos.write(line, line.length);
        }
      }
      break;
    case "4":
    case "5":
    case "0":
      var proxyintegerlist = ["networkProxyType"];

      for (i = 0; i < proxyintegerlist.length; i++) {
        var proxyitem = document.getElementById(proxyintegerlist[i]);
        if (proxyitem.value.length > 0) {
          var line = 'pref("' + proxyitem.getAttribute("preference") + '", ' + proxyitem.value + ');\n';
          fos.write(line, line.length);
        }
      }
      break;
    case "10":
      var file = Components.classes["@mozilla.org/file/local;1"]
                           .createInstance(Components.interfaces.nsILocalFile);
      try {
      file.initWithPath(document.getElementById("autoproxyfile").value);
      } catch (ex) {
        alert("Invalid proxy file");
      }
      var line = 'pref("network.proxy.autoconfig_url", "chrome://cck-%OrganizationName%/content/' + file.leafName + '");\n';
	  line = line.replace(/%OrganizationName%/g, document.getElementById("OrganizationName").value);


      fos.write(line, line.length);

      var line = 'pref("network.proxy.type", 2);\n';
      fos.write(line, line.length);

      break;
  }

  // Firefox 14 and beyond uses a pref for tabs on top
  if (document.getElementById("tabsonbottom").checked) {
    var line = 'pref("browser.tabs.onTop", false);\n';
    fos.write(line, line.length);
  }


  fos.close();
}

function CCKWriteCCKServiceJS(destdir, uuid)
{
  var file = destdir.clone();

  file.append("cckService.js");
  try {
    file.remove(false);
  } catch (ex) {
  }
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
  var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterOutputStream);

  fos.init(file, -1, -1, false);
  cos.init(fos, null, 0, null);

  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components
    .classes["@mozilla.org/scriptableinputstream;1"]
    .getService(Components.interfaces.nsIScriptableInputStream);

  var channel=ioService.newChannel("chrome://cckwizard/content/srcfiles/cckService.js.in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  str = str.replace(/%uuid%/g, uuid);
  var organizationName = document.getElementById("OrganizationName").value
  str = str.replace(/%OrganizationName%/g, organizationName);
  str = str.replace(/%OrganizationNameNoDashes%/g, organizationName.replace('-','_'));
  str = str.replace(/%id%/g, document.getElementById("id").value);

  cos.writeString(str);
  cos.close();
  fos.close();
}

function CCKWriteCCKModuleJS(destdir)
{
  var file = destdir.clone();

  file.append("cckModule.jsm");
  try {
    file.remove(false);
  } catch (ex) {
  }
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
  var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterOutputStream);

  fos.init(file, -1, -1, false);
  cos.init(fos, null, 0, null);

  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components
    .classes["@mozilla.org/scriptableinputstream;1"]
    .getService(Components.interfaces.nsIScriptableInputStream);

  var channel=ioService.newChannel("chrome://cckwizard/content/srcfiles/cckModule.jsm.in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  str = str.replace(/%OrganizationName%/g, document.getElementById("OrganizationName").value);
  str = str.replace(/%id%/g, document.getElementById("id").value);

  cos.writeString(str);
  cos.close();
  fos.close();
}



function CCKWriteInstallRDF(destdir)
{
  var idline =          "<em:id>%id%</em:id>";
  var nameline =        "<em:name>%name%</em:name>";
  var versionline =     "<em:version>%version%</em:version>";
  var descriptionline = "<em:description>%description%</em:description>";
  var creatorline =     "<em:creator>%creator%</em:creator>";
  var homepageURLline = "<em:homepageURL>%homepageURL%</em:homepageURL>";
  var updateURLline =   "<em:updateURL>%updateURL%</em:updateURL>";
  var updateKeyline =   "<em:updateKey>%updateKey%</em:updateKey>";
  var iconURLline =     "<em:iconURL>chrome://cck-%OrganizationName%/content/%iconURL%</em:iconURL>";
  var hiddenline =      "<em:hidden>true</em:hidden>";
  var lockedline =      "<em:locked>true</em:locked>";
  var appManagedline =   "<em:appManaged>true</em:appManaged>";
  var minVersionline =   "<em:minVersion>%minVersion%</em:minVersion>";
  var maxVersionline =   "<em:maxVersion>%maxVersion%</em:maxVersion>";

  iconURLline = iconURLline.replace(/%OrganizationName%/g, document.getElementById("OrganizationName").value);


  var file = destdir.clone();

  file.append("install.rdf");
  try {
    file.remove(false);
  } catch (ex) {
  }
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
  var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterOutputStream);

  fos.init(file, -1, -1, false);
  cos.init(fos, null, 0, null);

  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components
    .classes["@mozilla.org/scriptableinputstream;1"]
    .getService(Components.interfaces.nsIScriptableInputStream);

  var channel=ioService.newChannel("chrome://cckwizard/content/srcfiles/install.rdf.in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  var id = document.getElementById("id").value;
  if (id && (id.length > 0)) {
    str = str.replace(/%idline%/g, idline);
    str = str.replace(/%id%/g, document.getElementById("id").value);
  }

  var name = document.getElementById("name").value;
  if (name && (name.length > 0)) {
    str = str.replace(/%nameline%/g, nameline);
    str = str.replace(/%name%/g, htmlEscape(document.getElementById("name").value));
  } else {
    str = str.replace(/%nameline%/g, "");
  }

  var version = document.getElementById("version").value;
  if (version && (version.length > 0)) {
    str = str.replace(/%versionline%/g, versionline);
    str = str.replace(/%version%/g, document.getElementById("version").value);
  } else {
    str = str.replace(/%versionline%/g, "");
  }

  var minVersion = document.getElementById("ffMinVersion").value;
  str = str.replace(/%minVersionline%/g, minVersionline);
  if (minVersion && (minVersion.length > 0)) {
    str = str.replace(/%minVersion%/g, minVersion);
  } else {
    str = str.replace(/%minVersion%/g, "3.6");
  }

  var maxVersion = document.getElementById("ffMaxVersion").value;
  str = str.replace(/%maxVersionline%/g, maxVersionline);
  if (maxVersion && (maxVersion.length > 0)) {
    str = str.replace(/%maxVersion%/g, maxVersion);
  } else {
    str = str.replace(/%maxVersion%/g, "*");
  }

  var description = document.getElementById("description").value;
  if (description && (description.length > 0)) {
    str = str.replace(/%descriptionline%/g, descriptionline);
    str = str.replace(/%description%/g, htmlEscape(document.getElementById("description").value));
  } else {
    str = str.replace(/%descriptionline%/g, "");
  }

  var creator = document.getElementById("creator").value;
  if (creator && (creator.length > 0)) {
    str = str.replace(/%creatorline%/g, creatorline);
    str = str.replace(/%creator%/g, htmlEscape(document.getElementById("creator").value));
  } else {
    str = str.replace(/%creatorline%/g, "");
  }

  var homepageURL = document.getElementById("homepageURL").value;
  if (homepageURL && (homepageURL.length > 0)) {
    str = str.replace(/%homepageURLline%/g, homepageURLline);
    str = str.replace(/%homepageURL%/g, document.getElementById("homepageURL").value);
  } else {
    str = str.replace(/%homepageURLline%/g, "");
  }

  var updateURL = document.getElementById("updateURL").value;
  if (updateURL && (updateURL.length > 0)) {
    str = str.replace(/%updateURLline%/g, updateURLline);
    str = str.replace(/%updateURL%/g, document.getElementById("updateURL").value);
  } else {
    str = str.replace(/%updateURLline%/g, "");
  }

  var updateKey = document.getElementById("updateKey").value;
  if (updateKey && (updateKey.length > 0)) {
    str = str.replace(/%updateKeyline%/g, updateKeyline);
    str = str.replace(/%updateKey%/g, document.getElementById("updateKey").value);
  } else {
    str = str.replace(/%updateKeyline%/g, "");
  }

  var iconURL = document.getElementById("iconURL").value;
  if (iconURL && (iconURL.length > 0)) {
    var sourcefile = Components.classes["@mozilla.org/file/local;1"]
                               .createInstance(Components.interfaces.nsILocalFile);
    sourcefile.initWithPath(iconURL);
    str = str.replace(/%iconURLline%/g, iconURLline);
    str = str.replace(/%iconURL%/g, sourcefile.leafName);
  } else {
    str = str.replace(/%iconURLline%/g, "");
  }

  if (document.getElementById("hidden").checked) {
    str = str.replace(/%lockedline%/g, lockedline);
    str = str.replace(/%hiddenline%/g, hiddenline);
  } else {
    str = str.replace(/%hiddenline%/g, "");
    str = str.replace(/%lockedline%/g, "");
  }

  if (document.getElementById("appManaged").checked) {
    str = str.replace(/%appManagedline%/g, appManagedline);
  } else {
    str = str.replace(/%appManagedline%/g, "");
  }

  cos.writeString(str);
  cos.close();
  fos.close();
}

function CCKWriteChromeManifest(destdir, uuid)
{
  var disableAboutConfig1 =     "overlay   chrome://global/content/config.xul    chrome://cck-%OrganizationName%/content/cck-config.xul";
  var disableAboutConfig2 =     "overlay   about:config    chrome://cck-%OrganizationName%/content/cck-config.xul";

  var file = destdir.clone();

  file.append("chrome.manifest");
  try {
    file.remove(false);
  } catch (ex) {
  }
  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
  var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterOutputStream);

  fos.init(file, -1, -1, false);
  cos.init(fos, null, 0, null);

  var ioService=Components.classes["@mozilla.org/network/io-service;1"]
    .getService(Components.interfaces.nsIIOService);
  var scriptableStream=Components
    .classes["@mozilla.org/scriptableinputstream;1"]
    .getService(Components.interfaces.nsIScriptableInputStream);

  var channel=ioService.newChannel("chrome://cckwizard/content/srcfiles/chrome.manifest.in",null,null);
  var input=channel.open();
  scriptableStream.init(input);
  var str=scriptableStream.read(input.available());
  scriptableStream.close();
  input.close();

  if (document.getElementById("noaboutconfig").checked) {
    str = str.replace(/%disableAboutConfig1%/g, disableAboutConfig1);
    str = str.replace(/%disableAboutConfig2%/g, disableAboutConfig2);
  } else {
    str = str.replace(/%disableAboutConfig1%/g, "");
    str = str.replace(/%disableAboutConfig2%/g, "");
  }

  var organizationName = document.getElementById("OrganizationName").value
  str = str.replace(/%OrganizationName%/g, organizationName);
  str = str.replace(/%OrganizationNameNoDashes%/g, organizationName.replace('-','_'));
  str = str.replace(/%uuid%/g, uuid);

  cos.writeString(str);
  cos.close();
  fos.close();
}

/* This function copies a source file to a destination directory, including */
/* deleting the file at the destination if it exists */

function CCKCopyFile(source, destination)
{
  if (source.length == 0)
    return false;

  var sourcefile = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);
  sourcefile.initWithPath(source);

  var destfile = destination.clone();
  destfile.append(sourcefile.leafName);

  try {
    destfile.remove(false);
  } catch (ex) {}

  try {
    sourcefile.copyTo(destination, "");
  } catch (ex) {
      var bundle = document.getElementById("bundle_cckwizard");
      var consoleService = Components.classes["@mozilla.org/consoleservice;1"]
                                     .getService(Components.interfaces.nsIConsoleService);
      consoleService.logStringMessage(bundle.getString("windowTitle") + ": " + ex + "\n\nSource: " +  source + "\n\nDestination: " + destination.path );
      throw("Stopping Javascript execution");
  }

  return true;
}


function ShowConfigInfo()
{
  window.openDialog("chrome://cckwizard/content/showconfig.xul","showconfig","chrome,centerscreen,modal");
}

function InitConfigInfo()
{
  var file = Components.classes["@mozilla.org/file/local;1"]
                          .createInstance(Components.interfaces.nsILocalFile);
  file.initWithPath(this.opener.currentconfigpath);

  file.append("cck.config");

  if (!file.exists())
    return;

  var stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                         .createInstance(Components.interfaces.nsIFileInputStream);

  stream.init(file, 0x01, 0644, 0);

  var lis = stream.QueryInterface(Components.interfaces.nsILineInputStream);
  var line = {value:null};

  var box = document.getElementById("showconfigy");

  do {
    var more = lis.readLine(line);
    var str = line.value;
    box.value += str;
    box.value += "\n";
  } while (more);

  stream.close();
}



function CCKWriteConfigFile(destdir)
{
  var file = destdir.clone();
  if (!file.exists()) {
        var bundle = document.getElementById("bundle_cckwizard");
        var button = gPromptService.confirmEx(window, bundle.getString("windowTitle"), bundle.getString("createDir").replace(/%S/g, file.path),
                                              gPromptService.BUTTON_TITLE_YES * gPromptService.BUTTON_POS_0 +
                                              gPromptService.BUTTON_TITLE_NO * gPromptService.BUTTON_POS_1,
                                              null, null, null, null, {});
        if (button == 0) {
          try {
            file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
          } catch (ex) {
            gPromptService.alert(window, bundle.getString("windowTitle"),
                                 bundle.getString("createDirError").replace(/%S/g, file.path));
            return;
          }
        } else {
          return;
        }
  }
  file.append("cck.config");

  var fos = Components.classes["@mozilla.org/network/file-output-stream;1"]
                       .createInstance(Components.interfaces.nsIFileOutputStream);
  var cos = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterOutputStream);

  fos.init(file, -1, -1, false);
  cos.init(fos, null, 0, null);

  var elements = document.getElementsByAttribute("id", "*")
  for (var i=0; i < elements.length; i++) {
    if ( (elements[i].nodeName == "textbox") ||
         (elements[i].id == "RootKey1") ||
         (elements[i].id == "Type1") ||
         (elements[i].id == "ffMinVersion") ||
         (elements[i].id == "ffMaxVersion") )
    {
      if (elements[i].id != "saveOnExit") {
        if (elements[i].value.length > 0) {
          var line = elements[i].getAttribute("id") + "=" + elements[i].value + "\n";
          cos.writeString(line);
        }
      }
    }
    else if (elements[i].nodeName == "radiogroup") {
        if (elements[i].value.length > 0) {
          var line = elements[i].getAttribute("id") + "=" + elements[i].value + "\n";
          cos.writeString(line);
        }
    }
    else if (elements[i].nodeName == "checkbox") {
      if (elements[i].id != "saveOnExit") {
        if (elements[i].checked) {
          var line = elements[i].getAttribute("id") + "=" + elements[i].checked + "\n";
          cos.writeString(line);
        }
      }
    }
    else if (elements[i].id == "prefList") {
      var listbox = document.getElementById('prefList');
      for (var j=0; j < listbox.getRowCount(); j++) {
        var listitem = listbox.getItemAtIndex(j);
        var line = "PreferenceName" + (j+1) + "=" + listitem.getAttribute("label") + "\n";
        cos.writeString(line);
        if (listitem.getAttribute("value").length) {
          var line = "PreferenceValue" + (j+1) + "=" + listitem.getAttribute("value") + "\n";
          cos.writeString(line);
        }
	    if (listitem.cck['type'].length > 0) {
          var line = "PreferenceType" + (j+1) + "=" + listitem.cck['type'] + "\n";
          cos.writeString(line);
	    }
	    if (listitem.cck['lock'].length > 0) {
          var line = "PreferenceLock" + (j+1) + "=" + listitem.cck['lock'] + "\n";
          cos.writeString(line);
	    }
      }
    }
    else if (elements[i].id == "browserPluginList") {
      listbox = document.getElementById('browserPluginList');
      for (var j=0; j < listbox.getRowCount(); j++) {
        listitem = listbox.getItemAtIndex(j);
        var line = "BrowserPluginPath" + (j+1) + "=" + listitem.getAttribute("label") + "\n";
        cos.writeString(line);
        if (listitem.getAttribute("value")) {
          var line = "BrowserPluginType" + (j+1) + "=" + listitem.getAttribute("value") + "\n";
          cos.writeString(line);
	    }
      }
    }
    else if (elements[i].id == "tbFolder.bookmarkList") {
      listbox = document.getElementById('tbFolder.bookmarkList');
      for (var j=0; j < listbox.getRowCount(); j++) {
        listitem = listbox.getItemAtIndex(j);
        var line = "ToolbarFolder1.BookmarkTitle" + (j+1) + "=" + listitem.getAttribute("label") + "\n";
        cos.writeString(line);
        if (listitem.getAttribute("value")) {
          var line = "ToolbarFolder1.BookmarkURL" + (j+1) + "=" + listitem.getAttribute("value") + "\n";
          cos.writeString(line);
	    }
	    if (listitem.cck['type'].length > 0) {
          var line = "ToolbarFolder1.BookmarkType" + (j+1) + "=" + listitem.cck['type'] + "\n";
          cos.writeString(line);
	    }
      }
    }
    else if (elements[i].id == "tb.bookmarkList") {
      listbox = document.getElementById('tb.bookmarkList');
      for (var j=0; j < listbox.getRowCount(); j++) {
        listitem = listbox.getItemAtIndex(j);
        var line = "ToolbarBookmarkTitle" + (j+1) + "=" + listitem.getAttribute("label") + "\n";
        cos.writeString(line);
	    if (listitem.getAttribute("value")) {
          var line = "ToolbarBookmarkURL" + (j+1) + "=" + listitem.getAttribute("value") + "\n";
          cos.writeString(line);
	    }
	    if (listitem.cck['type'].length > 0) {
	      var line = "ToolbarBookmarkType" + (j+1) + "=" + listitem.cck['type'] + "\n";
          cos.writeString(line);
	    }
      }
    }
    else if (elements[i].id == "bmFolder.bookmarkList") {
      listbox = document.getElementById('bmFolder.bookmarkList');
      for (var j=0; j < listbox.getRowCount(); j++) {
        listitem = listbox.getItemAtIndex(j);
        var line = "BookmarkFolder1.BookmarkTitle" + (j+1) + "=" + listitem.getAttribute("label") + "\n";
        cos.writeString(line);
	    if (listitem.getAttribute("value")) {
          var line = "BookmarkFolder1.BookmarkURL" + (j+1) + "=" + listitem.getAttribute("value") + "\n";
          cos.writeString(line);
	    }
	    if (listitem.cck['type'].length > 0) {
          var line = "BookmarkFolder1.BookmarkType" + (j+1) + "=" + listitem.cck['type'] + "\n";
          cos.writeString(line);
	    }
      }
    }
    else if (elements[i].id == "bm.bookmarkList") {
      listbox = document.getElementById('bm.bookmarkList');
      for (var j=0; j < listbox.getRowCount(); j++) {
        listitem = listbox.getItemAtIndex(j);
        var line = "BookmarkTitle" + (j+1) + "=" + listitem.getAttribute("label") + "\n";
        cos.writeString(line);
	    if (listitem.getAttribute("value")) {
          var line = "BookmarkURL" + (j+1) + "=" + listitem.getAttribute("value") + "\n";
          cos.writeString(line);
	    }
	    if (listitem.cck['type'].length > 0) {
          var line = "BookmarkType" + (j+1) + "=" + listitem.cck['type'] + "\n";
          cos.writeString(line);
	    }
      }
    }
    else if (elements[i].id == "regList") {
      listbox = document.getElementById('regList');
      for (var j=0; j < listbox.getRowCount(); j++) {
        listitem = listbox.getItemAtIndex(j);
        var line = "RegName" + (j+1) + "=" + listitem.getAttribute("label") + "\n";
        cos.writeString(line);
        var line = "RootKey" + (j+1) + "=" + listitem.cck['rootkey'] + "\n";
        cos.writeString(line);
        var line = "Key" + (j+1) + "=" + listitem.cck['key'] + "\n";
        cos.writeString(line);
        var line = "Name" + (j+1) + "=" + listitem.cck['name'] + "\n";
        cos.writeString(line);
        var line = "NameValue" + (j+1) + "=" + listitem.cck['namevalue'] + "\n";
        cos.writeString(line);
        var line = "Type" + (j+1) + "=" + listitem.cck['type'] + "\n";
        cos.writeString(line);
      }
    }
    else if (elements[i].id == "searchEngineList") {
      listbox = document.getElementById('searchEngineList');
      for (var j=0; j < listbox.getRowCount(); j++) {
        listitem = listbox.getItemAtIndex(j);
        var line = "SearchEngine" + (j+1) + "=" + listitem.cck['engineurl'] + "\n";
        cos.writeString(line);
        var line = "SearchEngineIcon" + (j+1) + "=" + listitem.cck['iconurl'] + "\n";
        cos.writeString(line);
      }
    }
    else if (elements[i].id == "bundleList") {
      listbox = document.getElementById('bundleList')
      for (var j=0; j < listbox.getRowCount(); j++) {
        listitem = listbox.getItemAtIndex(j);
        var line = "BundlePath" + (j+1) + "=" + listitem.getAttribute("label") + "\n";
        cos.writeString(line);
      }
    }
    else if (elements[i].id == "certList") {
      listbox = document.getElementById('certList')
      for (var j=0; j < listbox.getRowCount(); j++) {
        listitem = listbox.getItemAtIndex(j);
        var line = "CertPath" + (j+1) + "=" + listitem.getAttribute("label") + "\n";
        cos.writeString(line);
        var line = "CertTrust" + (j+1) + "=" + listitem.getAttribute("value") + "\n";
        cos.writeString(line);
      }
    }
    else if (elements[i].id == "defaultSearchEngine") {
      if (elements[i].selectedItem) {
        if (elements[i].selectedItem.value) {
          var line = "DefaultSearchEngine=" + elements[i].selectedItem.value + "\n";
          cos.writeString(line);
        }
      }
      else {
      	var line = "DefaultSearchEngine=" + elements[i].value + "\n";
        cos.writeString(line);
      }
    }
  }

  cos.close();
  fos.close();
}

function CCKReadConfigFile(srcdir)
{
  var file = srcdir.clone();
  file.append("cck.config");

  if (!file.exists()) {
    DoEnabling();
    toggleProxySettings();
    return;
  }

  var stream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                         .createInstance(Components.interfaces.nsIFileInputStream);
  var cis = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                      .createInstance(Components.interfaces.nsIConverterInputStream);


  stream.init(file, 0x01, 0644, 0);
  cis.init(stream,  null, 1024, Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER);
  var lis = cis.QueryInterface(Components.interfaces.nsIUnicharLineInputStream);
  var line = {value:null};

  var configarray = new Array();
  do {
    var more = lis.readLine(line);
    var str = line.value;
    var equals = str.indexOf('=');
    if (equals != -1) {
      var firstpart = str.substring(0,equals);
      var secondpart = str.substring(equals+1);
	  switch (firstpart) {
		case"HTTPproxyname":
		  firstpart = "networkProxyHTTP";
		  break;
		case"HTTPportno":
		  firstpart = "networkProxyHTTP_Port";
		  break;
		case"SSLproxyname":
		  firstpart = "networkProxySSL";
		  break;
		case"SSLportno":
		  firstpart = "networkProxySSL_Port";
		  break;
		case"FTPproxyname":
		  firstpart = "networkProxyFTP";
		  break;
		case"FTPportno":
		  firstpart = "networkProxyFTP_Port";
		  break;
		case"SOCKShostname":
		  firstpart = "networkProxySOCKS";
		  break;
		case"SOCKSportno":
		  firstpart = "networkProxySOCKS_Port";
		  break;
		case"socksv":
		  firstpart = "networkProxySOCKSVersion";
		  break;
		case"NoProxyname":
		  firstpart = "networkProxyNone";
		  break;
		case "ProxyType":
		  firstpart = "networkProxyType";
		  switch (secondpart) {
			case "5":
			  secondpart = "10";
			  break;
		  }
		  break;
	  }
      configarray[firstpart] = secondpart;
      try {
        (document.getElementById(firstpart).value = secondpart)
      } catch (ex) {}
    }
  } while (more);

  // handle prefs
  var listbox = document.getElementById('prefList');
  listbox.clear();

  var i = 1;
  var prefname;
  while ((prefname = configarray['PreferenceName' + i])) {
    /* Old config file - figure out pref type */
    if (!(configarray['PreferenceType' + i])) {
      /* We're going to use this a lot */
      var value = configarray['PreferenceValue' + i];
      if ((value.toLowerCase() == "true") || (value.toLowerCase() == "false")) {
        configarray['PreferenceType' + i] = "boolean";
        value = value.toLowerCase();
      } else if (parseInt(value) == value) {
        configarray['PreferenceType' + i] = "integer";
      } else {
        /* Remove opening and closing quotes if they exist */
        configarray['PreferenceType' + i] = "string";
        if (value.charAt(0) == '"')
          value = value.substring(1,value.length);
        if (value.charAt(value.length-1) == '"')
          if (value.charAt(value.length-2) != '\\')
            value = value.substring(0,value.length-1);
      }
      configarray['PreferenceValue' + i] = value;
    }
    if (configarray['PreferenceValue' + i]) {
      listitem = listbox.appendItem(prefname, configarray['PreferenceValue' + i]);
    } else {
      listitem = listbox.appendItem(prefname, "");
    }

    if (configarray['PreferenceLock' + i] == "true") {
      listitem.cck['lock'] = "true";
    } else {
      listitem.cck['lock'] = "";
    }
    listitem.cck['type'] = configarray['PreferenceType' + i];
    i++;
  }

  // handle plugins
  listbox = document.getElementById('browserPluginList');
  listbox.clear();


  var i = 1;
  var pluginname;
  while ((pluginname = configarray['BrowserPluginPath' + i])) {
    if (configarray['BrowserPluginType' + i]) {
      listbox.appendItem(pluginname, configarray['BrowserPluginType' + i]);
    } else {
      listbox.appendItem(pluginname, null);
    }
    i++;
  }

  // handle toolbar folder with bookmarks
  listbox = document.getElementById('tbFolder.bookmarkList');
  listbox.clear();

  var i = 1;
  while ((name = configarray['ToolbarFolder1.BookmarkTitle' + i])) {
    if (configarray['ToolbarFolder1.BookmarkType' + i] == "separator") {
      listitem = listbox.appendItem("----------", "");
    } else {
      listitem = listbox.appendItem(name, configarray['ToolbarFolder1.BookmarkURL' + i]);
    }
    listitem.setAttribute("class", "listitem-iconic");
    if (configarray['ToolbarFolder1.BookmarkType' + i] == "live") {
      listitem.cck['type'] = "live";
      listitem.setAttribute("image", "chrome://browser/skin/page-livemarks.png");
    } else if (configarray['ToolbarFolder1.BookmarkType' + i] == "separator") {
      listitem.cck['type'] = "separator";
      listitem.setAttribute("image", "");
    } else {
      listitem.cck['type'] = "";
      listitem.setAttribute("image", "chrome://browser/skin/Bookmarks-folder.png");
    }
    i++;
  }
  // handle toolbar bookmarks
  listbox = document.getElementById('tb.bookmarkList');
  listbox.clear();

  var i = 1;
  while ((name = configarray['ToolbarBookmarkTitle' + i])) {
    if (configarray['ToolbarBookmarkType' + i] == "separator") {
      listitem = listbox.appendItem("----------", "");
    } else {
      listitem = listbox.appendItem(name, configarray['ToolbarBookmarkURL' + i]);
    }
    listitem.setAttribute("class", "listitem-iconic");
    if (configarray['ToolbarBookmarkType' + i] == "live") {
      listitem.cck['type'] = "live";
      listitem.setAttribute("image", "chrome://browser/skin/page-livemarks.png");
    } else if (configarray['ToolbarBookmarkType' + i] == "separator") {
      listitem.cck['type'] = "separator";
      listitem.setAttribute("image", "");
    } else {
      listitem.cck['type'] = "";
      listitem.setAttribute("image", "chrome://browser/skin/Bookmarks-folder.png");
    }
    i++;
  }

  // handle folder with bookmarks
  listbox = document.getElementById('bmFolder.bookmarkList');
  listbox.clear();

  var i = 1;
  while ((name = configarray['BookmarkFolder1.BookmarkTitle' + i])) {
    if (configarray['BookmarkFolder1.BookmarkType' + i] == "separator") {
      listitem = listbox.appendItem("----------", "");
    } else {
      listitem = listbox.appendItem(name, configarray['BookmarkFolder1.BookmarkURL' + i]);
    }
    listitem.setAttribute("class", "listitem-iconic");
    if (configarray['BookmarkFolder1.BookmarkType' + i] == "live") {
      listitem.cck['type'] = "live";
      listitem.setAttribute("image", "chrome://browser/skin/page-livemarks.png");
    } else if (configarray['BookmarkFolder1.BookmarkType' + i] == "separator") {
      listitem.cck['type'] = "separator";
      listitem.setAttribute("image", "");
    } else {
      listitem.cck['type'] = "";
      listitem.setAttribute("image", "chrome://browser/skin/Bookmarks-folder.png");
    }
    i++;
  }
  // handle bookmarks
  listbox = document.getElementById('bm.bookmarkList');
  listbox.clear();

  var i = 1;
  while ((name = configarray['BookmarkTitle' + i])) {
    if (configarray['BookmarkType' + i] == "separator") {
      listitem = listbox.appendItem("----------", "");
    } else {
      listitem = listbox.appendItem(name, configarray['BookmarkURL' + i]);
    }
    listitem.setAttribute("class", "listitem-iconic");
    if (configarray['BookmarkType' + i] == "live") {
      listitem.cck['type'] = "live";
      listitem.setAttribute("image", "chrome://browser/skin/page-livemarks.png");
    } else if (configarray['BookmarkType' + i] == "separator") {
      listitem.cck['type'] = "separator";
      listitem.setAttribute("image", "");
    } else {
      listitem.cck['type'] = "";
      listitem.setAttribute("image", "chrome://browser/skin/Bookmarks-folder.png");
    }
    i++;
  }




  // handle registry items
  listbox = document.getElementById('regList');
  listbox.clear();

  var i = 1;
  var regname;
  while ((regname = configarray['RegName' + i])) {
    var listitem = listbox.appendItem(regname, "");
    listitem.cck['rootkey'] = configarray['RootKey' + i];
    listitem.cck['key'] = configarray['Key' + i];
    listitem.cck['name'] = configarray['Name' + i];
    listitem.cck['namevalue'] = configarray['NameValue' + i];
    listitem.cck['type'] = configarray['Type' + i];
    i++;
  }

  // cert list
  listbox = document.getElementById('certList');
  listbox.clear();

  var i = 1;
  var certpath;
  while ((certpath = configarray['CertPath' + i])) {
    var listitem;
    if (configarray['CertTrust' + i]) {
      listitem = listbox.appendItem(certpath, configarray['CertTrust' + i]);
    } else {
      listitem = listbox.appendItem(certpath, "C,C,C");
    }
    i++;
  }

  // bundle list
  listbox = document.getElementById('bundleList');
  listbox.clear();

  var i = 1;
  var bundlepath;
  while ((bundlepath = configarray['BundlePath' + i])) {
    var listitem = listbox.appendItem(bundlepath, "");
    i++;
  }

  var sourcefile = Components.classes["@mozilla.org/file/local;1"]
                       .createInstance(Components.interfaces.nsILocalFile);

  // handle searchengines
  listbox = document.getElementById('searchEngineList');
  listbox.clear();

  var menulist = document.getElementById('defaultSearchEngine')
  menulist.selectedIndex = -1;
  menulist.removeAllItems();

  /* I changed the name from SearchPlugin to SearchEngine. */
  /* This code is to support old config files */
  var searchname = "SearchEngine";
  if  (configarray['SearchPlugin1']) {
    searchname = "SearchPlugin";
  }

  var i = 1;
  var searchengineurl;
  while ((searchengineurl = configarray[searchname + i])) {
    name = getSearchEngineName(searchengineurl);
    listitem = listbox.appendItem(name, "");
    listitem.setAttribute("class", "listitem-iconic");
    if (configarray[searchname + 'Icon' + i].length > 0) {
      try {
        sourcefile.initWithPath(configarray[searchname + 'Icon' + i]);
        var ioServ = Components.classes["@mozilla.org/network/io-service;1"]
                               .getService(Components.interfaces.nsIIOService);
        var imgfile = ioServ.newFileURI(sourcefile);
        listitem.setAttribute("image", imgfile.spec);
      } catch (e) {
      }
    } else {
      listitem.setAttribute("image", getSearchEngineImage(searchengineurl));
    }
    listitem.cck['name'] = name;
    listitem.cck['engineurl'] = searchengineurl;
    listitem.cck['iconurl'] = configarray[searchname + 'Icon' + i];
    i++;
  }

  RefreshDefaultSearchEngines();

  if (configarray["DefaultSearchEngine"]) {
    menulist.value = configarray["DefaultSearchEngine"];
  }

  var hidden = document.getElementById("hidden");
  hidden.checked = configarray["hidden"];

  var appManaged = document.getElementById("appManaged");
  appManaged.checked = configarray["appManaged"];

  var aboutconfig = document.getElementById("noaboutconfig");
  aboutconfig.checked = configarray["noaboutconfig"];

  var noWelcomePage = document.getElementById("noWelcomePage");
  noWelcomePage.checked = configarray["noWelcomePage"];

  var noOverridePage = document.getElementById("noOverridePage");
  noOverridePage.checked = configarray["noOverridePage"];

  var tabsonbottom = document.getElementById("tabsonbottom");
  tabsonbottom.checked = configarray["tabsonbottom"];

  var bookmarksbar = document.getElementById("bookmarksbar");
  bookmarksbar.checked = configarray["bookmarksbar"];

  var menubar = document.getElementById("menubar");
  menubar.checked = configarray["menubar"];

  var addonbar = document.getElementById("addonbar");
  addonbar.checked = configarray["addonbar"];


  var proxyitem = document.getElementById("shareAllProxies");
  proxyitem.checked = configarray["shareAllProxies"];

  var item = document.getElementById("ToolbarLocation");
  if (configarray["ToolbarLocation"]) {
    item.value = configarray["ToolbarLocation"];
  } else {
    item.value = "Last";
  }

  var item = document.getElementById("BookmarkLocation");
  if (configarray["BookmarkLocation"]) {
    item.value = configarray["BookmarkLocation"];
  } else {
    item.value = "Last";
  }

  DoEnabling();
  toggleProxySettings();

  stream.close();
}

function Validate(field, message)
{
  var gIDTest = /^(\{[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\}|[a-z0-9-\._]*\@[a-z0-9-\._]+)$/i;

  for (var i=0; i < arguments.length; i++) {
    /* special case ID */
    if (document.getElementById(arguments[i]).id == "id") {
      if (!gIDTest.test(document.getElementById(arguments[i]).value)) {
        var bundle = document.getElementById("bundle_cckwizard");
        gPromptService.alert(window, bundle.getString("windowTitle"), bundle.getString(arguments[i] + ".error"));
        return false;
      }
    } else {
      if (document.getElementById(arguments[i]).value == '') {
        var bundle = document.getElementById("bundle_cckwizard");
        gPromptService.alert(window, bundle.getString("windowTitle"), bundle.getString(arguments[i] + ".error"));
        return false;
      }
    }
  }
  return true;
}

function ValidateNoSpace(field, message)
{
  var alphaExp = /^[0-9a-zA-Z\-\_]+$/;
  for (var i=0; i < arguments.length; i++) {
    var str = document.getElementById(arguments[i]).value;
	if (!alphaExp.test(str)) {
      var bundle = document.getElementById("bundle_cckwizard");
      gPromptService.alert(window, bundle.getString("windowTitle"), bundle.getString(arguments[i] + ".error"));
      return false;
    }
  }
  return true;
}


function ValidateFile()
{
  for (var i=0; i < arguments.length; i++) {
    var filename = document.getElementById(arguments[i]).value;
    if (filename.length > 0) {
      var file = Components.classes["@mozilla.org/file/local;1"]
                           .createInstance(Components.interfaces.nsILocalFile);
      try {
        file.initWithPath(filename);
      } catch (e) {
        gPromptService.alert(window, "", "File " + filename + " not found");
        return false;
      }
      if (!file.exists() || file.isDirectory()) {
        gPromptService.alert(window, "", "File " + filename + " not found");
        return false;
      }
    }
  }
  return true;
}

function ValidateDir()
{
  for (var i=0; i < arguments.length; i++) {
    var filename = document.getElementById(arguments[i]).value;
    if (filename.length > 0) {
      var file = Components.classes["@mozilla.org/file/local;1"]
                           .createInstance(Components.interfaces.nsILocalFile);
      try {
        file.initWithPath(filename);
      } catch (e) {
        gPromptService.alert(window, "", "Directory " + filename + " not found");
        return false;
      }
      if (!file.exists()) {
        var bundle = document.getElementById("bundle_cckwizard");
        var button = gPromptService.confirmEx(window, bundle.getString("windowTitle"), bundle.getString("createDir").replace(/%S/g, filename),
                                              gPromptService.BUTTON_TITLE_YES * gPromptService.BUTTON_POS_0 +
                                              gPromptService.BUTTON_TITLE_NO * gPromptService.BUTTON_POS_1,
                                              null, null, null, null, {});
        if (button == 0) {
          try {
            file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0775);
          } catch (ex) {
            gPromptService.alert(window, bundle.getString("windowTitle"),
                                 bundle.getString("createDirError").replace(/%S/g, filename));
            return false;
          }
        }
      } else if (!file.isDirectory()) {
        gPromptService.alert(window, "", "Directory " + filename + " not found");
        return false;
      }
    }
  }
  return true;
}

function toggleProxySettings()
{
  var http = document.getElementById("networkProxyHTTP");
  var httpPort = document.getElementById("networkProxyHTTP_Port");
  var ftp = document.getElementById("networkProxyFTP");
  var ftpPort = document.getElementById("networkProxyFTP_Port");
  var socks = document.getElementById("networkProxySOCKS");
  var socksPort = document.getElementById("networkProxySOCKS_Port");
  var socksVersion = document.getElementById("networkProxySOCKSVersion");
  var socksVersion4 = document.getElementById("networkProxySOCKSVersion4");
  var socksVersion5 = document.getElementById("networkProxySOCKSVersion5");
  var ssl = document.getElementById("networkProxySSL");
  var sslPort = document.getElementById("networkProxySSL_Port");

  // arrays
  var urls = [ftp,ssl];
  var ports = [ftpPort,sslPort];
  var allFields = [ftp,ssl,ftpPort,sslPort,socks,socksPort,socksVersion,socksVersion4,socksVersion5];

  var i;
  if ((document.getElementById("shareAllProxies").checked) || document.getElementById("networkProxyType").value != "1") {
    for (i = 0; i < allFields.length; i++)
      allFields[i].setAttribute("disabled", "true");
  } else {
    for (i = 0; i < allFields.length; i++) {
      allFields[i].removeAttribute("disabled");
    }
  }
}

function DoEnabling()
{
  var i;
  var shareAllProxies = document.getElementById("shareAllProxies");

  // convenience arrays
  var manual = ["networkProxyHTTP", "networkProxyHTTP_Port",
				"networkProxySSL", "networkProxyFTP",
				"networkProxySOCKS", "networkProxySSL_Port",
				"networkProxyFTP_Port",
				"networkProxySOCKS_Port", "networkProxySOCKSVersion4",
				"networkProxySOCKSVersion5",
				 "networkProxyNone", "shareAllProxies"];

  var manual2 = ["networkProxyHTTP", "networkProxyHTTP_Port", "networkProxyNone", "shareAllProxies"];
  var auto = ["networkProxyAutoconfigURL"];
  var file = ["autoproxyfile", "autoproxyfilebutton"];

  // radio buttons
  var radiogroup = document.getElementById("networkProxyType");
  if (radiogroup.value == "")
    radiogroup.value = "0";

  switch ( radiogroup.value ) {
    case "0":
    case "4":
    case "5":
      for (i = 0; i < manual.length; i++) {
		updateControl(manual[i], true);
	  }
      for (i = 0; i < auto.length; i++)
  	    updateControl(auto[i], true);
      break;
      for (i = 0; i < file.length; i++)
  	    updateControl(file[i], true);
      break;
    case "1":
      for (i = 0; i < auto.length; i++)
  	    updateControl(auto[i], true);
      for (i = 0; i < file.length; i++)
  	    updateControl(file[i], true);
      if (!radiogroup.disabled && !shareAllProxies.checked) {
        for (i = 0; i < manual.length; i++) {
  		  updateControl(manual[i], false);
        }
      } else {
        for (i = 0; i < manual.length; i++)
		  updateControl(manual[i], true);
        for (i = 0; i < manual2.length; i++) {
		  updateControl(manual2[i], false);
        }
      }
      break;
    case "10":
      for (i = 0; i < auto.length; i++)
  	    updateControl(auto[i], true);
      for (i = 0; i < manual.length; i++)
		updateControl(manual[i], true);
      if (!radiogroup.disabled)
        for (i = 0; i < file.length; i++)
  	      updateControl(file[i], false);
      break;
    case "2":
    default:
      for (i = 0; i < manual.length; i++)
		updateControl(manual[i], true);
      for (i = 0; i < file.length; i++)
  	    updateControl(file[i], true);
      if (!radiogroup.disabled)
        for (i = 0; i < auto.length; i++)
  	    updateControl(auto[i], false);
      break;
  }
}

function updateControl(id, disabled) {
  var control = document.getElementById(id);
  control.disabled = disabled;
  var labels = document.getElementsByAttribute("control", id);
  if (labels.length > 0)
    labels[0].disabled = disabled;
}

function updateProtocols(share) {
  var shared = ["networkProxySSL", "networkProxyFTP",
				"networkProxySOCKS"]
  var shared_ports = ["networkProxySSL_Port",
				"networkProxyFTP_Port",
				"networkProxySOCKS_Port"]
  var shared_other = ["networkProxySOCKSVersion4",
				"networkProxySOCKSVersion5"];

  for (i = 0; i < shared.length; i++)
    updateControl(shared[i], share.checked);
  for (i = 0; i < shared_ports.length; i++)
    updateControl(shared_ports[i], share.checked);
  for (i = 0; i < shared_other.length; i++)
    updateControl(shared_other[i], share.checked);
  if (share.checked) {
	var ProxyHTTP = document.getElementById("networkProxyHTTP").value;
	var ProxyHTTP_Port = document.getElementById("networkProxyHTTP_Port").value;
    for (i = 0; i < shared.length; i++) {
	  var control = document.getElementById(shared[i]);
	  control.backup = control.value;
	  control.value = ProxyHTTP;
    }
    for (i = 0; i < shared_ports.length; i++) {
	  var control = document.getElementById(shared_ports[i]);
	  control.backup = control.value;
	  control.value = ProxyHTTP_Port;
    }
  } else {
    for (i = 0; i < shared.length; i++) {
	  var control = document.getElementById(shared[i]);
	  if (control.backup) {
  	    control.value = control.backup;
	  } else {
		control.value = "";
	  }
    }
    for (i = 0; i < shared_ports.length; i++) {
	  var control = document.getElementById(shared_ports[i]);
	  if (control.backup) {
  	    control.value = control.backup;
	  } else {
		control.value = 0;
	  }
    }
  }
}

function htmlEscape(s)
{
  s=s.replace(/&/g,'&amp;');
  s=s.replace(/>/g,'&gt;');
  s=s.replace(/</g,'&lt;');
  s=s.replace(/"/g, '&quot;');
  return s;
}

