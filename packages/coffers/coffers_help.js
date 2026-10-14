// coffers_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[coffers] gold tracker: purse and bank, income and spending. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["COFFERS", "fortune, rank, goal, session, today and records"],
  ["COFFERS SESSIONS [n] / DAYS [n]", "the books, as tables"],
  ["COFFERS NEW", "close this session now"],
  ["COFFERS GAP <5-240>", "minutes without a prompt that close a session"],
  ["COFFERS GOAL <amount|OFF>", "earn this much from now (50000, 50k, 1.5m)"],
  ["COFFERS BIGCOIN <amount|OFF>", "announce single gains or losses this large"],
  ["COFFERS GRAPH [SESSION|LONG] [ON|OFF]", "show or hide the graphs"],
  ["COFFERS SIZE <40-400>", "graph height (default 105)"],
  ["COFFERS SPAN SESSION <15-720>", "minutes the session graph covers"],
  ["COFFERS SPAN LONG <7-365>", "days the day-by-day graph covers"],
  ["COFFERS CSV [DAYS|SESSION|SESSIONS]", "the books as CSV lines"],
  ["COFFERS WIPE CONFIRM", "burn the whole ledger"],
  ["COFFERS REBUILD / DEBUG", "rebuild helpers and rank table / internal state"]
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
