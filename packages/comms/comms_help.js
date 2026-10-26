// comms_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[comms] the Comms tab: every channel, tell and say, in the game's own colours. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["COMMS", "the channels heard, what's muted, how many lines are kept"],
  ["COMMS VIEW <channel|name|CLANS|ALL>", "what the tab shows: a channel (TELLS, SAY, PARTY...), a tell conversation, every clan together, or All"],
  ["COMMS MUTE|UNMUTE <channel>", "leave a channel out of All and its unread count (still kept); the tab's mute link too"],
  ["COMMS CAP <50-2000>", "lines kept per channel (default 300)"],
  ["COMMS CLEAR [channel] CONFIRM", "forget every line, or one channel's"],
  ["COMMS DEBUG", "the last GMCP payloads, the tell input line, why it follows or not"],
  ["Filters run All, Say, Tell, Party, Yell, Shout, City, House, HNT, Clans, then the rest alphabetically. Emotes and Deathsight (the gods' roleplay) stay in the main window only."],
  ["In the tab: click a filter to show it, a line's channel tag to open that channel, a name to start a tell to them. Hover a line for its time."],
  ["The Comms tab (added when comms loads) replaces the stock communication window: close the stock one from the layout if you like."]
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
