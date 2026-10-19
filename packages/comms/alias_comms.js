// COMMS [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.comms || !client.loom.comms.chans) run_function("comms_setup", [], "comms");
var C = client.loom.comms;
var cmArg = String(args[1] || "").trim();
var cmW = cmArg.toLowerCase().split(/\s+/);
var cmSub = cmW[0];
var cmRest = cmArg.replace(/^\S+\s*/, "");
function cmSay(t, c) { display_notice("[comms] " + t, c || "cyan"); }
// A channel from what was typed: its key, or the start of its name.
function cmFind(w) {
  w = String(w || "").toLowerCase().trim();
  if (!w) return "";
  if (w === "tell" || w === "tells") return "tells";
  if (w === "say" || w === "says") return "says";
  if (C.chans[w]) return w;
  for (var k in C.chans) { if (C.chans.hasOwnProperty(k) && C.name(k).toLowerCase().indexOf(w) === 0) return k; }
  for (var k2 in C.chans) { if (C.chans.hasOwnProperty(k2) && C.name(k2).toLowerCase().indexOf(w) >= 0) return k2; }
  return "";
}
var cmDraw = true;
if (cmSub === "" || cmSub === "status") {
  var cmL = [];
  for (var k in C.chans) {
    if (!C.chans.hasOwnProperty(k)) continue;
    cmL.push(C.name(k) + " " + C.chans[k].lines.length + (C.muted[k] ? " (muted)" : ""));
  }
  cmSay(cmL.length ? "heard: " + cmL.join(", ") + "." : "nothing heard yet.");
  cmSay("keeps " + C.cap + " lines a channel; showing " + (C.view === "all" ? "All" : C.view.indexOf("tell:") === 0 ? "tells with " + C.convs[C.view.slice(5)].name : C.name(C.view)) + ". COMMS HELP for commands.");
  cmDraw = false;
} else if (cmSub === "help") {
  run_function("comms_help", [], "comms");
  cmDraw = false;
} else if (cmSub === "mute" || cmSub === "unmute") {
  var cmK = cmFind(cmRest);
  if (!cmRest) {
    var cmMl = Object.keys(C.muted).map(function (x) { return C.name(x); });
    cmSay(cmMl.length ? "muted: " + cmMl.join(", ") + "." : "nothing muted. COMMS MUTE <channel> to mute one.");
    cmDraw = false;
  } else if (!cmK) {
    cmSay("no channel heard yet matches '" + cmRest + "'. COMMS lists the ones heard.", "orange");
    cmDraw = false;
  } else {
    run_function("comms_mute", { key: cmK, on: cmSub === "mute" }, "comms");
    cmDraw = false;
  }
} else if (cmSub === "view" || cmSub === "show") {
  var cmV = cmW[1] || "all";
  var cmT = cmV === "all" ? "all" : cmV === "clans" ? "clans" : (C.convs[cmV] ? "tell:" + cmV : cmFind(cmRest));
  if (!cmT) { cmSay("no channel or tell matches '" + cmRest + "'.", "orange"); cmDraw = false; }
  else { run_function("comms_view", { key: cmT }, "comms"); cmDraw = false; }
} else if (cmSub === "cap") {
  var cmN = parseInt(cmW[1], 10);
  if (cmN >= 50 && cmN <= 2000) {
    C.cap = cmN;
    set_variable("comms_cap", String(cmN));
    for (var kc in C.chans) { if (C.chans.hasOwnProperty(kc)) { while (C.chans[kc].lines.length > cmN) C.chans[kc].lines.shift(); } }
    cmSay("keeping " + cmN + " lines a channel now.", "lime");
  } else {
    cmSay("keeps " + C.cap + " lines a channel. COMMS CAP <50-2000> to change it.");
    cmDraw = false;
  }
} else if (cmSub === "clear") {
  if (!cmRest) {
    C.chans = {}; C.convs = {}; C.view = "all";
    cmSay("all lines cleared.", "lime");
  } else {
    var cmC = cmFind(cmRest);
    if (!cmC) { cmSay("no channel heard yet matches '" + cmRest + "'.", "orange"); cmDraw = false; }
    else {
      delete C.chans[cmC];
      if (cmC === "tells") C.convs = {};
      cmSay(C.name(cmC) + " cleared.", "lime");
    }
  }
  if (cmDraw) run_function("comms_save", [], "comms");
} else if (cmSub === "debug") {
  var cmRk = Object.keys(C.raw);
  if (!cmRk.length) cmSay("no comms GMCP seen yet.");
  for (var cmX = 0; cmX < cmRk.length; cmX++) {
    var cmS = JSON.stringify(C.raw[cmRk[cmX]]);
    cmSay(cmRk[cmX] + " " + (cmS.length > 600 ? cmS.slice(0, 600) + "…" : cmS), "orange");
  }
  cmSay("channels: " + (Object.keys(C.chans).join(", ") || "none") + "; me=" + (C.me || "?"), "orange");
  var cmIn = null;
  try { cmIn = window.loomComms && window.loomComms.input(); } catch (e) {}
  cmSay("input line for tells: " + (cmIn ? cmIn.tagName.toLowerCase() + (cmIn.id ? "#" + cmIn.id : "") + (cmIn.className ? "." + String(cmIn.className).split(" ").join(".") : "") : "not found"), "orange");
  cmDraw = false;
} else {
  cmSay("unknown command '" + cmSub + "'. COMMS HELP for commands.", "orange");
  cmDraw = false;
}
if (cmDraw) run_function("comms_render", [], "comms");
