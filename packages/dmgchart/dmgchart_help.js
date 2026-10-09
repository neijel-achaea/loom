// dmgchart_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[dmgchart] damage dealt and taken by type, per fight and per recorded session. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["DMGCHART", "the fight in the tab, any recording, gap and saved sessions"],
  ["DMGCHART START [name]", "start recording a session"],
  ["DMGCHART END", "stop recording and save the session"],
  ["DMGCHART SHOW [#]", "show the recording, or saved session #, in the tab"],
  ["DMGCHART LIVE", "back to the live fight"],
  ["DMGCHART LIST", "the saved sessions"],
  ["DMGCHART DEL <#>", "delete saved session #"],
  ["DMGCHART GAP <seconds>", "quiet time that ends a fight (default 6)"],
  ["DMGCHART RESET", "clear the live fight"],
  ["DMGCHART WIPE CONFIRM", "delete all saved sessions"],
  ["DMGCHART REBUILD", "rebuild from the saved variables (a recording resumes from its last checkpoint)"],
  ["DMGCHART DEBUG", "internal state"]
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
