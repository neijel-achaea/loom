// LEVELGRAPH [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.levelgraph || !client.loom.levelgraph.day) run_function("levelgraph_setup", [], "levelgraph");
var LG = client.loom.levelgraph;
var lgW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
var lgSub = lgW[0];
var lgP1 = lgW[1] || "";
var lgP2 = lgW[2] || "";
var C = "cyan";
function lgSay(t, col) { display_notice("[levelgraph] " + t, col || C); }

if (lgSub === "" || lgSub === "status" || lgSub === "rate") {
  run_function("levelgraph_rate", [], "levelgraph");
} else if (lgSub === "help") {
  run_function("levelgraph_help", [], "levelgraph");
} else if (lgSub === "mark") {
  LG.forceMark = true;
  run_function("levelgraph_sample", [], "levelgraph");
  if (!(LG.level > 0)) lgSay("no level reading yet, so nothing was recorded. It arrives with the next prompt.", "orange");
  else lgSay("sample recorded. Session buffer " + LG.min.length + " point(s), long term " + LG.day.length + " day(s).");
} else if (lgSub === "graph") {
  var which = lgP1;
  var mode = lgP2;
  if (which === "on" || which === "off") { mode = which; which = ""; }
  if (which === "" || which === "session") {
    LG.graphSess = mode === "on" ? true : (mode === "off" ? false : !LG.graphSess);
    set_variable("levelgraph_graph_sess", LG.graphSess ? "1" : "0");
  }
  if (which === "" || which === "long") {
    LG.graphLong = mode === "on" ? true : (mode === "off" ? false : !LG.graphLong);
    set_variable("levelgraph_graph_long", LG.graphLong ? "1" : "0");
  }
  run_function("levelgraph_render", [], "levelgraph");
  lgSay("session graph " + (LG.graphSess ? "shown" : "hidden") + ", long-term graph " + (LG.graphLong ? "shown" : "hidden") + ".");
} else if (lgSub === "size") {
  var lgV = parseInt(lgP1, 10) || 0;
  if (!lgV) { lgSay("graph height is " + LG.chartH + ". LEVELGRAPH SIZE 40-400 (default 105), applies to both graphs."); }
  else if (lgV < 40 || lgV > 400) { lgSay("pick a height between 40 and 400.", "yellow"); }
  else {
    LG.chartH = lgV;
    set_variable("levelgraph_graph_h", String(lgV));
    run_function("levelgraph_render", [], "levelgraph");
    lgSay("graph height set to " + lgV + ".");
  }
} else if (lgSub === "span") {
  var lgS = parseInt(lgP2, 10) || 0;
  if (lgP1 !== "session" && lgP1 !== "long") { lgSay("windows: session " + LG.mins + " min, long " + LG.days + " days. LEVELGRAPH SPAN SESSION 15-720 | LEVELGRAPH SPAN LONG 7-365."); }
  else if (!lgS) { lgSay(lgP1 + " window is " + (lgP1 === "session" ? LG.mins + " minutes" : LG.days + " days") + "."); }
  else if (lgP1 === "session" && (lgS < 15 || lgS > 720)) { lgSay("session window must be 15-720 minutes.", "yellow"); }
  else if (lgP1 === "long" && (lgS < 7 || lgS > 365)) { lgSay("long window must be 7-365 days.", "yellow"); }
  else {
    if (lgP1 === "session") { LG.mins = lgS; set_variable("levelgraph_span_mins", String(lgS)); }
    else { LG.days = lgS; set_variable("levelgraph_span_days", String(lgS)); }
    run_function("levelgraph_render", [], "levelgraph");
    lgSay(lgP1 + " window set to " + lgS + (lgP1 === "session" ? " minutes." : " days.") + " Points beyond it drop off at the next sample.");
  }
} else if (lgSub === "csv") {
  var lgWhich = lgP1 === "session" ? "session" : "long";
  var hs = (lgWhich === "session") ? (LG.min || []) : (LG.day || []);
  lgSay(lgWhich + " buffer, " + hs.length + " point(s):");
  display_notice("datetime,unix,level,nl,progress", "white");
  for (var i = 0; i < hs.length; i++) {
    var d = new Date(hs[i][0] * 1000);
    var mm = d.getMonth() + 1, dd = d.getDate(), hh = d.getHours(), mi = d.getMinutes();
    var iso = d.getFullYear() + "-" + (mm < 10 ? "0" : "") + mm + "-" + (dd < 10 ? "0" : "") + dd + " " + (hh < 10 ? "0" : "") + hh + ":" + (mi < 10 ? "0" : "") + mi;
    display_notice(iso + "," + hs[i][0] + "," + hs[i][1] + "," + hs[i][2] + "," + (Math.round((hs[i][1] + hs[i][2] / 100) * 100) / 100), "white");
  }
} else if (lgSub === "wipe") {
  if (lgP1 === "confirm") {
    LG.min = [];
    LG.day = [];
    set_variable("levelgraph_min", "[]");
    set_variable("levelgraph_day", "[]");
    run_function("levelgraph_render", [], "levelgraph");
    lgSay("both level buffers cleared.", "red");
  } else {
    lgSay("this clears BOTH the session and long-term buffers. LEVELGRAPH WIPE CONFIRM to proceed.", "yellow");
  }
} else if (lgSub === "debug") {
  lgSay("level=" + LG.level + " nl=" + LG.nl + " min=" + LG.min.length + " day=" + LG.day.length + " graphs " + LG.graphSess + "/" + LG.graphLong + " height " + LG.chartH + " spans " + LG.mins + "m/" + LG.days + "d");
} else {
  lgSay("unknown command '" + lgSub + "'. LEVELGRAPH HELP for commands.", "orange");
}
