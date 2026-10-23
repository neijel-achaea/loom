// standings_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[standings] standings with adventurers and organisations, kept per character. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["STANDINGS", "overview in the Standings tab"],
  ["STANDINGS <name>", "show them in the tab"],
  ["STANDINGS @<tag>", "an organisation (everyone tagged with it)"],
  ["STANDINGS <name> + | ++ | +++", "nudge up, small to large [note]"],
  ["STANDINGS <name> - | -- | ---", "nudge down, small to large [note]"],
  ["STANDINGS <name> SET <-10..10> [note]", "place a standing outright, to catch up on the past"],
  ["STANDINGS <name> NOTE <text>", "a note without a nudge"],
  ["STANDINGS <name> UNDO", "remove the last entry"],
  ["STANDINGS <name> TAG <t> [t2..]", "tags: plain or typed (city:eleusis, house:sentaari, order:gaia)"],
  ["STANDINGS <name> UNTAG <t>", "remove a tag"],
  ["STANDINGS <name> FORGET CONFIRM", "erase their whole history"],
  ["STANDINGS LIST [n]", "people on the books, highest first (15 unless n)"],
  ["STANDINGS TAGS", "tags in use, with their averages"],
  ["STANDINGS REVIEW", "suggested dealings waiting for you"],
  ["STANDINGS OK [nudge] [note]", "record the first suggestion (optionally another size)"],
  ["STANDINGS SKIP", "dismiss it"],
  ["STANDINGS DEBUG / RESET", "counts and links / reload the rules and recompute (the books are kept)"]
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
