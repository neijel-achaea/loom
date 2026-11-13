// chronicle_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[chronicle] a record of each Achaean day. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["CHRONICLE", "today's date and what has been recorded"],
  ["CHRONICLE NOTE <text>", "add a note of your own to today's record"],
  ["CHRONICLE CHANNELS", "the channels heard this session, and which are kept"],
  ["CHRONICLE CHANNEL <name> ON|OFF", "keep or leave out a channel (TELLS for all tells)"],
  ["CHRONICLE CHANNEL <name> DEFAULT", "back to the default for that channel"],
  ["CHRONICLE KEY <key>|CLEAR", "your Anthropic API key, kept in this browser only (summaries need it)"],
  ["CHRONICLE VOICE [text|CLEAR]", "your notes on the character, for the summaries"],
  ["CHRONICLE PERSON FIRST|THIRD", "a chronicler's record (third, default) or the character's journal"],
  ["CHRONICLE SUMMARIES ON|OFF", "a summary at the end of each Achaean day (on)"],
  ["CHRONICLE WRITE [day]", "write a day's summary now: today, yesterday, or e.g. 8 Scarlatan"],
  ["CHRONICLE WRITE MONTH|YEAR [which]", "write a month's or year's now (this one so far if none named)"],
  ["CHRONICLE VIEW DAYS|MONTHS|YEARS", "what the tab shows (or click the headings)"],
  ["CHRONICLE MODEL [id|DEFAULT]", "the model that writes them"],
  ["CHRONICLE EXPORT", "download the whole record as a Markdown file"],
  ["CHRONICLE EXPORT SHOW", "print the last export here, if no download started"],
  ["CHRONICLE DEBUG", "internal state"],
  ["CHRONICLE RESET", "rebuild from the saved variables (the record is kept)"],
  ["CHRONICLE CLEAR CONFIRM", "throw the whole record away"],
  ["Kept by itself: areas you spend a minute in, rooms you stay five minutes in (and who was"],
  ["there), IC channels (say, tells, yell, city, house, order, clans, the gods' emotes), emotes"],
  ["in your room, and letters, messages and news you read. Anything after // is taken as OOC."],
  ["The record keeps the lines of the last 30 Achaean days you played in (one Achaean day is one"],
  ["real hour), and summaries for longer, saved with your character's settings. Summaries need"],
  ["your own Anthropic API key (CHRONICLE KEY): each day's record is sent to write them, at a cost."]
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
