// ATLAS [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.atlas || !client.loom.atlas.look) run_function("atlas_setup", [], "atlas");
var AT = client.loom.atlas;
var atRaw = String(args[1] || "").trim();
var atSp = atRaw.search(/\s/);
var atCmd = (atSp < 0 ? atRaw : atRaw.substring(0, atSp)).toLowerCase();
var atRest = atSp < 0 ? "" : atRaw.substring(atSp).trim();
if (atCmd === "" || atCmd === "status") {
  var atMap = AT.map ? "community map version " + AT.map.v + " (" + AT.map.n.toLocaleString("en-US") + " rooms, " + Object.keys(AT.map.areas).length + " areas, from " + AT.source + ")"
    : (AT.state == "loading" ? "the community map is loading" : "no map loaded" + (AT.note ? " (" + AT.note + ")" : "") + ": ATLAS RELOAD");
  var atHere = "";
  if (AT.here) {
    var atE = AT.here.area ? AT.look.explored(AT.here.area) : undefined;
    atHere = " Here: " + (AT.here.name || "?") + " (" + AT.here.id + ")" + (AT.here.area ? " in " + AT.areaName(AT.here.area) : "") + (AT.here.onMap ? "" : ", not on the community map") +
      (atE ? "; explored " + atE.explored + " of the " + atE.mapped + " rooms mapped there." : ".");
  }
  display_notice("[atlas] " + atMap + ". Fog of war " + (AT.fog ? "on" : "off") + "." + atHere, "cyan");
} else if (atCmd === "help") {
  run_function("atlas_help", [], "atlas");
} else if (atCmd === "reload") {
  if (AT.state == "loading") display_notice("[atlas] the community map is loading already.", "cyan");
  else { display_notice("[atlas] downloading the community map again.", "cyan"); AT.load(true); }
} else if (atCmd === "fog") {
  var atF = atRest.toLowerCase();
  if (atF === "on" || atF === "off") { AT.setFog(atF === "on"); display_notice("[atlas] fog of war " + atF + (atF === "on" ? ": only the rooms you've explored." : ": every room on the map, unexplored ones faint."), "lime"); }
  else if (!atF) display_notice("[atlas] fog of war is " + (AT.fog ? "on" : "off") + ". ATLAS FOG ON|OFF.", "cyan");
  else display_notice("[atlas] ATLAS FOG ON|OFF.", "orange");
} else if (atCmd === "go") {
  if (/^\d+$/.test(atRest)) AT.go(atRest);
  else display_notice("[atlas] ATLAS GO <room number>.", "orange");
} else if (atCmd === "debug") {
  var atEx = [];
  for (var atA in AT.explored) if (AT.explored.hasOwnProperty(atA)) atEx.push(atA + ":" + Object.keys(AT.explored[atA]).length);
  display_notice("[atlas] state=" + AT.state + " source=" + (AT.source || "-") + " note=" + (AT.note || "-") + " here=" + JSON.stringify(AT.here) + " view=" + JSON.stringify(AT.view) + " explored={" + atEx.join(", ") + "} tabs=" + AT.svgs().length, "cyan");
} else {
  display_notice("[atlas] unknown command '" + atCmd + "'. ATLAS HELP for commands.", "orange");
}
