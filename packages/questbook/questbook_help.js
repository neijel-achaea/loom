// questbook_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[questbook] your own repeatable quests, written down as steps and followed in the Quests tab. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["QUESTBOOK", "status: how many under way, ready and waiting, and the one you follow"],
  ["QUESTBOOK LIST", "every quest, with where you are in it or when it's ready again"],
  ["QUESTBOOK NEW <name>", "start writing a quest down (in this area, repeating daily); it opens in the tab"],
  ["QUESTBOOK OPEN <name|number>", "show a quest in the tab; one you can do now is followed"],
  ["QUESTBOOK CLOSE", "back to the list (also \u2190 quests in the tab)"],
  ["Writing steps (on the quest open in the tab):"],
  ["QUESTBOOK STEP GO [room]", "go to the room you're in, or that room number (ticks when you arrive; click walks)"],
  ["QUESTBOOK STEP GREET <denizen>", "greet a denizen, the game's way to start talking to one (ticks when sent from the tab)"],
  ["QUESTBOOK STEP TALK|ASK|SAY <command>", "a line to send, as you'd type it (ticks when sent from the tab)"],
  ["QUESTBOOK STEP GET|BUY <item> [/ <command>]", "ticks when the item is in your inventory; the command, if given, is its button"],
  ["QUESTBOOK STEP GIVE <item> [/ <command>]", "ticks when the item leaves your inventory"],
  ["QUESTBOOK STEP KILL [count] <mob>", "ticks after that many \"You have slain\" lines naming it"],
  ["QUESTBOOK STEP NOTE <text>", "a reminder, ticked by hand"],
  ["QUESTBOOK STEP EDIT <n> <kind> …", "rewrite step n, as you'd add it (\u270e in EDIT STEPS puts it in your input line)"],
  ["QUESTBOOK STEP INSERT <n> <kind> …", "a new step before step n"],
  ["QUESTBOOK STEP REMOVE <n>", "drop a step (also \u00d7 in EDIT STEPS)"],
  ["QUESTBOOK REPEAT DAILY|MONTHLY|YEARLY|NONE", "in Achaean time: daily on the hour, monthly at the game's midnight, yearly on 1st Sarapin; NONE: once"],
  ["QUESTBOOK REWARD RENOWN|GOLD <n>", "what it gives (0 takes it off)"],
  ["QUESTBOOK REWARD ITEM <text> | CLEAR", "an item it gives, or clear the rewards"],
  ["QUESTBOOK RENAME <new name>", "rename the open quest"],
  ["QUESTBOOK REMOVE <name|number> CONFIRM", "forget a quest and its record"],
  ["Following:"],
  ["QUESTBOOK NEXT", "tick the current step by hand"],
  ["QUESTBOOK BACK", "one step back"],
  ["QUESTBOOK RESTART", "start the open quest over (also START OVER in the tab)"],
  ["QUESTBOOK DONE", "mark the open quest done now"],
  ["Settings:"],
  ["QUESTBOOK SHOW [ALL|READY|WAITING]", "which quests the tab lists (also in the tab; kept)"],
  ["QUESTBOOK MIDNIGHT [hh:mm]", "the game's midnight on your clock, when monthly quests reset (default 02:00)"],
  ["Yearly quests learn 1st Sarapin from the game's date: type DATE once."],
  ["QUESTBOOK RESET", "reload saved quests, redraw the tab"],
  ["QUESTBOOK DEBUG", "internal state"],
  ["The tab is a custom tab named Quests. Nothing runs by itself: a step's button walks or sends only when you click it."]
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
