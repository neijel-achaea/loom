// remedies_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[remedies] tops up the elixirs and salves in your rift: brews in your pot, pours into the rift, then stops. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["REMEDIES", "your pot, and each remedy's stock against its target (as last read)"],
  ["REMEDIES POT <pot>", "the pot you brew in, as the game names it (e.g. pot123456)"],
  ["REMEDIES CHECK", "read your rift (IR ELIXIR, IR SALVE) and say what would be brewed"],
  ["REMEDIES BREW", "read your rift, then brew and pour each one up to its target, 20 units (1,000 sips) at a time; stops when done"],
  ["REMEDIES STOP", "end a run now"],
  ["REMEDIES TARGET <name> <n|DEFAULT>", "the level to top one up to (defaults: health and mana 2,000, the rest 1,000)"],
  ["REMEDIES CAPS [CLEAR]", "the most your rift took of each, learnt when a pour came up short; CLEAR forgets them"],
  ["REMEDIES DEBUG", "internal state"],
  ["A unit is 50 sips; a remedy less than 50 sips short is left alone, so nothing goes over its target."]
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
