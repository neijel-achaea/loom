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
} else if (bsSub === "wimpy" || bsSub === "health") {
  // BASHER HEALTH n (0.1) is read as BASHER WIMPY HEALTH n.
  var bsK = bsSub === "health" ? "health" : (bsW[1] || "");
  var bsV = bsSub === "health" ? (bsW[1] || "") : (bsW[2] || "");
  var bsVars = { health: "basher_flee_health", mana: "basher_flee_mana" };
  if (bsSub === "health") display_notice("[basher] BASHER HEALTH is now BASHER WIMPY HEALTH: the basher flees below it instead of holding.", "orange");
  if (bsK === "" || (bsSub === "health" && bsV === "")) {
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
  if (bsZ === "on" || bsZ === "off") {
    set_variable("basher_raze", bsZ);
    display_notice("[basher] raze " + bsZ.toUpperCase() + (bsZ === "on" ? (bsRz ? ": " + bsRz.name + " on a shielded target." : ", but this class has no raze key: it waits for shields to fade.") : ": it waits for shields to fade."), "lime");
  } else {
    display_notice("[basher] raze " + String(get_variable("basher_raze")).toUpperCase() + (bsRz ? " with " + bsRz.name + " (" + bsRz.cost + " rage)" : " (no raze key for this class)") + ". BASHER RAZE ON|OFF.", "cyan");
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
} else {
  display_notice("[basher] unknown command '" + bsW.join(" ") + "'. BASHER HELP for commands.", "orange");
}
