// VIALS [subcommand ...]: refill vials from the rift, and which vial holds
// which elixir.
if (!client.loom || !client.loom.vials || !client.loom.vials.map) run_function("vials_setup", [], "vials");
var VI = client.loom.vials;
var viW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
var viSub = viW[0];
function viSay(t, c) { display_notice("[vials] " + t, c || "cyan"); }
function viKeys() { var a = []; for (var k in VI.map) { if (VI.map.hasOwnProperty(k)) a.push(k); } a.sort(); return a; }
function viSave() { set_variable("vials_map", JSON.stringify(VI.map)); }
function viFill(el) { send_command("fill vial" + VI.map[el] + " with " + el + " from rift"); }

if (viSub === "" || viSub === "list") {
  var viK = viKeys();
  if (!viK.length) viSay("no vials set yet. VIALS LEARN reads them from ELIXLIST, or VIALS SET <elixir> <vial number> [...].", "orange");
  else {
    // A monospace block through nexusclient.add_html_line when this Nexus has
    // it, so the columns line up; otherwise plain notices.
    viSay(viK.length + " vial" + (viK.length === 1 ? "" : "s") + ":");
    var viHtml = (typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function");
    var viRows = [];
    for (var viI = 0; viI < viK.length; viI++) {
      var viName = (viK[viI] + "              ").slice(0, 13);
      var viIn = (VI.info && VI.info[viK[viI]]) || null;
      var viVial = ("vial" + VI.map[viK[viI]] + "            ").slice(0, 12);
      var viMore = viIn ? viIn.sips + " sips" + (viIn.months !== null && viIn.months !== undefined ? ", decays in " + viIn.months + " months" : "") : "";
      if (viHtml) viRows.push('  <span style="color:#00ffff">' + viName + '</span><span style="color:#9fc9c9">' + viVial + '</span><span style="color:#7a9a9a">' + viMore + '</span>');
      else display_notice("  " + viName + viVial + viMore, "cyan");
    }
    if (viHtml) nexusclient.add_html_line('<span style="font-family:\'Courier New\',monospace;white-space:pre">' + viRows.join("\n") + '</span>');
  }
} else if (viSub === "help") {
  run_function("vials_help", [], "vials");
} else if (viSub === "set") {
  // Pairs: elixir vial [elixir vial ...]; "vial123" or "123" both work.
  var viP = viW.slice(1);
  if (viP.length < 2 || viP.length % 2) {
    viSay("VIALS SET <elixir> <vial number>, as many pairs as you like on one line.", "orange");
  } else {
    var viSet = [], viBad = [];
    for (var viJ = 0; viJ < viP.length; viJ += 2) {
      var viN = viP[viJ + 1].replace(/^vial/, "");
      if (/^\d+$/.test(viN) && /^[a-z]+$/.test(viP[viJ])) { VI.map[viP[viJ]] = viN; viSet.push(viP[viJ] + " vial" + viN); }
      else viBad.push(viP[viJ] + " " + viP[viJ + 1]);
    }
    viSave();
    if (viSet.length) viSay("set: " + viSet.join(", ") + ".", "lime");
    if (viBad.length) viSay("not understood: " + viBad.join(", ") + ".", "orange");
  }
} else if (viSub === "learn") {
  // VIALS LEARN (#106): send ELIXLIST and set the vials from its table. The
  // capture ends on the table's closing line (trigger_elixlist); a reply that
  // never comes is given up after 30s.
  if (get_variable("pauseTriggers") === "on") {
    viSay("triggers are paused, so nothing was sent.", "orange");
  } else {
    VI.learn = { stage: 0, rows: [] };
    clearTimeout(VI.learnT);
    VI.learnT = setTimeout(function () {
      if (client.loom.vials.learn) { client.loom.vials.learn = null; display_notice("[vials] no ELIXLIST table came back; nothing changed.", "orange"); }
    }, 30000);
    send_command("elixlist", 1);
  }
} else if (viSub === "forget") {
  var viF = viW[1] || "";
  if (!VI.map[viF]) viSay("no vial set for '" + viF + "'.", "orange");
  else { delete VI.map[viF]; if (VI.info) { delete VI.info[viF]; set_variable("vials_info", JSON.stringify(VI.info)); } viSave(); viSay(viF + " forgotten.", "lime"); }
} else if (viSub === "refill") {
  var viE = viW[1] || "";
  if (get_variable("pauseTriggers") === "on") {
    viSay("triggers are paused, so nothing was sent.", "orange");
  } else if (viE === "all") {
    var viA = viKeys();
    if (!viA.length) viSay("no vials set yet. VIALS SET <elixir> <vial number>.", "orange");
    for (var viL = 0; viL < viA.length; viL++) viFill(viA[viL]);
  } else if (VI.map[viE]) {
    viFill(viE);
  } else {
    viSay(viE ? "no vial set for '" + viE + "'. VIALS lists yours." : "VIALS REFILL <elixir> or VIALS REFILL ALL.", "orange");
  }
} else if (viSub === "debug") {
  viSay("map=" + JSON.stringify(VI.map) + " info=" + JSON.stringify(VI.info || {}) + " learning=" + (VI.learn ? "stage " + VI.learn.stage + ", " + VI.learn.rows.length + " rows" : "no") + " saved=" + get_variable("vials_map") + " pause=" + (get_variable("pauseTriggers") || "unset"), "cyan");
} else {
  viSay("unknown command '" + viSub + "'. VIALS HELP for commands.", "orange");
}
