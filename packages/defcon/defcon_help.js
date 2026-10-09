// defcon_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[defcon] defence readiness: one level, five tiers. Commands:";
// Whether the current class has its own table, and which classes do.
var dcD = client.loom.defcon || {};
var dcKnown = [];
for (var dcK in (dcD.classes || {})) dcKnown.push(dcK);
var dcName = dcD.cls ? ((dcD.alias && dcD.alias[dcD.cls]) || dcD.cls) : "";
var dcClassNote = "Classes set up: " + dcKnown.join(", ") + "."
  + (dcName && !(dcD.classes && dcD.classes[dcName]) ? " " + dcD.cls + " isn't one yet: you get the general defences." : "");
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["DEFCON", "status"],
  ["DEFCON 1-5", "keep defences of that tier and above in curing (5 = fewest, 1 = all)"],
  ["DEFCON UP", "raise your class's defences now"],
  ["DEFCON LIST", "defences per tier for your class, with curing priority"],
  ["DEFCON AUTOUP ON|OFF", "DEFCON UP when you log in"],
  ["DEFCON ON|OFF", "the game's defence upkeep (CURING DEFENCES ON/OFF)"],
  ["DEFCON DEBUG", "internal state"],
  [dcClassNote]
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
