// magi_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[magi] Magi helpers: crystals, pearls, portals, the staff attack and treaties. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["MAGI", "status"],
  ["MAGI REFINE [n]", "refine stored facets into the shapes you have fewest of (at most n crystals, 200 a run)"],
  ["MAGI REFINE STOP", "cancel a refine run"],
  ["MAGI MIN [<n> | <shape> <n|DEFAULT>]", "minimum stock per shape (default for all, or one shape)"],
  ["MAGI PEARLS ON|OFF", "pick up pearls that drop from corpses"],
  ["MAGI PORTAL ON|OFF", "open a sonic portal for city members who tell you \"Gate.\" (needs social's city list)"],
  ["MAGI STAFF FIRE|FROST|LIGHTNING", "the attack STAFF CAST uses (scintilla, horripilation, lightning)"],
  ["MAGI TREATY <elemental>", "form a treaty (also MAGI TF): pauses triggers and sipping until it's written"],
  ["MAGI RESUME", "unpause triggers and turn sipping back on, if a treaty was interrupted"],
  ["MAGI DEBUG", "internal state"],
  ["Elementals: waterweird, djinn, sandling, efreeti, stoneback, breath, mistfiend, ashbeast."],
  ["Triggers pause while you attune to the Master Crystal and resume when it calls you."]
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
