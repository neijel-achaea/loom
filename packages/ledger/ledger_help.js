// ledger_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[ledger] reminders and standing items on the Achaean calendar. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["LEDGER", "today's date, what is due or overdue, the oldest standing item"],
  ["LEDGER ADD <text>", "a standing item, with no date"],
  ["LEDGER ADD <text> @ 15th Miraman 1015", "due on that Achaean date (15 works too)"],
  ["LEDGER ADD <text> @ +4 months", "due in that many days or months"],
  ["  ... [repeat]", "add REPEAT to either date to make it recur"],
  ["LEDGER DONE <#>", "done: removed, or moved to its next date if it repeats"],
  ["LEDGER DROP <#>", "remove without doing it"],
  ["LEDGER TOUCH <#>", "mark a standing item as looked at today"],
  ["LEDGER DATE", "ask the game for today's date"],
  ["LEDGER DEBUG [ON|OFF]", "internal state, or debug notices"],
  ["LEDGER REBUILD", "rebuild from the saved variables"],
  ["Items other packages add show their source (\u00b7 harvesting); they go away by themselves when"],
  ["their condition clears. DONE or DROP one and it stays away until then."],
  ["One Achaean day is one real hour; the date updates itself as each day begins."]
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
