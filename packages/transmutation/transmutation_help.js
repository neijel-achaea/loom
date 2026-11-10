// transmutation_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[transmutation] extracts the minerals your rift is short of as you walk. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["TRANSMUTATION", "status: the area here and what is below its minimum"],
  ["TRANSMUTATION ON|OFF", "ON also reads your rift (IR MINERALS); loads OFF"],
  ["TRANSMUTATION MIN <n>", "default minimum for every mineral (default 500)"],
  ["TRANSMUTATION MIN <mineral> <n>", "minimum for one mineral (DEFAULT to go back to the default)"],
  ["TRANSMUTATION AREAS [mineral]", "the areas known, by mineral (or where to find one)"],
  ["TRANSMUTATION FORGET HERE|<area>", "look the area's mineral up again (CONFIRM)"],
  ["TRANSMUTATION STOCK", "re-read your rift now"],
  ["TRANSMUTATION RESET", "clear what's out and the rooms extracted this session, reload saved state"],
  ["TRANSMUTATION DEBUG", "internal state"],
  ["Extracts in mountain and underground (natural or constructed) rooms. Each area gives one mineral: it sends MINERALS once in an area it doesn't know (yours count too) and remembers it."]
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
