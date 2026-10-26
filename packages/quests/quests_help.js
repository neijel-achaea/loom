// quests_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[quests] your own repeatable quests, written down as steps and followed in the Quests tab. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["QUESTS", "status: how many under way, ready and waiting, and the one you follow"],
  ["QUESTS LIST", "every quest, with where you are in it or when it's ready again"],
  ["QUESTS NEW <name>", "start writing a quest down (in this area, daily); it opens in the tab"],
  ["QUESTS OPEN <name|number>", "show a quest in the tab; one you can do now is followed"],
  ["QUESTS CLOSE", "back to the list (also \u2190 quests in the tab)"],
  ["Writing steps (on the quest open in the tab):"],
  ["QUESTS STEP GO", "go to the room you're in (ticks when you arrive; click walks)"],
  ["QUESTS STEP TALK|ASK|SAY <command>", "a line to send, as you'd type it (ticks when sent from the tab)"],
  ["QUESTS STEP GET|BUY <item> [/ <command>]", "ticks when the item is in your inventory; the command, if given, is its button"],
  ["QUESTS STEP GIVE <item> [/ <command>]", "ticks when the item leaves your inventory"],
  ["QUESTS STEP KILL [count] <mob>", "ticks after that many \"You have slain\" lines naming it"],
  ["QUESTS STEP NOTE <text>", "a reminder, ticked by hand"],
  ["QUESTS STEP REMOVE <n>", "drop a step (also EDIT STEPS in the tab)"],
  ["QUESTS REPEAT DAILY|YEARLY", "daily: at the daily reset; yearly: an Achaean year (300 hours) after you did it"],
  ["QUESTS REWARD RENOWN|GOLD <n>", "what it gives (0 takes it off)"],
  ["QUESTS REWARD ITEM <text> | CLEAR", "an item it gives, or clear the rewards"],
  ["QUESTS RENAME <new name>", "rename the open quest"],
  ["QUESTS REMOVE <name|number> CONFIRM", "forget a quest and its record"],
  ["Following:"],
  ["QUESTS NEXT", "tick the current step by hand"],
  ["QUESTS BACK", "one step back"],
  ["QUESTS RESTART", "start the open quest over (also START OVER in the tab)"],
  ["QUESTS DONE", "mark the open quest done now"],
  ["Settings:"],
  ["QUESTS SHOW [ALL|READY|WAITING]", "which quests the tab lists (also in the tab; kept)"],
  ["QUESTS DAILY [hh:mm]", "when daily quests reset, on your own clock (default 00:00)"],
  ["QUESTS RESET", "reload saved quests, redraw the tab"],
  ["QUESTS DEBUG", "internal state"],
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
