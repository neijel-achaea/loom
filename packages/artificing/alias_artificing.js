// ARTIFICING [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.artificing || !client.loom.artificing.staffs) run_function("artificing_setup", [], "artificing");
var AR = client.loom.artificing;
var arW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
var arSub = arW[0];
var arP1 = arW[1] || "";
function arSay(t, c) { display_notice("[artificing] " + t, c || "cyan"); }
function arElement(ab) { for (var k in AR.staffs) { if (AR.staffs.hasOwnProperty(k) && AR.staffs[k] === ab) return k; } return ab; }

if (arSub === "" || arSub === "status") {
  arSay("staff attack: " + arElement(AR.staff) + " (" + AR.staff + ").");
  if (AR.treaty) {
    arSay("forming a treaty with the " + AR.treaty.elemental + " since " + Math.round((Date.now() - AR.treaty.at) / 1000) + "s ago: triggers paused, sipping off. ARTIFICING RESUME if it was interrupted.", "orange");
  } else if (get_variable("pauseTriggers") === "on") {
    arSay("triggers are paused. ARTIFICING RESUME unpauses them and turns sipping back on.", "orange");
  }
  arSay("ARTIFICING HELP for commands.");
} else if (arSub === "help") {
  run_function("artificing_help", [], "artificing");
} else if (arSub === "staff") {
  if (!arP1) {
    arSay("staff attack: " + arElement(AR.staff) + " (" + AR.staff + "). ARTIFICING STAFF FIRE, FROST or LIGHTNING.");
  } else if (!AR.staffs[arP1]) {
    arSay("pick FIRE, FROST or LIGHTNING.", "orange");
  } else {
    AR.staff = AR.staffs[arP1];
    set_variable("artificing_staff", AR.staff);
    // hunting, when installed, puts it on its staff key with the next prompt.
    arSay("staff attack: " + arP1 + " (" + AR.staff + ").");
  }
} else if (arSub === "treaty" || arSub === "tf") {
  if (AR.elementals.indexOf(arP1) < 0) {
    arSay("a treaty can be formed with: " + AR.elementals.join(", ").toUpperCase() + ". ARTIFICING TREATY <elemental>.", "orange");
  } else {
    // The communion breaks if anything else is sent, so everything that
    // follows pauseTriggers holds back, and curing stops sipping.
    AR.treaty = { elemental: arP1, at: Date.now() };
    set_variable("pauseTriggers", "on");
    send_command("curing sipping off");
    send_command("treaty form " + arP1);
  }
} else if (arSub === "resume") {
  run_function("artificing_resume", [], "artificing");
  arSay("triggers unpaused and sipping on.");
} else if (arSub === "debug") {
  arSay("staff=" + AR.staff + " treaty=" + JSON.stringify(AR.treaty) + " pause=" + (get_variable("pauseTriggers") || "unset") + " saved=" + get_variable("artificing_staff"), "orange");
} else {
  arSay("unknown command '" + arSub + "'. ARTIFICING HELP for commands.", "orange");
}
