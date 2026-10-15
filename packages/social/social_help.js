// social_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[social] name highlighting by group, online/offline notices and the Online tab for the names you watch. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["SOCIAL", "status: list sizes, polling, watched groups"],
  ["SOCIAL ADD <group> <name>", "add a name to a group"],
  ["SOCIAL DEL <group> <name>", "remove it"],
  ["SOCIAL LIST [group]", "names in a group (no group: counts)"],
  ["SOCIAL COLOR <group|self> [#rrggbb]", "highlight colour (no colour: back to the default)"],
  ["SOCIAL WATCH [group]", "announce when that group's names log in or out (no group: show)"],
  ["SOCIAL OFFLINE [ON|OFF]", "show or fold the Online tab's offline section (clicking its heading flips it too)"],
  ["SOCIAL UNWATCH <group>", "stop announcing it"],
  ["SOCIAL POLL ON|OFF|NOW", "the QW poll behind the announcements (every 5s)"],
  ["SOCIAL RESET", "reload the lists, re-prime the watchlist"],
  ["SOCIAL DEBUG [ON|OFF]", "internal state; ON shows each poll"],
  ["Groups, highest priority first: family, enemies, order, house, city, allies, friends."],
  ["Your city's enemies list reloads itself whenever the game shows it (e.g. CITY ENEMIES)."]
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
