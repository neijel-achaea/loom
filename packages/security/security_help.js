// security_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[security] antitheft, gold in the backpack, and give/sell/drop/offer without selfishness getting in the way. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["SECURITY", "status"],
  ["SECURITY ANTITHEFT ON|OFF", "put back worn items and gold that get taken"],
  ["GG / PG", "get gold out of / put gold into the backpack (antitheft off / on)"],
  ["SECURITY BACKPACK <id> = <desc>", "your backpack: its id, and how it reads in \"You remove ...\""],
  ["SECURITY ITEMS", "worn items antitheft watches"],
  ["SECURITY ITEM ADD <wear> = <desc>", "watch an item, e.g. wear ring123 = a silver ring"],
  ["SECURITY ITEM DEL <n>", "stop watching item n"],
  ["SECURITY HOUSE IN|OUT", "send your house state command"],
  ["SECURITY HOUSE SET IN|OUT <cmd>", "set it"],
  ["GIVE / SELL / DROP / OFFER", "lift selfishness around the action when it is up"],
  ["SECURITY DEBUG", "internal state"]
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
