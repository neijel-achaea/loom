// TALPIECES [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
var tpRaw = String(args[1] || "").trim();
var tpW = tpRaw.toLowerCase().split(/\s+/);
var tpSub = tpW[0];
var tpArg = tpW[1] || "";
var C = "cyan";
if (tpSub === "" || tpSub === "status") {
  run_function("talpieces_status", [], "talpieces");
} else if (tpSub === "help") {
  run_function("talpieces_help", [], "talpieces");
} else if (tpSub === "need") {
  run_function("talpieces_sync", [], "talpieces");
  run_function("talpieces_need", [], "talpieces");
} else if (tpSub === "rate") {
  run_function("talpieces_rate", [], "talpieces");
} else if (tpSub === "mark") {
  TP.forceMark = true;
  run_function("talpieces_sync", [], "talpieces");
  display_notice("[talpieces] history point recorded (" + (TP.nowC + TP.nowR) + " pieces).", C);
} else if (tpSub === "graph") {
  if (tpArg === "on" || tpArg === "off") {
    TP.graphOn = (tpArg === "on");
  } else if (/^\d+$/.test(tpArg)) {
    var tpV = parseInt(tpArg, 10);
    if (tpV < 40 || tpV > 400) {
      display_notice("[talpieces] pick a graph height between 40 and 400 (default 110, lower is flatter).", "yellow");
      tpV = 0;
    }
    if (tpV) { TP.chartH = tpV; set_variable("talpieces_graph_h", String(tpV)); }
  } else if (tpArg === "") {
    TP.graphOn = !TP.graphOn;
  } else {
    display_notice("[talpieces] TALPIECES GRAPH [ON|OFF|<height 40-400>].", "orange");
  }
  set_variable("talpieces_graph", TP.graphOn ? "on" : "off");
  run_function("talpieces_render", [], "talpieces");
  display_notice("[talpieces] panel graph " + (TP.graphOn ? "shown" : "hidden") + ", " + TP.chartH + "px high.", C);
} else if (tpSub === "seed") {
  var tpM = tpRaw.match(/^\S+\s+(\d{4})-(\d{1,2})-(\d{1,2})(?:\s+(\d+))?(?:\s+(\d+))?\s*$/);
  if (!tpM) {
    display_notice("[talpieces] TALPIECES SEED YYYY-MM-DD [common] [rare]: backdates a starting point for the graph.", "orange");
  } else {
    TP.seed = { y: parseInt(tpM[1], 10), m: parseInt(tpM[2], 10), d: parseInt(tpM[3], 10), c: tpM[4] ? parseInt(tpM[4], 10) : 0, r: tpM[5] ? parseInt(tpM[5], 10) : 0 };
    run_function("talpieces_seed", [], "talpieces");
  }
} else if (tpSub === "csv") {
  var hs = TP.hist || [];
  var tpStart = hs.length > 300 ? hs.length - 300 : 0;
  if (tpStart > 0) display_notice("[talpieces] showing the most recent 300 of " + hs.length + " points.", "yellow");
  display_notice("date,unix,common,rare,total", "white");
  for (var tpI = tpStart; tpI < hs.length; tpI++) {
    var tpD = new Date(hs[tpI][0] * 1000);
    var tpMm = tpD.getMonth() + 1;
    var tpDd = tpD.getDate();
    var tpIso = tpD.getFullYear() + "-" + (tpMm < 10 ? "0" : "") + tpMm + "-" + (tpDd < 10 ? "0" : "") + tpDd;
    display_notice(tpIso + "," + hs[tpI][0] + "," + hs[tpI][1] + "," + hs[tpI][2] + "," + (hs[tpI][1] + hs[tpI][2]), "white");
  }
} else if (tpSub === "combine") {
  if (tpArg === "on" || tpArg === "off") set_variable("talpieces_combine", tpArg);
  display_notice("[talpieces] combine " + String(get_variable("talpieces_combine")).toUpperCase() + ": "
    + (get_variable("talpieces_combine") === "off" ? "listing your pieces leaves them as they are." : "listing your pieces queues TALISMAN COMBINE for each row."), C);
} else if (tpSub === "wipe") {
  var tpConfirm = (tpW[2] === "confirm");
  if (tpArg === "pieces") {
    if (tpConfirm) {
      TP.reset();
      run_function("talpieces_sync", [], "talpieces");
      display_notice("[talpieces] all tracked pieces wiped. List your pieces in game to rebuild them.", "red");
    } else {
      display_notice("[talpieces] this clears ALL tracked pieces. TALPIECES WIPE PIECES CONFIRM to proceed.", "yellow");
    }
  } else if (tpArg === "history") {
    if (tpConfirm) {
      TP.hist = [];
      set_variable("talpieces_hist", "[]");
      run_function("talpieces_render", [], "talpieces");
      display_notice("[talpieces] progress history cleared. Piece counts are untouched.", "red");
    } else {
      display_notice("[talpieces] this clears the progress GRAPH history only, not your pieces. TALPIECES WIPE HISTORY CONFIRM to proceed.", "yellow");
    }
  } else {
    display_notice("[talpieces] TALPIECES WIPE PIECES|HISTORY [CONFIRM].", "orange");
  }
} else if (tpSub === "reset") {
  TP.pieces = null;
  TP.hist = null;
  run_function("talpieces_setup", [], "talpieces");
  run_function("talpieces_render", [], "talpieces");
  display_notice("[talpieces] reloaded from saved variables.", C);
} else if (tpSub === "debug") {
  display_notice("[talpieces] building=" + TP.building + " graphOn=" + TP.graphOn + " chartH=" + TP.chartH + " hist=" + (TP.hist ? TP.hist.length : 0)
    + " combine=" + get_variable("talpieces_combine") + " pieces=" + JSON.stringify(TP.pieces), C);
} else {
  display_notice("[talpieces] unknown command '" + tpSub + "'. TALPIECES HELP for commands.", "orange");
}
