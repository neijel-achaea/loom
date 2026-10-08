// talpieces_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[talpieces] dragon talisman pieces toward the Elder Dragon set. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["TALPIECES", "progress, history and settings"],
  ["TALPIECES NEED", "pieces still needed, per colour and type"],
  ["TALPIECES RATE", "pieces per day and a projected finish"],
  ["TALPIECES MARK", "store a history point now"],
  ["TALPIECES GRAPH [ON|OFF]", "show or hide the graph in the Talismans tab"],
  ["TALPIECES GRAPH <40-400>", "graph height (default 110, lower is flatter)"],
  ["TALPIECES SEED <YYYY-MM-DD> [c] [r]", "backdate a starting point: common and rare held then"],
  ["TALPIECES CSV", "history as CSV lines (most recent 300)"],
  ["TALPIECES COMBINE ON|OFF", "queue TALISMAN COMBINE for each row when you list"],
  ["TALPIECES WIPE PIECES|HISTORY", "clear the tracked pieces / the graph history"],
  ["TALPIECES RESET / DEBUG", "reload from saved variables / internal state"],
  ["Pieces are counted as you find, trade and list them; list yours in game to rebuild the count."]
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
