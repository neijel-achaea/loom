// shopping_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[shopping] a list of what you mean to buy, priced from the city's directory and grouped by shop in the Shopping tab. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["SHOPPING", "the list by shop, numbered, with subtotals and the likely total"],
  ["SHOPPING ADD [n] <item>", "look it up with DIRECTORY (in a city) and list n of it under its cheapest shop; again adds to the quantity"],
  ["SHOPPING PICK <number>", "when the directory found different items for a word, the one you mean (or click it in the tab)"],
  ["SHOPPING REMOVE <number|item> [n]", "take an item off the list, or only n of it (also the × on its row in the tab)"],
  ["SHOPPING CLEAR CONFIRM", "wipe the whole list"],
  ["SHOPPING RESET", "reload the saved list, redraw the tab"],
  ["SHOPPING DEBUG", "internal state"],
  ["Prices are the directory's: a shopkeeper's policy can change them. Nothing walks or buys."],
  ["The tab is a custom tab named Shopping."]
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
