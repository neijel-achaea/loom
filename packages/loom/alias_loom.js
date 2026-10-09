// LOOM [LIST|HELP|PAUSE on/off|DEBUG on/off|ROOM]
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.loom) client.loom.loom = {};

var raw = String(args[1] || "").trim();
var parts = raw.split(/\s+/);
var sub = String(parts[0] || "").toLowerCase();
var val = String(parts[1] || "").toLowerCase();
var C = "cyan";

if (sub === "" || sub === "list") {
  // The package list prints in a monospace block through
  // nexusclient.add_html_line when this Nexus has it, so the columns line
  // up; otherwise as plain notices.
  var reg = client.loom.registry;
  var names = Object.keys(reg).sort();
  var html = (typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function");
  var esc = function (t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
  var rows = [];
  display_notice("[loom] " + names.length + " package" + (names.length == 1 ? "" : "s") + " loaded", C);
  for (var i = 0; i < names.length; i++) {
    var r = reg[names[i]] || {};
    var label = (names[i] + "                ").slice(0, 16);
    var ver = ("v" + (r.version || "?") + "          ").slice(0, 10);
    if (html) rows.push('  <span style="color:#00ffff">' + esc(label) + '</span><span style="color:#9fc9c9">' + esc(ver) + '</span><span style="color:#00ffff">' + esc(r.keyword || "") + '</span>');
    else display_notice("  " + label + ver + (r.keyword || ""), C);
  }
  if (html && rows.length) nexusclient.add_html_line('<span style="font-family:\'Courier New\',monospace;white-space:pre">' + rows.join("\n") + '</span>');
  display_notice("[loom] pause " + (get_variable("pauseTriggers") || "off") + ", debug " + (get_variable("debug") || "off") + ". LOOM HELP for commands.", C);
} else if (sub === "help") {
  run_function("loom_help", [], "loom");
} else if (sub === "pause" || sub === "debug") {
  var vname = (sub === "pause") ? "pauseTriggers" : "debug";
  if (val === "on" || val === "off") {
    set_variable(vname, val);
    display_notice("[loom] " + sub + " " + val, C);
  } else {
    display_notice("[loom] " + sub + " is " + (get_variable(vname) || "off") + ". Use LOOM " + sub.toUpperCase() + " ON or OFF.", C);
  }
} else if (sub === "room") {
  var rm = client.loom.loom.room;
  if (rm) {
    display_notice("[loom] room " + rm.id + ": " + rm.name + " (" + rm.area + ", " + rm.environment + ")", C);
  } else {
    display_notice("[loom] no room seen yet; move once and try again.", C);
  }
} else {
  display_notice("[loom] unknown command '" + sub + "'. LOOM HELP for commands.", "orange");
}
