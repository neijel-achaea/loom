// basher_help -- the HELP screen. Printed in a monospace block through
// nexusclient.add_html_line when this Nexus has it, so the columns line up;
// otherwise as plain notices.
var hlTitle = "[basher] attended bashing on top of hunting: attacks your target on balance and equilibrium. Commands:";
// [command, what it does]; a one-element row is a note or section line.
var hlRows = [
  ["BASHER", "status: off, primed or running, and why it isn't attacking"],
  ["BASHER ON", "prime it: your next attack starts a run of hunting's main attack on tar"],
  ["BASHER STOP", "stop at once and stand down (the kill switch); BASHER OFF does the same"],
  ["BASHER WIMPY", "show when it flees"],
  ["BASHER WIMPY HEALTH|MANA <1-90|OFF>", "during a run, flee below this health or mana (health 40, mana 20 by default)"],
  ["BASHER WIMPY DIR <direction|OFF>", "where to flee when the way back isn't known"],
  ["BASHER RAGE [ON|OFF]", "battlerage during a run (default ON), in the class's order; no word: show it"],
  ["The Basher tab (create a custom tab named Basher) keeps a kill order per area: new mob types join ignored; ACTIVE ones are targeted by priority, then room order. While primed the basher sets your target to the top one whenever that changes; in a run it takes the next after each kill and ends when none are left. With no active types in an area it follows your own target as before."],
  ["Another player arriving during a run, a tell to you, or a line on your city channel makes the fight in progress the last: it finishes, nothing new starts, the basher waits primed. With social, enemies are named as such (loom link social-basher)."],
  ["Loom has no client-side curing: the basher relies on the game's server-side curing (CURING ON) or your own curing system."],
  ["A mob whose magical shield is up isn't attacked until the shield fades (razing comes later)."],
  ["While on, \"You are confused as to the effects of the venom.\" sends DIAGNOSE on the next recovery, once per confusion."],
  ["It attacks only a living mob in the room (never a player), keeps going while the room has more of your target (one attack per recovery), ends the run when it has none (still primed), and sends nothing while pauseTriggers is on. It always loads OFF. Its only move is wimpy's one step back the way you came; then the run is over and it stays primed."]
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
