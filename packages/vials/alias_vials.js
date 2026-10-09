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
  if (!viK.length) viSay("no vials set yet. VIALS SET <elixir> <vial number> [<elixir> <vial number> ...].", "orange");
  else {
    // A monospace block through nexusclient.add_html_line when this Nexus has
    // it, so the columns line up; otherwise plain notices.
    viSay(viK.length + " vial" + (viK.length === 1 ? "" : "s") + ":");
    var viHtml = (typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function");
    var viRows = [];
    for (var viI = 0; viI < viK.length; viI++) {
      var viName = (viK[viI] + "              ").slice(0, 13);
      if (viHtml) viRows.push('  <span style="color:#00ffff">' + viName + '</span><span style="color:#9fc9c9">vial' + VI.map[viK[viI]] + '</span>');
      else display_notice("  " + viName + "vial" + VI.map[viK[viI]], "cyan");
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
    if (viSet.length) viSay("set: " + viSet.join(", ") + ".");
    if (viBad.length) viSay("not understood: " + viBad.join(", ") + ".", "orange");
  }
} else if (viSub === "forget") {
  var viF = viW[1] || "";
  if (!VI.map[viF]) viSay("no vial set for '" + viF + "'.", "orange");
  else { delete VI.map[viF]; viSave(); viSay(viF + " forgotten."); }
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
  viSay("map=" + JSON.stringify(VI.map) + " saved=" + get_variable("vials_map") + " pause=" + (get_variable("pauseTriggers") || "unset"), "orange");
} else {
  viSay("unknown command '" + viSub + "'. VIALS HELP for commands.", "orange");
}
