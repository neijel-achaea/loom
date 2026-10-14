// defcon_edit -- the player's own changes to the current class's table,
// from D.edit = { verb, words, rest } (set by the DEFCON alias):
//   add <def> <tier> <priority> [relax | <off command>]
//   set <def> <tier> [priority]
//   remove <def>        reset <def>        reset all
//   init add <cmd>      init remove <cmd | number>
//   aftermorph add <cmd>   aftermorph remove <cmd | number>
// Only the changes are stored (defcon_custom, per table name), laid over
// the defaults by defcon_table. A change reaches curing at once at the
// current level, if one has been set in this class.
var D = client.loom.defcon;
var E = D.edit || {};
var C = "cyan";
var dcSay = (t, c) => display_notice("[defcon] " + t, c || C);
run_function("defcon_table", [], "defcon");
var dcOld = D.tbl;
var dcName = dcOld.name;
if (!D.custom[dcName]) D.custom[dcName] = {};
var M = D.custom[dcName];
if (!M.defs) M.defs = {};
var dcW = E.words || [];
var dcOk = false;

var dcFind = (n) => { for (var i = 0; i < dcOld.defs.length; i++) { if (dcOld.defs[i][0] === n) return dcOld.defs[i]; } return null; };
var dcInBase = (n) => { for (var i = 0; i < dcOld.base.defs.length; i++) { if (dcOld.base.defs[i][0] === n) return dcOld.base.defs[i]; } return null; };
var dcValidName = (n) => /^[a-z][a-z0-9_']*$/.test(n || "");

if (E.verb === "add") {
  // add <def> <tier> <priority> [relax | <off command>]
  var dcN = dcW[0], dcT = parseInt(dcW[1], 10), dcP = parseInt(dcW[2], 10);
  var dcRel = String(E.rest || "").replace(/^\s*\S+\s+\S+\s+\S+\s*/, "").replace(/^["']|["']$/g, "").trim();
  if (!dcValidName(dcN) || !(dcT >= 1 && dcT <= 5) || !(dcP >= 1 && dcP <= 25)) {
    dcSay("DEFCON ADD <defence> <tier 1-5> <priority 1-25> [RELAX | off command], e.g. DEFCON ADD toughness 4 10.", "orange");
  } else {
    var dcRow = [dcT, dcP];
    if (dcRel) dcRow.push(dcRel === "relax" ? true : dcRel);
    var dcBa = dcInBase(dcN);
    // The same as the default: nothing to store (an earlier change is undone).
    if (dcBa && JSON.stringify(dcBa.slice(1)) === JSON.stringify(dcRow)) delete M.defs[dcN];
    else M.defs[dcN] = dcRow;
    dcOk = true;
    dcSay(dcN + " added to " + dcName + " at tier " + dcT + ", priority " + dcP + (dcRel ? (dcRel === "relax" ? ", relaxed below it" : ", turned off with '" + dcRel + "' below it") : "") + ".");
  }
}
else if (E.verb === "set") {
  var dcN2 = dcW[0], dcT2 = parseInt(dcW[1], 10);
  var dcCur = dcFind(dcN2);
  var dcP2 = dcW[2] !== undefined ? parseInt(dcW[2], 10) : (dcCur ? dcCur[2] : NaN);
  if (!dcCur) {
    dcSay(dcN2 ? dcN2 + " isn't in the " + dcName + " table. DEFCON ADD adds one; DEFCON LIST shows them." : "DEFCON SET <defence> <tier 1-5> [priority 1-25].", "orange");
  } else if (!(dcT2 >= 1 && dcT2 <= 5) || !(dcP2 >= 1 && dcP2 <= 25)) {
    dcSay("DEFCON SET <defence> <tier 1-5> [priority 1-25].", "orange");
  } else {
    var dcRow2 = [dcT2, dcP2];
    if (dcCur[3]) dcRow2.push(dcCur[3]);
    var dcB = dcInBase(dcN2);
    // Back to exactly the default: no change left to store.
    if (dcB && JSON.stringify(dcB.slice(1)) === JSON.stringify(dcRow2)) delete M.defs[dcN2];
    else M.defs[dcN2] = dcRow2;
    dcOk = true;
    dcSay(dcN2 + " in " + dcName + ": tier " + dcT2 + ", priority " + dcP2 + ".");
  }
}
else if (E.verb === "remove") {
  var dcN3 = dcW[0];
  if (!dcN3) { dcSay("DEFCON REMOVE <defence>.", "orange"); }
  else if (!dcFind(dcN3)) { dcSay(dcN3 + " isn't in the " + dcName + " table.", "orange"); }
  else {
    // A default stays out (null); one the player added is simply forgotten.
    if (dcInBase(dcN3)) M.defs[dcN3] = null; else delete M.defs[dcN3];
    dcOk = true;
    dcSay(dcN3 + " removed from " + dcName + ". DEFCON RESET " + dcN3 + " brings the default back.");
  }
}
else if (E.verb === "reset") {
  var dcN4 = dcW[0];
  if (dcN4 === "all") {
    delete D.custom[dcName];
    M = null;
    dcOk = true;
    dcSay(dcName + " is back to the default table: all your changes for it are gone.");
  } else if (!dcN4) {
    dcSay("DEFCON RESET <defence>, or DEFCON RESET ALL for the whole " + dcName + " table.", "orange");
  } else if (!M.defs.hasOwnProperty(dcN4)) {
    dcSay(dcN4 + " has no change of yours in " + dcName + ".", "orange");
  } else {
    delete M.defs[dcN4];
    dcOk = true;
    dcSay(dcN4 + " in " + dcName + " is back to " + (dcInBase(dcN4) ? "the default." : "not being kept (it isn't a default)."));
  }
}
else if (E.verb === "init" || E.verb === "aftermorph") {
  // init|aftermorph add <cmd> / remove <cmd | number from DEFCON LIST>
  var dcKey = E.verb;
  var dcBaseList = dcKey === "init" ? dcOld.base.init : dcOld.base.aftermorph;
  var dcList = dcKey === "init" ? dcOld.init : dcOld.aftermorph;
  var dcLabel = dcKey === "init" ? "DEFCON INIT" : "after the morph";
  var dcOp = dcW[0];
  var dcCmd = String(E.rest || "").replace(/^\s*\S+\s*/, "").trim();
  if (!M[dcKey]) M[dcKey] = { add: [], remove: [] };
  var L = M[dcKey];
  if (dcOp === "add" && dcCmd) {
    var dcRmAt = L.remove.indexOf(dcCmd);
    if (dcRmAt >= 0) L.remove.splice(dcRmAt, 1);
    else if (dcList.indexOf(dcCmd) < 0) L.add.push(dcCmd);
    dcOk = true;
    dcSay("'" + dcCmd + "' sent " + dcLabel + " for " + dcName + ".");
  } else if (dcOp === "remove" && dcCmd) {
    if (/^\d+$/.test(dcCmd)) dcCmd = dcList[parseInt(dcCmd, 10) - 1] || dcCmd;
    if (dcList.indexOf(dcCmd) < 0) {
      dcSay("'" + dcCmd + "' isn't sent " + dcLabel + " for " + dcName + ". DEFCON LIST numbers them.", "orange");
    } else {
      var dcAddAt = L.add.indexOf(dcCmd);
      if (dcAddAt >= 0) L.add.splice(dcAddAt, 1);
      if (dcBaseList.indexOf(dcCmd) >= 0 && L.remove.indexOf(dcCmd) < 0) L.remove.push(dcCmd);
      dcOk = true;
      dcSay("'" + dcCmd + "' no longer sent " + dcLabel + " for " + dcName + ".");
    }
  } else {
    dcSay("DEFCON " + dcKey.toUpperCase() + " ADD <command>, or DEFCON " + dcKey.toUpperCase() + " REMOVE <command | number from DEFCON LIST>.", "orange");
  }
  if (L.add.length === 0 && L.remove.length === 0) delete M[dcKey];
}

if (dcOk) {
  // Tidy: drop an empty entry, then save.
  if (M) {
    var dcEmpty = true;
    for (var dcX in M.defs) { if (M.defs.hasOwnProperty(dcX)) dcEmpty = false; }
    if (dcEmpty) delete M.defs;
    if (!M.defs && !M.init && !M.aftermorph) delete D.custom[dcName];
  }
  set_variable("defcon_custom", JSON.stringify(D.custom));

  // Bring curing in line at the current level: compare old and new tables.
  run_function("defcon_table", [], "defcon");
  var dcLvl = D.level;
  if (dcLvl !== undefined && dcLvl !== null) {
    var dcNew = D.tbl, dcNames = {}, dcQ = [];
    var dcRowOf = (t, n) => { for (var i = 0; i < t.defs.length; i++) { if (t.defs[i][0] === n) return t.defs[i]; } return null; };
    for (var dcI2 = 0; dcI2 < dcOld.defs.length; dcI2++) dcNames[dcOld.defs[dcI2][0]] = true;
    for (var dcI3 = 0; dcI3 < dcNew.defs.length; dcI3++) dcNames[dcNew.defs[dcI3][0]] = true;
    for (var dcD in dcNames) {
      if (!dcNames.hasOwnProperty(dcD)) continue;
      var dcO = dcRowOf(dcOld, dcD), dcNw = dcRowOf(dcNew, dcD);
      var dcWas = !!(dcO && dcO[1] >= dcLvl), dcIs = !!(dcNw && dcNw[1] >= dcLvl);
      if (dcIs && (!dcWas || dcO[2] !== dcNw[2])) dcQ.push("curing priority defence " + dcD + " " + dcNw[2]);
      else if (!dcIs && dcWas) {
        dcQ.push("curing priority defence " + dcD + " reset");
        var dcRx = dcO[3];
        if (dcRx) dcQ.push(typeof dcRx == "string" ? dcRx : "relax " + dcD);
      }
    }
    if (dcQ.length) {
      D.queue = (D.queue || []).concat(dcQ);
      if (!D.timer) run_function("defcon_drain", [], "defcon");
    }
  }
}
