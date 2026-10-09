// roleplay_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[roleplay] emotes, rituals and ambient emotes. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["ROLEPLAY", "the class the emotes follow, and the ambient emotes"],
  ["ROLEPLAY AEM ON / OFF", "an ambient emote every 15-19 minutes, or none"],
  ["ROLEPLAY AEM NOW", "one ambient emote now"],
  ["ROLEPLAY AEM RELOAD", "rebuild the ambient emotes (after editing them)"],
  ["ROLEPLAY DEBUG", "internal state"],
  ["custom_emotes", "the emotes, each worded for your class (a dragon's differ)"],
  ["shoulder_massage, foot_massage, wash_hair <name> <step>", "rituals, one step at a time"],
  ["graduation <name> <step>", "the Saiha graduation ceremony"],
  ["cairnearth, cairnfire, cairnair, cairnwater", "the cairn verses"],
  ["The emotes, rituals and verses are typed in lowercase."],
  ["Ambient emotes send nothing while triggers are paused."]
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
