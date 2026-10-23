// LOOM [LIST|STATUS|HELP|UPDATES [AUTO on/off]|PAUSE on/off|DEBUG on/off|ROOM|LINKS|LINK <id> [on/off]|THEME [<city>|auto|off]|PERF [<seconds>|STOP|DATA]]
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.loom) client.loom.loom = {};

var raw = String(args[1] || "").trim();
var parts = raw.split(/\s+/);
var sub = String(parts[0] || "").toLowerCase();
var val = String(parts[1] || "").toLowerCase();
var C = "cyan";

if (sub === "" || sub === "list" || sub === "status") {
  // The package list prints in a monospace block through
  // nexusclient.add_html_line when this Nexus has it, so the columns line
  // up; otherwise as plain notices.
  var reg = client.loom.registry;
  // Only what is really installed (a package uninstalled before #137 kept
  // its registry entry until the next load), and retired ones named apart below.
  var lpL = client.loom.loom || {};
  var names = lpL.installed ? lpL.installed() : Object.keys(reg).sort();
  var html = (typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function");
  var esc = function (t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
  var rows = [];
  display_notice("[loom] " + names.length + " package" + (names.length == 1 ? "" : "s") + " loaded", C);
  for (var i = 0; i < names.length; i++) {
    var r = reg[names[i]] || {};
    var label = (names[i] + "                ").slice(0, 16);
    var ver = "v" + (r.version || "?");
    // The description, when the package has one, on its own dimmer line.
    // (An unbuilt package would still hold the placeholder, "{{" then
    // "description"; tested with a pattern so the build doesn't fill it in.)
    var desc = (r.desc && !/^\{\{/.test(r.desc)) ? r.desc : "";
    // Name and version, the description below. Indented with non-breaking
    // spaces: Nexus trims ordinary spaces at the start of an HTML line.
    if (html) {
      rows.push('&nbsp;&nbsp;<span style="color:#00ffff">' + esc(label) + '</span><span style="color:#9fc9c9">' + esc(ver) + '</span>');
      if (desc) rows.push('&nbsp;&nbsp;&nbsp;&nbsp;<span style="color:#6f8f8f">' + esc(desc) + '</span>');
    } else {
      display_notice("  " + label + ver, C);
      if (desc) display_notice("    " + desc, "#6f8f8f");
    }
  }
  if (html && rows.length) nexusclient.add_html_line('<span style="font-family:\'Courier New\',monospace;white-space:pre">' + rows.join("\n") + '</span>');
  var lpOld = lpL.retiredHere ? lpL.retiredHere() : [];
  for (var lpI = 0; lpI < lpOld.length; lpI++) {
    display_notice("[loom] " + lpOld[lpI].name + " is retired: uninstall it" + (lpOld[lpI].by ? " (" + lpOld[lpI].by + " replaces it)" : "") + ".", "orange");
  }
  display_notice("[loom] pause " + (get_variable("pauseTriggers") || "off") + ", debug " + (get_variable("debug") || "off") + ". LOOM HELP for commands.", C);
} else if (sub === "updates") {
  // LOOM UPDATES: check now. LOOM UPDATES AUTO ON|OFF: the check at login.
  if (val === "auto") {
    var luAuto = String(parts[2] || "").toLowerCase();
    if (luAuto === "on" || luAuto === "off") set_variable("loom_autoupdates", luAuto);
    display_notice("[loom] version check at login is " + (get_variable("loom_autoupdates") || "on") + ".", (luAuto === "on" || luAuto === "off") ? "lime" : C);
  } else {
    set_variable("loom_updates_mode", "manual");
    run_function("loom_updates", [], "loom");
  }
} else if (sub === "links" || (sub === "link" && !val)) {
  // LOOM LINKS: every integration, its state and what it does.
  if (!client.loom.loom.addLink) run_function("loom_links", [], "loom");
  var LK = client.loom.loom;
  var lkIds = LK.linkOrder || [];
  if (!lkIds.length) {
    display_notice("[loom] no integrations yet: they arrive with Loom 0.5 and are listed here as each one lands.", C);
  } else {
    var lkHtml = (typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function");
    var lkEsc = function (t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
    var lkCol = { on: "#7fe07f", off: "#ff9f43", waiting: "#6f8f8f" };
    var lkW = 0, lkN = { on: 0, off: 0, waiting: 0 };
    for (var lkI = 0; lkI < lkIds.length; lkI++) if (lkIds[lkI].length > lkW) lkW = lkIds[lkI].length;
    var lkPad = "                                        ";
    var lkRows = [];
    for (var lkJ = 0; lkJ < lkIds.length; lkJ++) {
      var lkId = lkIds[lkJ];
      var lkE = LK.links[lkId];
      var lkSt = LK.linkState(lkId);
      lkN[lkSt]++;
      var lkMiss = LK.linkMissing(lkId);
      // The description, then why it's waiting when a package is missing.
      var lkDesc = lkE.desc + (lkSt === "waiting" || (lkSt === "off" && lkMiss.length) ? " (needs " + lkMiss.join(" and ") + ")" : "");
      var lkName = (lkId + lkPad).slice(0, lkW + 2);
      var lkStw = (lkSt + lkPad).slice(0, 9);
      if (lkHtml) {
        lkRows.push('&nbsp;&nbsp;<span style="color:#00ffff">' + lkEsc(lkName) + '</span><span style="color:' + lkCol[lkSt] + '">' + lkEsc(lkStw) + '</span><span style="color:#9fc9c9">' + lkEsc(lkDesc) + '</span>');
      } else {
        display_notice("  " + lkName + lkStw + lkDesc, lkCol[lkSt]);
      }
    }
    if (lkHtml) {
      display_notice("[loom] integrations: " + lkN.on + " on, " + lkN.off + " off, " + lkN.waiting + " waiting for a package", C);
      nexusclient.add_html_line('<span style="font-family:\'Courier New\',monospace;white-space:pre">' + lkRows.join("\n") + '</span>');
    }
    display_notice("[loom] LOOM LINK <id> ON|OFF to switch one. New integrations start on.", C);
  }
} else if (sub === "link") {
  // LOOM LINK <id> [ON|OFF]: show or switch one integration.
  if (!client.loom.loom.addLink) run_function("loom_links", [], "loom");
  var LN = client.loom.loom;
  var lnTo = String(parts[2] || "").toLowerCase();
  if (!LN.links[val]) {
    display_notice("[loom] no integration '" + val + "'. LOOM LINKS lists them.", "orange");
  } else if (lnTo !== "" && lnTo !== "on" && lnTo !== "off") {
    display_notice("[loom] usage: LOOM LINK " + val + " ON|OFF", "orange");
  } else {
    if (lnTo) LN.setLink(val, lnTo === "on");
    var lnSt = LN.linkState(val);
    var lnMiss = LN.linkMissing(val);
    var lnMsg = "[loom] " + val + " is " + (lnTo ? "now " : "") + (lnSt === "waiting" ? "on" : lnSt);
    if (lnMiss.length) lnMsg += (lnSt === "off" ? "" : ", waiting for ") + (lnSt === "off" ? " (and needs " + lnMiss.join(" and ") + ")" : lnMiss.join(" and ") + " to be installed");
    display_notice(lnMsg + ".", lnTo ? "lime" : C);
  }
} else if (sub === "theme") {
  // LOOM THEME [<city>|AUTO|OFF]: the tabs' colours (#310).
  if (!client.loom.loom.themeApply) run_function("loom_theme", [], "loom");
  var TM = client.loom.loom;
  var tmCities = Object.keys(TM.themes).sort();
  var tmCap = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };
  var tmSay = function (changed) {
    var ch = TM.themeChoice();
    var nm = TM.themeName();
    var city = String(get_variable("loom_city") || "");
    var msg;
    if (ch === "off") msg = "off: each tab keeps its own colours";
    else if (ch === "auto") msg = "following your city: " + (nm ? TM.themes[nm].label : (city === "none" ? "you have no city, so each tab keeps its own colours" : (city ? tmCap(city) + " has no theme, so each tab keeps its own colours" : "no city seen yet (it comes at login), so each tab keeps its own colours")));
    else msg = TM.themes[nm].label;
    display_notice("[loom] tab theme " + (changed ? "now " : "") + msg + ".", changed ? "lime" : C);
  };
  if (val === "") {
    tmSay(false);
    display_notice("[loom] LOOM THEME " + tmCities.map(function (c) { return c.toUpperCase(); }).join("|") + "|AUTO|OFF", C);
  } else if (val === "auto" || val === "off" || TM.themes[val]) {
    if (val === "auto") delete_variable("loom_theme"); else set_variable("loom_theme", val);
    TM.themeApply();
    tmSay(true);
  } else {
    display_notice("[loom] no theme '" + val + "'. Themes: " + tmCities.map(tmCap).join(", ") + ", or AUTO or OFF.", "orange");
  }
} else if (sub === "help") {
  run_function("loom_help", [], "loom");
} else if (sub === "pause" || sub === "debug") {
  var vname = (sub === "pause") ? "pauseTriggers" : "debug";
  if (val === "on" || val === "off") {
    set_variable(vname, val);
    display_notice("[loom] " + sub + " " + val, "lime");
  } else {
    display_notice("[loom] " + sub + " is " + (get_variable(vname) || "off") + ". Use LOOM " + sub.toUpperCase() + " ON or OFF.", C);
  }
} else if (sub === "perf") {
  var PL = client.loom.loom;
  if (!PL.perfStart) run_function("loom_perf", [], "loom");
  if (val === "stop") {
    if (!PL.perfStop()) display_notice("[loom] no sample running. LOOM PERF [seconds] starts one.", C);
  } else if (val === "data") {
    var pfRows = [];
    PL.perfDataRows(pfRows);
    if (pfRows.length) PL.perfPrint("[loom] PERF: saved data by package", pfRows.slice(1));
    else display_notice("[loom] this client doesn't show its variables, so there's nothing to size.", "orange");
  } else if (PL.perfState) {
    var pfLeft = Math.max(0, Math.round(PL.perfState.secs - (Date.now() - PL.perfState.wall0) / 1000));
    display_notice("[loom] a sample is running, " + pfLeft + " s left. LOOM PERF STOP ends it now.", C);
  } else if (val !== "" && !/^\d+$/.test(val)) {
    display_notice("[loom] usage: LOOM PERF [" + PL.perfMin + "-" + PL.perfMax + "] | STOP | DATA.", "orange");
  } else {
    var pfSecs = val === "" ? PL.perfDefault : parseInt(val, 10);
    if (pfSecs < PL.perfMin || pfSecs > PL.perfMax) {
      display_notice("[loom] a sample lasts " + PL.perfMin + " to " + PL.perfMax + " seconds.", "orange");
    } else {
      var pfRes = PL.perfStart(pfSecs);
      if (pfRes === "missing") display_notice("[loom] this client doesn't run scripts the way LOOM PERF expects (no " + PL.perfMissing().join(", ") + "), so it can't measure here.", "orange");
      else display_notice("[loom] measuring for " + pfSecs + " s: play as usual. The report prints when it ends (LOOM PERF STOP to end sooner).", "lime");
    }
  }
} else if (sub === "room") {
  var rm = client.loom.loom.room;
  if (rm) {
    display_notice("[loom] room " + rm.id + ": " + rm.name + " (" + rm.area + ", " + rm.environment + ")", C);
  } else {
    display_notice("[loom] no room seen yet; move once and try again.", "orange");
  }
} else {
  display_notice("[loom] unknown command '" + sub + "'. LOOM HELP for commands.", "orange");
}
