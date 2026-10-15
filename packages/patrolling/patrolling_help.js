// patrolling_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[patrolling] room-by-room plant and shrine checks for patrols. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["PATROLLING", "status"],
  ["PATROLLING ON|OFF", "check every room you enter"],
  ["PATROLLING HERE", "check this room once"],
  ["PATROLLING LEARN", "print this room's plants as a table entry"],
  ["PATROLLING SUGGEST", "an area to patrol, weighed by worth and time since last"],
  ["PATROLLING STAMP [area]", "mark an area as patrolled (no area: the one you're in)"],
  ["PATROLLING FIRE", "tell your clan there's a fire here"],
  ["PATROLLING CLAN <clan|OFF>", "clan for fire alerts, lightning reports and replanting logs"],
  ["PATROLLING GODS", "friendly and hostile gods; every other god is neutral"],
  ["PATROLLING GODS FRIENDLY <god>", "not reported on patrol; marked friendly in Here"],
  ["PATROLLING GODS HOSTILE <god>", "marked hostile in Here, with a warning in its header"],
  ["PATROLLING GODS NEUTRAL <god>", "take a god off the lists"],
  ["PATROLLING RESET / DEBUG", "reload the tables / internal state"]
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
