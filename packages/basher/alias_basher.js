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
  if (bsHu && bsHu.pk) {
    display_notice("[basher] PK MODE is on: it hunts denizens only. HUNTING PK OFF (or Ctrl+F12) first.", "orange");
  } else if (!bsHu) {
    display_notice("[basher] needs the hunting package: it takes the attack from there. Nothing sent.", "orange");
  } else if (!B.main()) {
    display_notice("[basher] no main attack for " + (bsHu.cls || "this class") + " in hunting. HUNTING MAIN lists them; nothing sent.", "orange");
  } else {
    B.start();
    display_notice("[basher] primed: attack something to start. It then keeps attacking your target with " + B.main().name.toUpperCase()
      + " on each recovery until the room runs out of it; BASHER STOP stops it.", "lime");
    // #120 (Ricardo): no check of the player's curing, which may be the
    // game's or their own client-side system; just a reminder on each ON.
    display_notice("[basher] reminder: Loom has no client-side curing. Turn on the game's server-side curing (CURING ON), or use your own curing system.", "cyan");
  }
} else if (bsSub === "off" || bsSub === "stop") {
  var bsWas = B.on;
  B.stop();
  display_notice(bsWas ? "[basher] OFF." : "[basher] already OFF.", bsWas ? "lime" : "cyan");
} else if (bsSub === "end") {
  // End the run at once but stay primed (F1's STOP key while a run lasts,
  // Ricardo): nothing more is sent until your next attack starts a new run.
  if (!B.on) display_notice("[basher] OFF: no run to end.", "cyan");
  else if (!B.run) display_notice("[basher] primed, no run to end.", "cyan");
  else { B.fleeing = null; B.rageSent = null; B.diag = false; B.end("run ended by hand"); }
} else if (bsSub === "wimpy") {
  var bsK = bsW[1] || "";
  var bsV = bsW[2] || "";
  var bsVars = { health: "basher_flee_health", mana: "basher_flee_mana" };
  if (bsK === "") {
    display_notice("[basher] wimpy: " + B.wimpyText() + ". BASHER WIMPY HEALTH|MANA <1-90|OFF>, BASHER WIMPY DIR <direction|OFF>.", "cyan");
  } else if (bsVars[bsK] && (bsV === "off" || (/^\d+$/.test(bsV) && to_number(bsV) >= 1 && to_number(bsV) <= 90))) {
    set_variable(bsVars[bsK], bsV === "off" ? "0" : String(to_number(bsV)));
    display_notice("[basher] wimpy: " + B.wimpyText() + ".", "lime");
  } else if (bsK === "dir" && /^[a-z]+$/.test(bsV)) {
    set_variable("basher_flee_dir", bsV === "off" ? "" : bsV);
    display_notice("[basher] wimpy: " + B.wimpyText() + ".", "lime");
  } else {
    display_notice("[basher] BASHER WIMPY HEALTH|MANA <1-90|OFF>, or BASHER WIMPY DIR <direction|OFF>.", "orange");
  }
} else if (bsSub === "raze") {
  var bsZ = bsW[1];
  var bsRz = B.razeCmd();
  if (!bsRz && B.razeAttack()) bsRz = { name: B.razeAttack().name + " (needs dragonbreath)", cost: 0 };
  if (bsZ === "on" || bsZ === "off") {
    set_variable("basher_raze", bsZ);
    display_notice("[basher] raze " + bsZ.toUpperCase() + (bsZ === "on" ? (bsRz ? ": " + bsRz.name + " on a shielded target." : ", but this class has no raze key: it waits for shields to fade.") : ": it waits for shields to fade."), "lime");
  } else {
    display_notice("[basher] raze " + String(get_variable("basher_raze")).toUpperCase() + (bsRz ? " with " + bsRz.name + (bsRz.cost ? " (" + bsRz.cost + " rage)" : "") : " (no raze key for this class)") + ". BASHER RAZE ON|OFF.", "cyan");
  }
} else if (bsSub === "interrupt" || bsSub === "interruptions") {
  var bsI = bsW[1];
  if (bsI === "on" || bsI === "off") {
    set_variable("basher_interrupt", bsI);
    display_notice("[basher] interruptions " + bsI.toUpperCase() + (bsI === "on" ? ": another player arriving, a tell to you or your city channel naming you makes the fight in progress the last." : ": players arriving, tells and your city channel no longer stop a run" + (client.loom.loom && client.loom.loom.linkOn && client.loom.loom.linkOn("social-basher") ? "; enemies still do (LOOM LINK social-basher)." : ".")), "lime");
  } else {
    display_notice("[basher] interruptions " + (B.interrupts() ? "ON: another player arriving, a tell to you or your city channel naming you makes the fight in progress the last." : "OFF: players arriving, tells and your city channel don't stop a run.") + " BASHER INTERRUPT ON|OFF.", "cyan");
  }
} else if (bsSub === "rage") {
  var bsR = bsW[1];
  if (bsR === "on" || bsR === "off") {
    set_variable("basher_rage", bsR);
    B.rageSent = null;
    display_notice("[basher] battlerage " + bsR.toUpperCase() + (bsR === "on" ? ": " + B.rotationText() + "." : ": the basher fires none; your keys still work."), "lime");
  } else {
    display_notice("[basher] battlerage " + String(get_variable("basher_rage")).toUpperCase() + ", in this order: " + B.rotationText() + ". BASHER RAGE ON|OFF.", "cyan");
  }
} else if (bsSub === "debug") {
  // BASHER DEBUG (#137): the state a run decides on, on two lines.
  var bsT = {};
  try { bsT = B.target() || {}; } catch (e) { bsT = { why: "target() threw: " + e }; }
  var bsN = function (o) { var a = []; for (var k in o) { if (o.hasOwnProperty(k)) a.push(k); } return a.join(",") || "none"; };
  display_notice("[basher] on=" + !!B.on + " run=" + !!B.run + " loop=" + (B.loop ? "set" : "none") + " bal=" + B.bal + " eq=" + B.eq
    + " target=" + (bsT.tar || "none") + (bsT.name ? " (" + bsT.name + ")" : "") + " why='" + (bsT.why || B.why || "") + "' lastFight=" + (B.lastFight ? JSON.stringify(B.lastFight) : "none")
    + " misses=" + B.misses + " fleeing=" + (B.fleeing ? JSON.stringify(B.fleeing) : "none") + " pause=" + (get_variable("pauseTriggers") === "on" ? "on" : "off"), "cyan");
  display_notice("[basher] area=" + (B.area || "?") + " room=" + (B.roomNum || "?") + (B.roomKnown ? "" : " (unknown)") + " players=" + bsN(B.players || {})
    + " shields=" + bsN(B.shields) + " affs=" + JSON.stringify(B.affs) + " rageSent=" + (B.rageSent ? JSON.stringify(B.rageSent) : "none")
    + " razeAt=" + (B.razeAt ? Math.round((Date.now() - B.razeAt) / 1000) + "s ago" : "never") + " game=" + (B.game ? B.game.id + " " + B.game.name : "none") + " autoTop='" + (B.autoTop || "") + "'", "cyan");
} else {
  display_notice("[basher] unknown command '" + bsW.join(" ") + "'. BASHER HELP for commands.", "orange");
}
