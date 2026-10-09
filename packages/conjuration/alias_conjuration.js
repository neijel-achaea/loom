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
} else if (cjSub === "list") {
  var cjL = cjAll();
  for (var cjI = 0; cjI < cjL.length; cjI++) {
    var cjS = CJ.sigils[cjL[cjI]];
    display_notice("  " + (cjL[cjI] + "              ").slice(0, 14) + cjS.name + (cjS.chant ? "" : "  (no recipe yet)"), cjS.chant ? "cyan" : "#889999");
  }
} else if (cjSub === "debug") {
  cjSay("ouroboros=" + CJ.ouroboros + " sigilFrom=" + CJ.sigilFrom + " saved=" + get_variable("conjuration_ouroboros") + "/" + get_variable("conjuration_sigil_from") + " pause=" + (get_variable("pauseTriggers") || "unset") + " known=" + cjKnown().join(","), "orange");
} else if (CJ.sigils[cjSub]) {
  var S = CJ.sigils[cjSub];
  if (!S.chant) {
    cjSay("insufficient skill to create " + S.name + ".", "orange");
  } else if (!CJ.ouroboros) {
    cjSay("set your ouroboros first: CONJURATION OUROBOROS <number>.", "orange");
  } else if (get_variable("pauseTriggers") === "on") {
    cjSay("triggers are paused, so nothing was sent.", "orange");
  } else {
    var cjO = "ouroboros" + CJ.ouroboros;
    for (var cjR = 0; cjR < S.reagents.length; cjR++) {
      send_command("outr " + (S.reagents[cjR][0] > 1 ? S.reagents[cjR][0] + " " : "") + S.reagents[cjR][1]);
    }
    for (var cjP = 0; cjP < S.reagents.length; cjP++) {
      for (var cjQ = 0; cjQ < S.reagents[cjP][0]; cjQ++) send_command("put " + S.reagents[cjP][1] + " in " + cjO);
    }
    send_command("begin creation of " + cjSub + " sigil");
    for (var cjC = 0; cjC < 3; cjC++) send_command("chant " + S.chant);
    send_command("ring bell");
    send_command("end ritual");
    send_command("get sigil from ouroboros" + (CJ.sigilFrom || CJ.ouroboros));
  }
} else {
  cjSay("unknown sigil or command '" + cjSub + "'. Sigils: " + cjAll().join(", ") + ". CONJURATION HELP for commands.", "orange");
}
