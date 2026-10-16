// BASHER [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.basher) run_function("basher_setup", [], "basher");
var B = client.loom.basher;
var bsW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
var bsSub = bsW[0];
if (bsSub === "" || bsSub === "status") {
  run_function("basher_status", [], "basher");
} else if (bsSub === "help") {
  run_function("basher_help", [], "basher");
} else if (bsSub === "on") {
  var bsHu = B.hunting();
  if (!bsHu) {
    display_notice("[basher] needs the hunting package: it takes the attack from there. Nothing sent.", "orange");
  } else if (!B.main()) {
    display_notice("[basher] no main attack for " + (bsHu.cls || "this class") + " in hunting. HUNTING MAIN lists them; nothing sent.", "orange");
  } else {
    B.start();
    var bsT = B.target();
    display_notice("[basher] ON: " + B.main().name.toUpperCase() + " on " + (bsT.tar || "your target")
      + " whenever you have balance and equilibrium" + (bsT.why ? " (now: " + bsT.why + ")" : "") + ". BASHER OFF or BASHER STOP stops it.", "lime");
  }
} else if (bsSub === "off" || bsSub === "stop") {
  var bsWas = B.on;
  B.stop();
  display_notice(bsWas ? "[basher] OFF." : "[basher] already OFF.", bsWas ? "lime" : "cyan");
} else if (bsSub === "health") {
  var bsN = bsW[1];
  if (bsN === undefined || bsN === "") {
    display_notice("[basher] attacks hold below " + get_variable("basher_health") + "% health. BASHER HEALTH <0-90> to change it.", "cyan");
  } else if (/^\d+$/.test(bsN) && to_number(bsN) <= 90) {
    set_variable("basher_health", String(to_number(bsN)));
    B.low = false;
    display_notice("[basher] attacks hold below " + to_number(bsN) + "% health and resume at " + (to_number(bsN) + 10) + "%.", "lime");
  } else {
    display_notice("[basher] BASHER HEALTH <0-90>: the health percent attacks hold below.", "orange");
  }
} else {
  display_notice("[basher] unknown command '" + bsW.join(" ") + "'. BASHER HELP for commands.", "orange");
}
