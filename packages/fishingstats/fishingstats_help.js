// fishingstats_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[fishingstats] catches, casts and hooks for you and everyone around you. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["FISHINGSTATS", "this session by angler, and the settings"],
  ["FISHINGSTATS END", "file this session to the log and start a new one"],
  ["FISHINGSTATS DISCARD [CONFIRM]", "throw this session away without filing it"],
  ["FISHINGSTATS LOG [WIPE [CONFIRM]]", "redraw the fishinglog tab / clear the log"],
  ["FISHINGSTATS GAP <5-1440>", "minutes idle before a session files itself"],
  ["FISHINGSTATS AREA [<name>|AUTO|RESET]", "pin the area / follow the game / forget this session's"],
  ["FISHINGSTATS YEAR <n>", "the Achaean year (normally read from RANKINGS FISHING)"],
  ["FISHINGSTATS ME [<name>|AUTO]", "your angler name (normally your character's)"],
  ["FISHINGSTATS COLOUR <name> <#rrggbb|RESET>", "an angler's colour in the tabs"],
  ["FISHINGSTATS ADD <angler> <lb> [oz] <species>", "record a catch by hand"],
  ["FISHINGSTATS CSV", "this session as CSV lines"],
  ["FISHINGSTATS LEARN [ON|OFF|SHOW|CLEAR]", "capture raw lines to fix a missed catch message"],
  ["FISHINGSTATS DEMO / DEBUG", "sample data in the tab / internal state"],
  ["Type RANKINGS FISHING once a year so new records are flagged."]
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
