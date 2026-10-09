// CONJURATION [<sigil> | subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.conjuration || !client.loom.conjuration.sigils) run_function("conjuration_setup", [], "conjuration");
var CJ = client.loom.conjuration;
var cjW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
var cjSub = cjW[0];
var cjP1 = cjW[1] || "";
function cjSay(t, c) { display_notice("[conjuration] " + t, c || "cyan"); }
function cjKnown() { var a = []; for (var k in CJ.sigils) { if (CJ.sigils.hasOwnProperty(k) && CJ.sigils[k].chant) a.push(k); } return a; }
function cjWhere() {
  if (!CJ.ouroboros) return "no ouroboros set: CONJURATION OUROBOROS <number> [<number the sigil is taken from>].";
  return "reagents go into ouroboros " + CJ.ouroboros + "; the sigil is taken from " + (CJ.sigilFrom ? "ouroboros " + CJ.sigilFrom : "the same one") + ".";
}
function cjAll() { var a = []; for (var k in CJ.sigils) { if (CJ.sigils.hasOwnProperty(k)) a.push(k); } return a; }
// MAKE is optional: CONJURATION FLAME and CONJURATION MAKE FLAME do the same.
if (cjSub === "make") { cjSub = cjP1; cjP1 = ""; }

if (cjSub === "" || cjSub === "status") {
  cjSay(cjWhere(), CJ.ouroboros ? "cyan" : "orange");
  if (CJ.run) {
    var cjS0 = CJ.run.steps[CJ.run.i];
    var cjCh = 0, cjChN = 0;
    for (var cjK = 0; cjK < CJ.run.steps.length; cjK++) { if (/^chant /.test(CJ.run.steps[cjK].cmd)) { cjChN++; if (cjK <= CJ.run.i) cjCh++; } }
    cjSay("making a " + CJ.run.sigil + " sigil: step " + (CJ.run.i + 1) + " of " + CJ.run.steps.length + " (" + cjS0.cmd + (/^chant /.test(cjS0.cmd) ? ", chant " + cjCh + " of " + cjChN : "") + "), " + ({ send: "sending", expect: "waiting for the game", bal: "waiting for balance", retry: "waiting to send it again", held: "held while triggers are paused" })[CJ.run.state] + ". CONJURATION STOP abandons it.");
  }
  cjSay("recipes known: " + cjKnown().join(", ") + ". CONJURATION <sigil> to make one; CONJURATION HELP for commands.");
} else if (cjSub === "help") {
  run_function("conjuration_help", [], "conjuration");
} else if (cjSub === "ouroboros") {
  var cjN = cjP1.replace(/^ouroboros/, "");
  var cjM = (cjW[2] || "").replace(/^ouroboros/, "");
  if (!cjN) {
    cjSay(cjWhere());
  } else if (!/^\d+$/.test(cjN) || (cjM && !/^\d+$/.test(cjM))) {
    cjSay("give the ouroboros numbers, e.g. CONJURATION OUROBOROS 263287, or 263287 275085 if the sigil appears in a second one.", "orange");
  } else {
    CJ.ouroboros = cjN;
    CJ.sigilFrom = (cjM && cjM !== cjN) ? cjM : "";
    set_variable("conjuration_ouroboros", cjN);
    if (CJ.sigilFrom) set_variable("conjuration_sigil_from", CJ.sigilFrom);
    else { try { delete_variable("conjuration_sigil_from"); } catch (e) {} }
    cjSay(cjWhere());
  }
} else if (cjSub === "stop") {
  if (!CJ.run) cjSay("no ritual under way.");
  else { CJ.failWhy = "stopped by you"; run_function("conjuration_fail", [], "conjuration"); }
} else if (cjSub === "list") {
  var cjL = cjAll();
  for (var cjI = 0; cjI < cjL.length; cjI++) {
    var cjS = CJ.sigils[cjL[cjI]];
    display_notice("  " + (cjL[cjI] + "              ").slice(0, 14) + cjS.name + (cjS.chant ? "" : "  (no recipe yet)"), cjS.chant ? "cyan" : "#889999");
  }
} else if (cjSub === "debug") {
  cjSay("ouroboros=" + CJ.ouroboros + " sigilFrom=" + CJ.sigilFrom + " saved=" + get_variable("conjuration_ouroboros") + "/" + get_variable("conjuration_sigil_from") + " pause=" + (get_variable("pauseTriggers") || "unset") + " known=" + cjKnown().join(",") + " run=" + (CJ.run ? CJ.run.sigil + " i=" + CJ.run.i + " state=" + CJ.run.state + " tries=" + CJ.run.tries + " prompts=" + CJ.run.prompts : "none"), "orange");
} else if (CJ.sigils[cjSub]) {
  var S = CJ.sigils[cjSub];
  if (!S.chant) {
    cjSay("insufficient skill to create " + S.name + ".", "orange");
  } else if (!CJ.ouroboros) {
    cjSay("set your ouroboros first: CONJURATION OUROBOROS <number>.", "orange");
  } else if (get_variable("pauseTriggers") === "on") {
    cjSay("triggers are paused, so nothing was sent.", "orange");
  } else if (CJ.run) {
    cjSay("a " + CJ.run.sigil + " ritual is under way. CONJURATION STOP to abandon it.", "orange");
  } else {
    // The ritual as steps: [command, the reply that confirms it (a regular
    // expression), whether it takes balance].
    var cjO = "ouroboros" + CJ.ouroboros;
    var cjSteps = [];
    for (var cjR = 0; cjR < S.reagents.length; cjR++) {
      cjSteps.push({ cmd: "outr " + (S.reagents[cjR][0] > 1 ? S.reagents[cjR][0] + " " : "") + S.reagents[cjR][1] });
    }
    for (var cjP = 0; cjP < S.reagents.length; cjP++) {
      for (var cjQ = 0; cjQ < S.reagents[cjP][0]; cjQ++) cjSteps.push({ cmd: "put " + S.reagents[cjP][1] + " in " + cjO });
    }
    cjSteps.push({ cmd: "begin creation of " + cjSub + " sigil", expect: "indicating that you may begin" });
    for (var cjC = 0; cjC < 3; cjC++) cjSteps.push({ cmd: "chant " + S.chant, expect: "^You chant, \"", bal: true });
    cjSteps.push({ cmd: "ring bell", expect: "as you ring a small silver bell", bal: true });
    cjSteps.push({ cmd: "end ritual", expect: "^The ouroboros flashes" });
    cjSteps.push({ cmd: "get sigil from ouroboros" + (CJ.sigilFrom || CJ.ouroboros), expect: "^You take .*sigil from" });
    CJ.run = { sigil: cjSub, steps: cjSteps, i: 0, state: "send", tries: 0, prompts: 0, sawLost: false };
    cjSay("making a " + cjSub + " sigil, one step at a time (" + cjSteps.length + " steps).");
    run_function("conjuration_step", [], "conjuration");
  }
} else {
  cjSay("unknown sigil or command '" + cjSub + "'. Sigils: " + cjAll().join(", ") + ". CONJURATION HELP for commands.", "orange");
}
