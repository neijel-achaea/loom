// HUNTSTATS [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.huntstats || !client.loom.huntstats.xpTable) run_function("huntstats_setup", [], "huntstats");
var HS = client.loom.huntstats;
var hsW = String(args[1] || "").trim().toLowerCase().split(/\s+/);
var hsSub = hsW[0];
var hsP1 = hsW[1] || "";
function hsSay(t, col) { display_notice("[huntstats] " + t, col || "cyan"); }

if (hsSub === "" || hsSub === "status") {
  run_function("huntstats_status", [], "huntstats");
} else if (hsSub === "help") {
  run_function("huntstats_help", [], "huntstats");
} else if (hsSub === "areas") {
  var areas = {};
  try { areas = JSON.parse(get_variable("huntstats_areas")) || {}; } catch (e) { areas = {}; }
  var arr = [];
  for (var k in areas) {
    if (areas.hasOwnProperty(k)) {
      var a = areas[k]; var hrs = a.ms / 3600000;
      arr.push({ area: k, xpHr: hrs > 0 ? Math.round(a.xp / hrs) : 0, goldHr: hrs > 0 ? Math.round(a.gold / hrs) : 0, sessions: a.sessions, ms: a.ms });
    }
  }
  if (arr.length === 0) { hsSay("no area history yet", "cyan"); }
  else {
    arr.sort(function (x, y) { return y.ms - x.ms; });
    hsSay("areas by total time (lifetime):", "cyan");
    for (var j = 0; j < arr.length; j++) {
      var r = arr[j];
      display_notice("  " + r.area + " - " + r.xpHr.toLocaleString() + " xp/hr, " + r.goldHr.toLocaleString() + " gold/hr (" + r.sessions + " hunt" + (r.sessions === 1 ? "" : "s") + ", " + HS.dur(r.ms) + ")");
    }
  }
} else if (hsSub === "log") {
  var log = [];
  try { log = JSON.parse(get_variable("huntstats_log")) || []; } catch (e) { log = []; }
  if (log.length === 0) { hsSay("no hunts logged yet", "cyan"); }
  else {
    hsSay("last " + log.length + " hunt" + (log.length === 1 ? "" : "s") + ":", "cyan");
    for (var i = 0; i < log.length; i++) {
      var s = log[i];
      var pl = (s.players && s.players.length) ? ("  party: " + s.players.join(", ")) : "";
      var dg = (s.dGain !== null && s.dGain !== undefined && s.dGain !== 0) ? ("  " + (s.dGain < 0 ? "" : "+") + s.dGain.toFixed(3) + "% dragon") : "";
      display_notice("  " + s.area + " - " + HS.dur(s.ms) + ", " + s.xp.toLocaleString() + " xp (" + s.xpHr.toLocaleString() + "/hr), " + s.gold.toLocaleString() + " gold, " + s.kills + " kills" + dg + pl);
    }
  }
} else if (hsSub === "flush") {
  var hsHad = HS.cur && HS.cur.firstXpAt && HS.cur.xp > 0;
  var hsLong = hsHad && (HS.cur.lastXpAt - HS.cur.firstXpAt) >= 60000;
  run_function("huntstats_finalize", [], "huntstats");
  if (hsLong) hsSay("hunt filed", "lime");
  else if (hsHad) hsSay("under a minute of experience, so nothing was filed; counters reset.", "cyan");
  else hsSay("no hunt under way.", "orange");
} else if (hsSub === "wipe") {
  if (hsP1 === "confirm") {
    set_variable("huntstats_areas", "{}");
    set_variable("huntstats_log", "[]");
    run_function("huntstats_render", [], "huntstats");
    hsSay("all area records and the log wiped", "orange");
  } else {
    hsSay("this clears ALL area records and the hunt log. HUNTSTATS WIPE CONFIRM to proceed.", "orange");
  }
} else if (hsSub === "debug") {
  var T = HS.cur || {};
  hsSay("level=" + HS.level + " nl=" + HS.nl + " dragon=" + (HS.dragon() === null ? "?" : HS.dragon().toFixed(3)) + " resumed=" + !!HS.resumed);
  hsSay("area=" + T.area + " xp=" + T.xp + " gold=" + T.gold + " kills=" + T.kills + " firstXpAt=" + T.firstXpAt + " lastXpAt=" + T.lastXpAt + " players=" + Object.keys(T.players || {}).join(","));
} else {
  hsSay("unknown command '" + hsSub + "'. HUNTSTATS HELP for commands.", "orange");
}
