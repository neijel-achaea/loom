// atlas_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[atlas] the community map in the Atlas tab, with the rooms you've explored. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["ATLAS", "status: the map's version, fog of war, where you are and how much of the area you've explored"],
  ["ATLAS FOG [ON|OFF]", "fog of war: only the rooms you've explored (default ON); OFF shows every room, unexplored ones faint"],
  ["ATLAS GO <room number>", "walk there (PATH FIND), as a click on a room in the tab"],
  ["ATLAS SORT [NAME|LEAST|MOST|LEFT]", "order the Areas tab's chips: by name, least or most explored first, or most rooms left first (also NAME · % · LEFT in the tab; kept)"],
  ["ATLAS MARK [room number] <icon> [note]", "your own icon on a room (no number: the room you're in), bottom left corner; note on hover"],
  ["ATLAS UNMARK [room number]", "take a room's mark off"],
  ["ATLAS MARKS", "the icons (fishing, shrine, sleep, bank, shop, craft, harvest, hunt, danger, star, secret) and your marked rooms"],
  ["ATLAS AREAS", "how many areas you've visited and how much of them you've explored (the Areas tab lists them)"],
  ["ATLAS TAG <area|number|HERE> <tag> [tag…]", "group an area under your own tags in the Areas tab (one word each; e.g. sapience, meropis)"],
  ["ATLAS UNTAG <area|number|HERE> <tag>|ALL", "take a tag off an area, or all of them"],
  ["ATLAS TAGS", "every tag in use, with how many areas carry it"],
  ["ATLAS HIDE <area|number|HERE>", "keep an area out of the Areas list and the totals (houses, manses…); UNHIDE brings it back"],
  ["ATLAS SHOW <area|number>", "show an area in the Atlas tab without going there (as a click in the Areas tab)"],
  ["ATLAS RELOAD", "download the community map again (it's otherwise kept in this browser and updated when it changes)"],
  ["ATLAS DEBUG", "internal state"],
  ["The tabs are custom tabs named Atlas (the map) and Areas (exploration per area). Atlas: drag to pan, mouse wheel or - + to zoom, the arrows by 'level' look up and down."],
  ["An area's name can be the community map's or the game's, with or without 'the', in any case: ATLAS TAG granite hills sapience."],
  ["The map is the Achaea crowdmap, kept by players at github.com/IRE-Mudlet-Mapping/AchaeaCrowdmap."]
];
var hlW = 0;
for (var hlI = 0; hlI < hlRows.length; hlI++) {
  if (hlRows[hlI].length > 1 && hlRows[hlI][0].length > hlW) hlW = hlRows[hlI][0].length;
}
var hlPad = "                                                            ";
var hlHtml = (typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function");
var hlOut = [];
if (!hlHtml) display_notice(hlTitle, "cyan");
for (var hlJ = 0; hlJ < hlRows.length; hlJ++) {
  var hlR = hlRows[hlJ];
  var hlCmd = hlR.length > 1 ? hlR[0] : "";
  var hlText = hlR.length > 1 ? hlR[1] : hlR[0];
  if (hlR.length > 1) hlCmd = (hlCmd + hlPad).substring(0, hlW + 3);
  if (hlHtml) {
    hlCmd = hlCmd.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    hlText = hlText.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    hlOut.push("  " + (hlR.length > 1 ? '<span style="color:#00ffff">' + hlCmd + '</span>' + '<span style="color:#9fc9c9">' + hlText + '</span>' : '<span style="color:#9fc9c9">' + hlText + '</span>'));
  } else {
    display_notice("  " + hlCmd + hlText, "cyan");
  }
}
if (hlHtml) {
  display_notice(hlTitle, "cyan");
  nexusclient.add_html_line('<span style="font-family:\'Courier New\',monospace;white-space:pre">' + hlOut.join("\n") + '</span>');
}
