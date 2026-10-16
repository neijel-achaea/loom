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
      arr.push({ area: k, xpHr: hrs > 0 ? Math.round(a.xp / hrs) : 0, goldHr: hrs > 0 ? Math.round(a.gold / hrs) : 0, sessions: a.sessions, ms: a.ms, dps: HS.rate(a.dmgIn, a.combatMs), maxHit: a.maxHit || 0 });
    }
  }
  if (arr.length === 0) { hsSay("no area history yet", "cyan"); }
  else {
    arr.sort(function (x, y) { return y.ms - x.ms; });
    hsSay("areas by total time (lifetime):", "cyan");
    // Damage taken per combat second and the biggest hit (#59), coloured
    // against HUNTSTATS TANK when the page can print coloured lines and
    // your max health is known.
    var arHtml = (typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function");
    function arEsc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
    for (var j = 0; j < arr.length; j++) {
      var r = arr[j];
      var arLine = "  " + r.area + " - " + r.xpHr.toLocaleString() + " xp/hr, " + r.goldHr.toLocaleString() + " gold/hr (" + r.sessions + " hunt" + (r.sessions === 1 ? "" : "s") + ", " + HS.dur(r.ms) + ")";
      var arDmg = r.dps !== null ? "takes " + Math.round(r.dps).toLocaleString() + "/s, max hit " + r.maxHit.toLocaleString() : "";
      var arTone = HS.tankTone(r.dps);
      if (arHtml && arDmg) nexusclient.add_html_line('<span style="color:#c0c0c0">' + arEsc(arLine) + ', </span><span style="color:' + (arTone ? arTone.colour : "#c0c0c0") + '">' + arEsc(arDmg) + '</span>');
      else display_notice(arLine + (arDmg ? ", " + arDmg : ""));
    }
  }
} else if (hsSub === "tank") {
  // HUNTSTATS TANK [percent] (#59): how much of your max health per second
  // you can heal back. Areas that hit harder than half of it show yellow,
  // harder than all of it red.
  var tkCap = function () { return HS.maxhp ? " (" + Math.round(HS.tank / 100 * HS.maxhp).toLocaleString() + " health/s at your " + HS.maxhp.toLocaleString() + " max health)" : ""; };
  if (hsP1 === "") {
    hsSay("tank: " + HS.tank + "% of max health a second" + tkCap() + ". Areas that hit for under half of it show green, up to it yellow, more red. HUNTSTATS TANK <percent> to change it.", "cyan");
  } else {
    var tkV = parseFloat(hsP1);
    if (isNaN(tkV) || tkV <= 0 || tkV > 100) {
      hsSay("usage: HUNTSTATS TANK <percent>, the share of your max health you can heal back each second (default 3).", "orange");
    } else {
      HS.tank = tkV;
      set_variable("huntstats_tank", String(tkV));
      hsSay("tank set: " + tkV + "% of max health a second" + tkCap() + ".", "lime");
      run_function("huntstats_render", [], "huntstats");
    }
  }
} else if (hsSub === "suggest") {
  // HUNTSTATS SUGGEST [WEIGHTS <xp> <gold> <variety>] (#88): where to hunt
  // next. Each area's xp/hr and gold/hr are scaled against your best area,
  // plus a variety bonus that grows to full over 7 days since you last hunted
  // there (areas from before this was recorded count as long ago). The
  // weights say how much each counts. xp/hr holds whatever your level, so old
  // records stay valid and time spent somewhere doesn't count.
  if (hsP1 === "weights") {
    var hsWa = [parseFloat(hsW[2]), parseFloat(hsW[3]), parseFloat(hsW[4])];
    if (hsW.length < 3) {
      hsSay("weights: xp " + HS.weights[0] + ", gold " + HS.weights[1] + ", variety " + HS.weights[2] + ". HUNTSTATS SUGGEST WEIGHTS <xp> <gold> <variety> to change them.", "cyan");
    } else if (isNaN(hsWa[0]) || isNaN(hsWa[1]) || isNaN(hsWa[2]) || hsWa[0] < 0 || hsWa[1] < 0 || hsWa[2] < 0 || hsWa[0] + hsWa[1] + hsWa[2] <= 0) {
      hsSay("usage: HUNTSTATS SUGGEST WEIGHTS <xp> <gold> <variety>, three numbers not all zero (default 70 25 5)", "orange");
    } else {
      HS.weights = hsWa;
      set_variable("huntstats_weights", hsWa.join(" "));
      hsSay("weights set: xp " + hsWa[0] + ", gold " + hsWa[1] + ", variety " + hsWa[2] + ".", "lime");
    }
  } else {
    var sgA = {};
    try { sgA = JSON.parse(get_variable("huntstats_areas")) || {}; } catch (e) { sgA = {}; }
    var sgL = [], sgBx = 0, sgBg = 0;
    for (var sgK in sgA) {
      if (!sgA.hasOwnProperty(sgK)) continue;
      var sgR = sgA[sgK], sgH = sgR.ms / 3600000;
      if (!(sgH > 0)) continue;
      var sgE = { area: sgK, xp: sgR.xp / sgH, gold: sgR.gold / sgH, last: sgR.last || 0 };
      sgL.push(sgE);
      if (sgE.xp > sgBx) sgBx = sgE.xp;
      if (sgE.gold > sgBg) sgBg = sgE.gold;
    }
    if (!sgL.length) {
      hsSay("no area history yet: hunt a few areas first.", "cyan");
    } else {
      var sgW = HS.weights, sgT = sgW[0] + sgW[1] + sgW[2];
      for (var sgI = 0; sgI < sgL.length; sgI++) {
        var sgX = sgL[sgI];
        var sgDays = sgX.last ? (Date.now() - sgX.last) / 86400000 : 7;
        sgX.days = sgX.last ? sgDays : null;
        sgX.score = 100 * (sgW[0] * (sgBx > 0 ? sgX.xp / sgBx : 0) + sgW[1] * (sgBg > 0 ? sgX.gold / sgBg : 0) + sgW[2] * Math.min(sgDays, 7) / 7) / sgT;
      }
      sgL.sort(function (p, q) { return q.score - p.score; });
      var sgN = Math.min(10, sgL.length);
      hsSay("where to hunt next (xp " + sgW[0] + ", gold " + sgW[1] + ", variety " + sgW[2] + "):", "cyan");
      var sgHtml = (typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function");
      var sgRows = [];
      var sgWid = 0;
      for (var sgM = 0; sgM < sgN; sgM++) sgWid = Math.max(sgWid, sgL[sgM].area.length);
      for (var sgJ = 0; sgJ < sgN; sgJ++) {
        var sgY = sgL[sgJ];
        var sgWhen = sgY.days === null ? "" : (sgY.days < 1 ? "today" : Math.floor(sgY.days) + "d ago");
        var sgName = sgY.area + new Array(sgWid - sgY.area.length + 3).join(" ");
        var sgTxt = ("   " + (sgJ + 1) + ". ").slice(-5) + sgName + ("   " + Math.round(sgY.score)).slice(-3) + "   " + (HS.n(sgY.xp) + " xp/hr").padStart(14) + "  " + (HS.n(sgY.gold) + " gold/hr").padStart(15) + (sgWhen ? "  last " + sgWhen : "");
        if (sgHtml) sgRows.push('<span style="color:' + (sgJ === 0 ? "#00ffff" : "#9fc9c9") + '">' + sgTxt.replace(/&/g, "&amp;").replace(/</g, "&lt;") + '</span>');
        else display_notice(sgTxt, "cyan");
      }
      if (sgHtml) nexusclient.add_html_line('<span style="font-family:\'Courier New\',monospace;white-space:pre">' + sgRows.join("\n") + '</span>');
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
      display_notice("  " + s.area + " - " + HS.dur(s.ms) + ", " + s.xp.toLocaleString() + " xp (" + s.xpHr.toLocaleString() + "/hr), " + s.gold.toLocaleString() + " gold, " + s.kills + " kills" + (s.combatMs ? ", took " + Math.round(HS.rate(s.dmgIn, s.combatMs)).toLocaleString() + "/s (max hit " + s.maxHit.toLocaleString() + ")" : "") + dg + pl);
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
  if (hsP1 !== "" && hsP1 !== "list") run_function("huntstats_render", [], "huntstats");
} else if (hsSub === "debug") {
  var T = HS.cur || {};
  hsSay("level=" + HS.level + " nl=" + HS.nl + " dragon=" + (HS.dragon() === null ? "?" : HS.dragon().toFixed(3)) + " resumed=" + !!HS.resumed);
  hsSay("area=" + T.area + " xp=" + T.xp + " gold=" + T.gold + " kills=" + T.kills + " firstXpAt=" + T.firstXpAt + " lastXpAt=" + T.lastXpAt + " players=" + Object.keys(T.players || {}).join(",") + " party=" + HS.party.join(",") + " me=" + (HS.me || "?"));
} else {
  hsSay("unknown command '" + hsSub + "'. HUNTSTATS HELP for commands.", "orange");
}
