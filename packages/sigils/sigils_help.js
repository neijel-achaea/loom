// sigils_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[sigils] monolith and flame sigil watcher. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["SIGILS", "status"],
  ["SIGILS WATCH [ON|OFF]", "probe the monolith in every room you enter"],
  ["SIGILS REPORT", "rooms under the threshold, with estimated cost"],
  ["SIGILS CHECK", "probe this room once"],
  ["SIGILS IGNORE [HERE|id]", "skip a room (no argument: list ignored rooms)"],
  ["SIGILS UNIGNORE HERE|id", "watch a room again"],
  ["SIGILS THRESHOLD [n]", "flag sigils with fewer than n months left"],
  ["SIGILS COST [MONOLITH|FLAME n]", "prices used in the report"],
  ["SIGILS CLEAR", "wipe the flagged list"],
  ["SIGILS RESET", "clear the queue, restore missing defaults"],
  ["SIGILS DEBUG", "internal state"]
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
