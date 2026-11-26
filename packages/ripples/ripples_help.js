// ripples_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[ripples] your wades in the Mnemosyne, ripple by ripple, in the Ripples tab. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["RIPPLES", "status: the run under way, or the last one"],
  ["RIPPLES VIEW <view>", "WADE, RIPPLES, BOONS, AFFIXES or RUNS in the tab (or click them)"],
  ["RIPPLES POLL <seconds>|OFF", "how often WADE STATUS is asked quietly in a ripple (default 30)"],
  ["RIPPLES NAME <name>|DEFAULT", "name the place of this ripple (or the last one)"],
  ["RIPPLES NAME <place> = <name>", "rename any place, for every ripple there (or click it in Ripples)"],
  ["RIPPLES TOOK <boon>", "set the last boon claimed, when it couldn't tell"],
  ["RIPPLES END [DIED]", "close the run under way by hand"],
  ["RIPPLES WIPE", "forget every run, boon and affix (CONFIRM)"],
  ["RIPPLES RESET", "clear what it's reading, reload runs from saved variables"],
  ["RIPPLES DEBUG", "internal state"],
  ["Create a UI tab named 'Ripples'. While you wade it asks WADE STATUS after GO!, after kills and every POLL seconds, and BOON CLAIMED after each claim, and hides only those answers. It sends nothing while Loom is paused."]
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
