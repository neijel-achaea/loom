// hunting_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[hunting] class F-keys, battlerage highlights, dragon attacks and autogold. Commands:";
// Whether the current class has a file in classes/, and which classes do.
var hlHU = client.loom.hunting || {};
var hlKnown = [];
for (var hlK in (hlHU.classes || {})) hlKnown.push(hlK);
var hlClassNote = "Classes set up: " + hlKnown.join(", ") + "."
  + (hlHU.cls && !(hlHU.classes && hlHU.classes[hlHU.cls]) ? " " + hlHU.cls + " isn't one yet: you get the generic keys (Stats, Diag, Shield) and no attack highlights." : "");
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["HUNTING", "status"],
  ["HUNTING DRAGONMODE [PHY|MAG|AUTO]", "gut, incantation, or whichever pool is fuller (no argument: next mode)"],
  ["HUNTING AUTOGOLD [ON|ALL|OFF]", "pick up gold from your kills, from any corpse, or not at all"],
  ["HUNTING PARTYTARGET [name|OFF]", "who party-aimed keys act on (the druid's Remedy key)"],
  ["HUNTING AFTERFORM [cmd|OFF]", "command sent when dragonform rises or falls, e.g. DEFCON INIT"],
  ["HUNTING MAIN [name]", "your class's main attack on F1 (no name: list them)"],
  ["HUNTING MAIN <name> = <command>", "add one for this class, e.g. to try an attack; empty command removes it"],
  ["HUNTING TOGGLE <name> [ON|OFF]", "class toggles on the F-keys, e.g. the Serpent's SNEAK and WEAVE"],
  ["HUNTING BUTTONS", "lay out the F-keys again"],
  ["HUNTING RAGE", "rage, cooldowns and tracked keys"],
  ["HUNTING RESET", "clear rage cooldowns, lay out the F-keys again"],
  ["HUNTING DEBUG", "internal state"],
  ["F8 to F12 only show if Nexus is set to 12 buttons: gear icon (bottom right) > Buttons > Button Count."],
  [hlClassNote]
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
