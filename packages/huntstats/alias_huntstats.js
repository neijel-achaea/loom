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
} else if (hsSub === "split") {
  // HUNTSTATS SPLIT [REPORT | TELL ON|OFF] (#89): the gold split of the hunt
  // under way; REPORT sends it to party tell now.
  if (hsP1 === "report") {
    if (!HS.split(true)) hsSay("nothing to report: no party or no gold this hunt.", "orange");
    else if (!HS.tellSplit()) hsSay("not sent: outgoing commands are paused.", "orange");
    else hsSay("split sent to party tell.", "lime");
  } else if (hsP1 === "tell") {
    var hsT = hsW[2] || "";
    if (hsT === "on" || hsT === "off") {
      HS.splitTell = (hsT === "on");
      set_variable("huntstats_splittell", hsT);
      hsSay("the split at the end of a party hunt " + (HS.splitTell ? "also goes to party tell" : "stays in your window") + ".", "lime");
    } else {
      hsSay("the split " + (HS.splitTell ? "goes to party tell too" : "stays in your window") + ". HUNTSTATS SPLIT TELL ON or OFF to change it.", "cyan");
    }
  } else {
    var hsSp = HS.split();
    if (!hsSp) hsSay(HS.cur && HS.cur.players && Object.keys(HS.cur.players).length ? "no gold picked up by the party this hunt yet." : "no party this hunt: HUNTSTATS PARTY ADD <name> first.", "cyan");
    else for (var hsSI = 0; hsSI < hsSp.length; hsSI++) hsSay(hsSp[hsSI], "cyan");
  }
} else if (hsSub === "party") {
  // HUNTSTATS PARTY [ADD <names> | DEL <names> | CLEAR] (#87): who you're
  // hunting with, by hand. Names take a capital letter whatever was typed.
  var hsNames = [];
  for (var hsK = 2; hsK < hsW.length; hsK++) {
    var hsNm = hsW[hsK].replace(/,/g, "");
    if (hsNm) hsNames.push(hsNm.charAt(0).toUpperCase() + hsNm.slice(1));
  }
  var hsBad = [];
  for (var hsB = 0; hsB < hsNames.length; hsB++) { if (!/^[A-Z][a-z]+$/.test(hsNames[hsB])) hsBad.push(hsNames[hsB]); }
  if (hsP1 === "" || hsP1 === "list") {
    hsSay(HS.party.length ? "party: " + HS.party.join(", ") + ". HUNTSTATS PARTY ADD/DEL <name> or CLEAR to change it." : "no party: you're hunting alone. HUNTSTATS PARTY ADD <name> to add someone.", "cyan");
  } else if ((hsP1 === "add" || hsP1 === "del" || hsP1 === "remove") && hsNames.length === 0) {
    hsSay("usage: HUNTSTATS PARTY " + (hsP1 === "add" ? "ADD" : "DEL") + " <name> [<name> ...]", "orange");
  } else if ((hsP1 === "add" || hsP1 === "del" || hsP1 === "remove") && hsBad.length) {
    hsSay("not a name: " + hsBad.join(", ") + " (letters only)", "orange");
  } else if (hsP1 === "add") {
    var hsAdded = [];
    for (var hsA1 = 0; hsA1 < hsNames.length; hsA1++) {
      if (HS.party.indexOf(hsNames[hsA1]) < 0) { HS.party.push(hsNames[hsA1]); hsAdded.push(hsNames[hsA1]); }
      if (HS.cur) { if (!HS.cur.players) HS.cur.players = {}; HS.cur.players[hsNames[hsA1]] = 1; }
    }
    HS.saveParty();
    if (HS.cur) HS.save(true);
    hsSay(hsAdded.length ? "added " + hsAdded.join(", ") + ". Party: " + HS.party.join(", ") + "." : "already in the party: " + hsNames.join(", ") + ".", hsAdded.length ? "lime" : "cyan");
  } else if (hsP1 === "del" || hsP1 === "remove") {
    var hsGone = [], hsMissing = [];
    for (var hsD = 0; hsD < hsNames.length; hsD++) {
      var hsAt = HS.party.indexOf(hsNames[hsD]);
      if (hsAt >= 0) { HS.party.splice(hsAt, 1); hsGone.push(hsNames[hsD]); } else { hsMissing.push(hsNames[hsD]); }
      if (HS.cur && HS.cur.players) delete HS.cur.players[hsNames[hsD]];
    }
    HS.saveParty();
    if (HS.cur) HS.save(true);
    if (hsGone.length) hsSay("removed " + hsGone.join(", ") + ". " + (HS.party.length ? "Party: " + HS.party.join(", ") + "." : "No party now."), "lime");
    if (hsMissing.length) hsSay("not in the party: " + hsMissing.join(", ") + ".", "orange");
  } else if (hsP1 === "clear") {
    HS.party = [];
    HS.saveParty();
    if (HS.cur) { HS.cur.players = {}; HS.save(true); }
    hsSay("party cleared: you're hunting alone.", "lime");
  } else {
    hsSay("usage: HUNTSTATS PARTY [ADD <name> | DEL <name> | CLEAR]", "orange");
  }
} else if (hsSub === "debug") {
  var T = HS.cur || {};
  hsSay("level=" + HS.level + " nl=" + HS.nl + " dragon=" + (HS.dragon() === null ? "?" : HS.dragon().toFixed(3)) + " resumed=" + !!HS.resumed);
  hsSay("area=" + T.area + " xp=" + T.xp + " gold=" + T.gold + " kills=" + T.kills + " firstXpAt=" + T.firstXpAt + " lastXpAt=" + T.lastXpAt + " players=" + Object.keys(T.players || {}).join(",") + " party=" + HS.party.join(",") + " me=" + (HS.me || "?"));
} else {
  hsSay("unknown command '" + hsSub + "'. HUNTSTATS HELP for commands.", "orange");
}
