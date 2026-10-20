// levelgraph_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[levelgraph] your progress through the levels, per minute and per day. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["LEVELGRAPH", "level, session and long-term rates, time to the next level"],
  ["LEVELGRAPH MARK", "record a sample now"],
  ["LEVELGRAPH NEW", "close this session and start a new one now"],
  ["LEVELGRAPH GAP <5-240>", "minutes without a prompt that close a session (default 30)"],
  ["LEVELGRAPH GRAPH [SESSION|LONG] [ON|OFF]", "show or hide the graphs in the Level tab"],
  ["LEVELGRAPH SIZE <40-400>", "graph height (default 105)"],
  ["LEVELGRAPH SPAN SESSION <15-720>", "minutes the minute-by-minute graph covers (the session's figures don't depend on it)"],
  ["LEVELGRAPH SPAN LONG <7-365>", "days the long-term graph covers"],
  ["LEVELGRAPH CSV [SESSION|LONG]", "a buffer as CSV lines"],
  ["LEVELGRAPH WIPE CONFIRM", "clear both buffers and the session"],
  ["LEVELGRAPH DEBUG", "internal state"]
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
