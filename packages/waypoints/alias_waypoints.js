// WAYPOINTS [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.waypoints || !client.loom.waypoints.list) run_function("waypoints_setup", [], "waypoints");
var WP = client.loom.waypoints;
var wpRaw = String(args[1] || "").trim();
var wpSp = wpRaw.search(/\s/);
var wpCmd = (wpSp < 0 ? wpRaw : wpRaw.substring(0, wpSp)).toLowerCase();
var wpRest = wpSp < 0 ? "" : wpRaw.substring(wpSp).trim();
var wpW;
if (wpCmd === "" || wpCmd === "status") {
  var wpAreas = {}, wpNA = 0;
  for (var wpI = 0; wpI < WP.list.length; wpI++) { var wpA = WP.list[wpI].area || "?"; if (!wpAreas[wpA]) { wpAreas[wpA] = 1; wpNA++; } }
  var wpH = WP.here && WP.byId(WP.here.id);
  display_notice("[waypoints] " + WP.list.length + " saved in " + wpNA + (wpNA === 1 ? " area" : " areas") + ". Here: " + (wpH ? wpH.name : (WP.here ? "not saved (WAYPOINTS ADD <name>)" : "no room yet")) + ". WAYPOINTS LIST, WAYPOINTS HELP.", "cyan");
} else if (wpCmd === "help") {
  run_function("waypoints_help", [], "waypoints");
} else if (wpCmd === "list") {
  if (!WP.list.length) display_notice("[waypoints] none saved yet: WAYPOINTS ADD <name> saves the room you're in.", "cyan");
  var wpBy = {}, wpOrd = [];
  for (var wpJ = 0; wpJ < WP.list.length; wpJ++) { var wpB = WP.list[wpJ].area || "unknown area"; if (!wpBy[wpB]) { wpBy[wpB] = []; wpOrd.push(wpB); } wpBy[wpB].push(WP.list[wpJ]); }
  wpOrd.sort();
  for (var wpK = 0; wpK < wpOrd.length; wpK++) {
    display_notice("[waypoints] " + wpOrd[wpK] + ":", "cyan");
    for (var wpL = 0; wpL < wpBy[wpOrd[wpK]].length; wpL++) {
      var wpX = wpBy[wpOrd[wpK]][wpL];
      display_notice("  " + wpX.name + " (" + wpX.id + ") " + (wpX.room || "") + (wpX.note ? " - " + wpX.note : ""), "cyan");
    }
  }
} else if (wpCmd === "add") {
  WP.add(wpRest);
} else if (wpCmd === "remove" || wpCmd === "del") {
  wpW = WP.find(wpRest);
  if (wpW) WP.remove(wpW);
  else display_notice("[waypoints] no waypoint '" + wpRest + "'. WAYPOINTS REMOVE <name|number>.", "orange");
} else if (wpCmd === "rename") {
  var wpS = WP.split(wpRest);
  if (!wpS || !wpS.rest) display_notice("[waypoints] WAYPOINTS RENAME <name|number> <new name>.", "orange");
  else if (/^\d+$/.test(wpS.rest)) display_notice("[waypoints] give it a name, not a number.", "orange");
  else if (WP.byName(wpS.rest) && WP.byName(wpS.rest) !== wpS.w) display_notice("[waypoints] " + wpS.rest + " is taken: pick another name.", "orange");
  else { var wpOld = wpS.w.name; wpS.w.name = wpS.rest; WP.save(); display_notice("[waypoints] " + wpOld + " is now " + wpS.w.name + ".", "lime"); }
} else if (wpCmd === "note") {
  var wpN = WP.split(wpRest);
  if (!wpN) display_notice("[waypoints] WAYPOINTS NOTE <name|number> <text>; no text clears the note.", "orange");
  else { wpN.w.note = wpN.rest; WP.save(); display_notice(wpN.rest ? "[waypoints] note on " + wpN.w.name + ": " + wpN.rest + "." : "[waypoints] note on " + wpN.w.name + " cleared.", "lime"); }
} else if (wpCmd === "go") {
  wpW = WP.find(wpRest);
  if (wpW) WP.go(wpW);
  else display_notice("[waypoints] no waypoint '" + wpRest + "'. WAYPOINTS GO <name|number>.", "orange");
} else if (wpCmd === "reset") {
  run_function("waypoints_setup", [], "waypoints");
  run_function("waypoints_render", [], "waypoints");
  display_notice("[waypoints] reset: saved waypoints reloaded, tab redrawn.", "lime");
} else if (wpCmd === "debug") {
  display_notice("[waypoints] here=" + JSON.stringify(WP.here) + " saved=" + WP.list.length + " folded=" + JSON.stringify(Object.keys(WP.folded).filter(function (a) { return WP.folded[a]; })), "cyan");
} else {
  display_notice("[waypoints] unknown command '" + wpCmd + "'. WAYPOINTS HELP for commands.", "orange");
}
