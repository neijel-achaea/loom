// self_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[self] the Self tab follows your afflictions and defences live. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["SELF", "name, class, afflictions, and watched defences missing"],
  ["SELF WANT <defence...>", "watch defences for your current class"],
  ["SELF UNWANT <defence...>", "stop watching them"],
  ["SELF WANTS", "the watched defences for this class"],
  ["SELF KEEP <affliction...>", "hide afflictions you keep on purpose"],
  ["SELF UNKEEP <affliction...>", "show them again"],
  ["SELF KEEPS", "the afflictions kept on purpose"],
  ["SELF NAME [<name>|CLEAR]", "name in the tab title (default: the game's)"],
  ["SELF DEBUG", "internal state"],
  ["Each class, dragonform included, keeps its own watched list; missing ones show in red and losing one is announced."],
  ["DIAG, DEF and SCORE refresh what the tab shows."]
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
