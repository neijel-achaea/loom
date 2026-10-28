// REMEDIES [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.remedies || !client.loom.remedies.plan) run_function("remedies_setup", [], "remedies");
var RM = client.loom.remedies;
var rmRaw = String(args[1] || "").trim();
var rmW = rmRaw.split(/\s+/);
var rmSub = (rmW[0] || "").toLowerCase();
if (rmSub === "" || rmSub === "status") {
  RM.say("pot: " + (RM.pot || "none (REMEDIES POT <pot>)") + (RM.run ? "; a run is under way (" + (RM.run.out || "between steps") + ")" : "") + ".");
  var rmNames = Object.keys(RM.stock).sort(function (a, b) { return (RM.stock[a].kind > RM.stock[b].kind) - (RM.stock[a].kind < RM.stock[b].kind) || (a > b) - (a < b); });
  if (!rmNames.length) RM.say("no rift reading yet: REMEDIES CHECK reads it.");
  else {
    var rmL = [];
    for (var rmI = 0; rmI < rmNames.length; rmI++) {
      var rmN = rmNames[rmI], rmU = RM.unitsFor(rmN);
      rmL.push(rmN + " " + RM.n(RM.stock[rmN].n) + "/" + RM.n(RM.targetOf(rmN)) + (rmU ? " (+" + rmU + ")" : ""));
    }
    RM.say("stock/target, (+units to brew): " + rmL.join(" · ") + ".");
  }
} else if (rmSub === "help") {
  run_function("remedies_help", [], "remedies");
} else if (rmSub === "pot") {
  var rmPot = (rmW[1] || "").toLowerCase();
  if (!rmPot) RM.say("pot: " + (RM.pot || "none") + ". REMEDIES POT <pot> sets it (the pot's id, e.g. pot123456).");
  else if (rmW.length > 2) RM.say("one word: the pot's id as the game shows it, e.g. REMEDIES POT pot123456.", "orange");
  else { RM.pot = rmPot; set_variable("remedies_pot", rmPot); RM.say("brewing in " + rmPot + ".", "lime"); }
} else if (rmSub === "check") {
  RM.start(true);
} else if (rmSub === "brew") {
  RM.start(false);
} else if (rmSub === "stop") {
  if (!RM.run) RM.say("no run under way.");
  else RM.stop("stopped.", "orange");
} else if (rmSub === "target") {
  var rmTn = (rmW[1] || "").toLowerCase(), rmTv = (rmW[2] || "").toLowerCase();
  if (!rmTn) RM.say("REMEDIES TARGET <name> <n|DEFAULT>, e.g. REMEDIES TARGET health 2500.", "orange");
  else if (rmTv === "default") { delete RM.targets[rmTn]; RM.save(); RM.say(rmTn + " back to its default target: " + RM.n(RM.targetOf(rmTn)) + ".", "lime"); }
  else if (!/^\d+$/.test(rmTv)) RM.say("the target is a number of sips: REMEDIES TARGET " + rmTn + " 1500.", "orange");
  else {
    RM.targets[rmTn] = parseInt(rmTv, 10); RM.save();
    RM.say(rmTn + " topped up to " + RM.n(RM.targets[rmTn]) + (RM.caps[rmTn] != null && RM.caps[rmTn] < RM.targets[rmTn] ? " (but your rift takes only " + RM.n(RM.caps[rmTn]) + ": REMEDIES CAPS CLEAR if that has changed)" : "") + ".", "lime");
  }
} else if (rmSub === "caps") {
  if ((rmW[1] || "").toLowerCase() === "clear") { RM.caps = {}; RM.save(); RM.say("rift limits forgotten; they're learnt again when a pour comes up short.", "lime"); }
  else {
    var rmC = Object.keys(RM.caps).sort().map(function (k) { return k + " " + RM.n(RM.caps[k]); });
    RM.say("your rift's limits, as learnt: " + (rmC.length ? rmC.join(", ") : "none yet") + ". REMEDIES CAPS CLEAR forgets them.");
  }
} else if (rmSub === "debug") {
  RM.say("run " + JSON.stringify(RM.run) + " | reading " + JSON.stringify(RM.reading) + " | bal " + RM.bal + " eq " + RM.eq + " | pot " + (RM.pot || "-") + " | targets " + JSON.stringify(RM.targets) + " | caps " + JSON.stringify(RM.caps) + " | pause " + (get_variable("pauseTriggers") || "unset"));
} else {
  RM.say("unknown command '" + rmSub + "'. REMEDIES HELP for commands.", "orange");
}
