// huntstats_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[huntstats] per-area hunting records: xp, gold and kills an hour, Dragonhood. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["HUNTSTATS", "the hunt under way: rates, next level, Dragonhood"],
  ["HUNTSTATS AREAS", "every area hunted, by total time, with its rates and the damage it deals"],
  ["HUNTSTATS TANK [percent]", "how much of your max health a second you can heal back (default 3); colours the damage areas deal"],
  ["HUNTSTATS LOG", "the last five hunts"],
  ["HUNTSTATS SUGGEST", "the ten best areas to hunt next, by xp/hr, gold/hr and how long since you went"],
  ["HUNTSTATS SUGGEST WEIGHTS <x> <g> <v>", "how much xp, gold and variety count (default 70 25 5)"],
  ["HUNTSTATS FLUSH", "file the hunt under way now"],
  ["HUNTSTATS PARTY", "who you're hunting with"],
  ["HUNTSTATS PARTY ADD <names>", "add people to the party (kept until removed)"],
  ["HUNTSTATS PARTY DEL <names>", "remove people from the party"],
  ["HUNTSTATS PARTY CLEAR", "back to hunting alone"],
  ["HUNTSTATS SPLIT", "the party's gold so far and the transfers that even it out"],
  ["HUNTSTATS SPLIT REPORT", "send the split to party tell now, one line per person"],
  ["HUNTSTATS SPLIT TELL ON|OFF", "also send it to party tell when a party hunt ends (default off)"],
  ["HUNTSTATS WIPE CONFIRM", "clear all area records and the log"],
  ["HUNTSTATS DEBUG", "internal state"],
  ["A hunt is filed when you leave its area, and needs a minute or more of experience. A party hunt's gold split is shown then."]
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
