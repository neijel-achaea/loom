// room_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[room] the Here tab: the room you are in, its exits, players, mobs and items. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["ROOM", "the room in a line, and how the description starts"],
  ["ROOM DESC OPEN|FOLDED", "show the description in full, or folded to two lines (clicking it flips it too)"],
  ["ROOM PROBE [ON|OFF]", "loyals: once a mob has been here 2 s and nothing is hurting you, probe it once, silently, and mark it in Here if it's loyal to someone (default ON)"],
  ["ROOM PROBE IGNORE [name]", "places read as owners (\"loyal to Qurnok\"): mobs loyal to them aren't marked; no name lists them"],
  ["ROOM PROBE UNIGNORE <name>", "take a name off that list"],
  ["ROOM PROBE DEBUG", "the lines the last probe hid, and what ended it"],
  ["ROOM REMEMBER", "remember this room (REMEMBER in Here does the same)"],
  ["ROOM BACK", "walk back to the remembered room with PATH FIND (GO BACK in Here)"],
  ["ROOM FORGET", "forget the remembered room"],
  ["ROOM DEBUG", "the last room GMCP payloads, as they came"],
  ["The Here tab replaces the stock Room tab: create a custom tab named Here, then close the stock one from the layout if you like."]
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
