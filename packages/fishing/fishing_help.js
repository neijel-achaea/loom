// fishing_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[fishing] baits, casts and plays the line on the game's cues. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["FISHING", "bait, ding, rebait and pause state"],
  ["FISHING BAIT <bait>", "the bait to put on the hook"],
  ["FISHING CAST <direction>", "bait the hook (unless it already is) and cast, both on balance"],
  ["CL <direction>", "the same, shorter"],
  ["FISHING REBAIT ON|OFF", "bait the hook again after a catch, so CL only casts"],
  ["FISHING DING ON|OFF", "tell the party \"Ding fish!\" on a new yearly record"],
  ["After each catch or a snapped line it says whether it re-baits. LOOM DEBUG ON also shows whether CL baits or only casts."],
  ["Without a pole in hand, the game's \"You must be wielding a pole\" line makes it wield one; cast again."],
  ["Then it teases, jerks and reels on the game's cues, marking the stages [1/4] to [4/4]. LOOM PAUSE stops it."]
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
