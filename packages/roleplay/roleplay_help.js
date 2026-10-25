// roleplay_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[roleplay] ambient emotes in your own voice. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["ROLEPLAY", "who the emotes follow (race, class, gender) and the ambient emotes' state"],
  ["ROLEPLAY GENDER [HE|SHE|FAE|AUTO]", "the pronouns {he} {him} {his} become (AUTO: your gender in SCORE)"],
  ["ROLEPLAY QUIET [ADD|REMOVE <name>|RESET]", "defences and afflictions that hold the emotes back"],
  ["ROLEPLAY AEM [ON|OFF]", "an ambient emote every few minutes, or none; remembered across sessions (default OFF)"],
  ["ROLEPLAY AEM NOW", "one ambient emote now"],
  ["ROLEPLAY AEM LIST [GENERAL|RACE|CLASS|FORM|ALL]", "the emotes in use, numbered, with weight and chance"],
  ["ROLEPLAY AEM ADD <list> [weight] <text>", "add an emote: list GENERAL, RACE, CLASS, FORM, or CLASS:<name>"],
  ["ROLEPLAY AEM EDIT <n> <text>", "reword emote n"],
  ["ROLEPLAY AEM WEIGHT <n> <weight>", "how often emote n comes up (0 keeps it but never sends it)"],
  ["ROLEPLAY AEM REMOVE <n>", "remove emote n (its text is shown, to add back)"],
  ["ROLEPLAY AEM TEST <n>", "show emote n as it would be sent, without sending it"],
  ["ROLEPLAY AEM TIME [<min> <max>]", "minutes between ambient emotes (default 15 19)"],
  ["ROLEPLAY AEM EXPORT [ALL]", "your emotes as ADD commands, to keep or paste back"],
  ["ROLEPLAY AEM RESET [GENERAL|RACE|CLASS|FORM|ALL] CONFIRM", "a fresh set of starting emotes (yours in that list are lost)"],
  ["ROLEPLAY DEBUG", "internal state"],
  ["A normal class uses general + race + class lists; a dragon or elemental lord its form list (every dragon, every lord) + its own (colour, element)."],
  ["Numbers are those of the last LIST. Nothing is sent while triggers are paused, while hidden or asleep, or in a fight."]
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
