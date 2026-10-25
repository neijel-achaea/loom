// ROLEPLAY [subcommand ...]: your pronouns, what holds the emotes back, and
// the ambient emotes (AEM): switch, lists, timing, seeds.
if (!client.loom || !client.loom.roleplay || !client.loom.roleplay.lists) run_function("roleplay_setup", [], "roleplay");
var RP = client.loom.roleplay;
// Words in lowercase for matching; the raw line keeps an emote's own case.
var rpRaw = String(args[1] || "").trim();
var rpW = rpRaw.toLowerCase().split(/\s+/);
var rpSub = rpW[0];
var rpS2 = rpW[1] || "";
function rpSay(t, c) { display_notice("[roleplay] " + t, c || "cyan"); }
// The rest of the raw line after the first n words.
function rpRest(n) {
  var s = rpRaw;
  for (var i = 0; i < n; i++) s = s.replace(/^\S+\s*/, "");
  return s;
}
function rpEsc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function rpHtml() { return typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function"; }
// Monospace rows: [[text, colour], ...] per line.
function rpBlock(lines) {
  if (!rpHtml()) { for (var i = 0; i < lines.length; i++) { var p = ""; for (var j = 0; j < lines[i].length; j++) p += lines[i][j][0]; display_notice(p, "cyan"); } return; }
  var out = [];
  for (var a = 0; a < lines.length; a++) {
    var h = "";
    for (var b = 0; b < lines[a].length; b++) h += '<span style="color:' + lines[a][b][1] + '">' + rpEsc(lines[a][b][0]) + "</span>";
    out.push(h);
  }
  nexusclient.add_html_line('<span style="font-family:\'Courier New\',monospace;white-space:pre-wrap">' + out.join("\n") + "</span>");
}
// The keys a LIST view shows: the active set, one list, or every list.
function rpViewKeys() { return RP.viewKeys || RP.activeKeys(); }
function rpRow(n) {
  var rows = RP.rows(rpViewKeys());
  var k = parseInt(n, 10);
  return (k >= 1 && k <= rows.length) ? rows[k - 1] : null;
}
function rpWho() { return (RP.cls || "your class") + (RP.isForm() ? " (a form: its own list only)" : ""); }

if (rpSub === "" || rpSub === "status") {
  var g = RP.genderNow();
  rpSay((RP.me || "you") + ": " + (RP.race || "race unknown") + ", " + (RP.cls || "class unknown") + (RP.isForm() ? " (a form)" : "") + "; pronouns " + (g ? RP.pron[g].he + "/" + RP.pron[g].him + "/" + RP.pron[g].his + (RP.gender ? "" : " (from SCORE)") : "unknown: type SCORE, or ROLEPLAY GENDER HE|SHE|FAE") + ".", (RP.cls && g) ? "cyan" : "orange");
  var act = RP.rows(RP.activeKeys());
  var bits = [];
  var ak = RP.activeKeys();
  for (var i = 0; i < ak.length; i++) bits.push(RP.label(ak[i]) + " " + (RP.lists[ak[i]] || []).length);
  rpSay("ambient emotes " + (RP.on ? "ON" : "OFF") + ", every " + RP.min + "-" + RP.max + " minutes; " + act.length + " in use (" + (bits.join(", ") || "no lists yet") + ")." + (RP.on && RP.timer ? " Next in " + RP.mmss(RP.due - Date.now()) + (RP.held ? ", held: " + RP.held : "") + "." : "") + " ROLEPLAY HELP for commands.");
} else if (rpSub === "help") {
  run_function("roleplay_help", [], "roleplay");
} else if (rpSub === "gender") {
  if (rpS2 === "") {
    var g2 = RP.genderNow();
    rpSay("pronouns: " + (g2 ? RP.pron[g2].he + "/" + RP.pron[g2].him + "/" + RP.pron[g2].his + (RP.gender ? " (set by you)" : " (from SCORE)") : "unknown: type SCORE") + ". ROLEPLAY GENDER HE, SHE, FAE or AUTO.");
  } else if (/^(he|she|fae)$/.test(rpS2)) {
    RP.gender = rpS2;
    set_variable("roleplay_gender", rpS2);
    rpSay("pronouns: " + RP.pron[rpS2].he + "/" + RP.pron[rpS2].him + "/" + RP.pron[rpS2].his + ".", "lime");
  } else if (rpS2 === "auto") {
    RP.gender = "";
    delete_variable("roleplay_gender");
    rpSay("pronouns follow the game" + (RP.gameGender ? ": " + RP.pron[RP.gameGender].he + "." : " (not known yet: type SCORE once).") , "lime");
  } else {
    rpSay("ROLEPLAY GENDER HE, SHE, FAE or AUTO.", "orange");
  }
} else if (rpSub === "quiet") {
  var qn = (rpW[2] || "").toLowerCase();
  if (rpS2 === "add" && qn) {
    if (RP.quiet.indexOf(qn) < 0) RP.quiet.push(qn);
    set_variable("roleplay_quiet", JSON.stringify(RP.quiet));
    rpSay("held back by: " + RP.quiet.join(", ") + ".", "lime");
  } else if (rpS2 === "remove" && qn) {
    var qi = RP.quiet.indexOf(qn);
    if (qi < 0) rpSay("'" + qn + "' isn't in the list: " + RP.quiet.join(", ") + ".", "orange");
    else { RP.quiet.splice(qi, 1); set_variable("roleplay_quiet", JSON.stringify(RP.quiet)); rpSay("held back by: " + (RP.quiet.join(", ") || "nothing but the pause and fights") + ".", "lime"); }
  } else if (rpS2 === "reset") {
    RP.quiet = RP.quietDefault.slice(0);
    delete_variable("roleplay_quiet");
    rpSay("held back by the defaults: " + RP.quiet.join(", ") + ".", "lime");
  } else if (rpS2 === "") {
    var now = [];
    for (var qj = 0; qj < RP.quiet.length; qj++) if (RP.defs[RP.quiet[qj]] || RP.affs[RP.quiet[qj]]) now.push(RP.quiet[qj]);
    rpSay("held back by these defences and afflictions (GMCP names): " + (RP.quiet.join(", ") || "none") + ". Up now: " + (now.join(", ") || "none") + ". Also by the pause and by a fight (health lost in the last 30 s).");
  } else {
    rpSay("ROLEPLAY QUIET, QUIET ADD <name>, QUIET REMOVE <name> or QUIET RESET.", "orange");
  }
} else if (rpSub === "aem") {
  var a3 = rpW[2] || "";
  if (rpS2 === "" || rpS2 === "status") {
    rpSay("ambient emotes " + (RP.on ? "ON" : "OFF") + ", every " + RP.min + "-" + RP.max + " minutes, " + RP.rows(RP.activeKeys()).length + " in use for " + rpWho() + "." + (RP.on && RP.timer ? " Next in " + RP.mmss(RP.due - Date.now()) + (RP.held ? ", held: " + RP.held : "") + "." : "") + " ROLEPLAY AEM ON|OFF|NOW|LIST.");
  } else if (rpS2 === "on") {
    RP.on = true;
    RP.emptyTold = false;
    RP.seedActive();
    RP.schedule();
    var n1 = RP.rows(RP.activeKeys()).length;
    rpSay("ambient emotes ON: one every " + RP.min + "-" + RP.max + " minutes, the first in " + RP.mmss(RP.due - Date.now()) + "." + (n1 ? "" : " None are written for " + rpWho() + " yet: ROLEPLAY AEM ADD."), n1 ? "lime" : "orange");
  } else if (rpS2 === "off") {
    RP.on = false;
    RP.stop();
    rpSay("ambient emotes OFF.", "lime");
  } else if (rpS2 === "now") {
    var e1 = RP.pick();
    if (get_variable("pauseTriggers") === "on") rpSay("triggers are paused, so nothing was sent.", "orange");
    else if (!e1) rpSay("no ambient emote to send for " + rpWho() + (RP.genderNow() ? "" : " (those with pronouns wait for your gender: type SCORE, or ROLEPLAY GENDER)") + ".", "orange");
    else { RP.send(e1); if (RP.on) RP.schedule(); }
  } else if (rpS2 === "list") {
    var vk;
    if (a3 === "" ) vk = null;
    else if (a3 === "all") {
      vk = [];
      for (var lk in RP.lists) if (RP.lists.hasOwnProperty(lk) && RP.lists[lk].length) vk.push(lk);
      vk.sort(function (x, y) { return (x === "general" ? "0" : x).localeCompare(y === "general" ? "0" : y); });
    } else {
      var k1 = RP.keyFor(rpRest(2));
      vk = k1 ? [k1] : undefined;
    }
    if (vk === undefined) {
      rpSay("ROLEPLAY AEM LIST, LIST GENERAL, RACE, CLASS, ALL, or RACE:<name> / CLASS:<name>" + (RP.cls ? "" : " (your race and class come from the game at login)") + ".", "orange");
    } else {
      RP.viewKeys = vk;
      var rows = RP.rows(rpViewKeys());
      var act2 = vk === null;
      if (!rows.length) {
        rpSay((act2 ? "no emotes in use for " + rpWho() : "no emotes in " + RP.label(vk[0])) + ". ROLEPLAY AEM ADD <list> [weight] <text>.", "orange");
      } else {
        // Chances within the set the LIST shows; a non-active list's are its own.
        var tot = 0, ri;
        for (ri = 0; ri < rows.length; ri++) tot += rows[ri].e.w;
        rpSay(act2 ? "ambient emotes in use for " + rpWho() + " (" + rows.length + "):" : (vk.length > 1 ? "every list" : RP.label(vk[0])) + " (" + rows.length + "):");
        var lines = [], lastKey = "";
        var nw = String(rows.length).length;
        for (ri = 0; ri < rows.length; ri++) {
          var r = rows[ri];
          if (r.key !== lastKey) { lines.push([["  " + RP.label(r.key) + (RP.activeKeys().indexOf(r.key) < 0 ? " (not in use now)" : ""), "#e0b46c"]]); lastKey = r.key; }
          var pct = tot ? (r.e.w * 100 / tot) : 0;
          var ps = r.e.w ? (pct < 9.95 ? " " : "") + pct.toFixed(1) + "%" : "  --  ";
          lines.push([
            ["  " + ("     " + (ri + 1)).slice(-nw) + "  ", "#00ffff"],
            [("   " + r.e.w).slice(-3) + "  " + ps + "  ", "#9fc9c9"],
            [r.e.t, r.e.w ? "#c8bfae" : "#7a7a7a"]
          ]);
        }
        rpBlock(lines);
        if (!RP.genderNow()) rpSay("pronouns unknown: emotes with {he} {him} {his} wait until you type SCORE once, or set ROLEPLAY GENDER.", "orange");
      }
    }
  } else if (rpS2 === "add") {
    var key = RP.keyFor(rpW[2] || "");
    var txt = rpRest(3);
    var wt = 1;
    var wm = /^(\d+)\s+([\s\S]+)$/.exec(txt);
    if (wm) { wt = Math.min(1000, parseInt(wm[1], 10)); txt = wm[2]; }
    txt = txt.replace(/^emote\s+/i, "").trim();
    if (!key) {
      rpSay("ROLEPLAY AEM ADD <GENERAL|RACE|CLASS|CLASS:<name>|RACE:<name>> [weight] <text>" + (RP.cls ? "" : " (your race and class come from the game at login)") + ".", "orange");
    } else if (!txt) {
      rpSay("the emote's text is missing.", "orange");
    } else {
      if (!RP.lists[key]) RP.lists[key] = [];
      // A list you write in keeps its seeds out from now on.
      if (!RP.seeded[key]) { RP.seedKey(key); RP.seeded[key] = 1; }
      RP.lists[key].push({ w: wt, t: txt });
      RP.save();
      rpSay("added to " + RP.label(key) + " (weight " + wt + "): " + txt, "lime");
    }
  } else if (rpS2 === "edit" || rpS2 === "weight" || rpS2 === "remove" || rpS2 === "test") {
    var row = rpRow(a3);
    if (!row) {
      rpSay("no emote " + (a3 || "?") + " in the last LIST. ROLEPLAY AEM LIST numbers them.", "orange");
    } else if (rpS2 === "test") {
      rpSay("would send: emote " + RP.fill(row.e.t) + (RP.hasTokens(row.e.t) && !RP.genderNow() ? "  (pronouns unknown: type SCORE, or ROLEPLAY GENDER)" : ""));
    } else if (rpS2 === "remove") {
      RP.lists[row.key].splice(row.i, 1);
      RP.seeded[row.key] = 1;
      RP.save();
      rpSay("removed from " + RP.label(row.key) + ": " + row.e.t, "lime");
      rpSay("to add it back: ROLEPLAY AEM ADD " + (row.key === "general" ? "GENERAL" : row.key.replace(/ /g, "_").toUpperCase()) + " " + row.e.w + " " + row.e.t);
    } else if (rpS2 === "weight") {
      var nwt = parseInt(rpW[3], 10);
      if (!(nwt >= 0 && nwt <= 1000)) rpSay("ROLEPLAY AEM WEIGHT <n> <0-1000>.", "orange");
      else { row.e.w = nwt; RP.save(); rpSay("emote " + a3 + " now weighs " + nwt + (nwt ? "." : ": kept, never sent."), "lime"); }
    } else {
      var nt = rpRest(3).replace(/^emote\s+/i, "").trim();
      if (!nt) rpSay("ROLEPLAY AEM EDIT <n> <text>.", "orange");
      else { var was = row.e.t; row.e.t = nt; RP.save(); rpSay("emote " + a3 + " reworded. It was: " + was, "lime"); }
    }
  } else if (rpS2 === "time") {
    var mn = Number(rpW[2]), mx = Number(rpW[3]);
    if (a3 === "") rpSay("an ambient emote every " + RP.min + "-" + RP.max + " minutes. ROLEPLAY AEM TIME <min> <max>.");
    else if (!(mn >= 1 && mx >= mn && mx <= 600)) rpSay("ROLEPLAY AEM TIME <min> <max>, in minutes: at least 1, max not below min, at most 600.", "orange");
    else {
      RP.min = mn; RP.max = mx;
      set_variable("roleplay_aem_time", mn + " " + mx);
      if (RP.on) RP.schedule();
      rpSay("an ambient emote every " + mn + "-" + mx + " minutes" + (RP.on ? "; the next in " + RP.mmss(RP.due - Date.now()) : "") + ".", "lime");
    }
  } else if (rpS2 === "export") {
    var ek = [];
    if (a3 === "all") { for (var xk in RP.lists) if (RP.lists.hasOwnProperty(xk) && RP.lists[xk].length) ek.push(xk); ek.sort(); }
    else ek = RP.activeKeys();
    var xl = [];
    for (var xi = 0; xi < ek.length; xi++) {
      var l2 = RP.lists[ek[xi]] || [];
      var nm = ek[xi] === "general" ? "GENERAL" : ek[xi].replace(/ /g, "_").replace(/^(race|class)/, function (m) { return m.toUpperCase(); });
      for (var xj = 0; xj < l2.length; xj++) xl.push([["ROLEPLAY AEM ADD " + nm + " " + l2[xj].w + " " + l2[xj].t, "#c8bfae"]]);
    }
    if (!xl.length) rpSay("nothing to export" + (a3 === "all" ? "." : " in the lists in use. ROLEPLAY AEM EXPORT ALL for every list."), "orange");
    else { rpSay(xl.length + " emote" + (xl.length === 1 ? "" : "s") + (a3 === "all" ? ", every list" : ", the lists in use") + ", as commands:"); rpBlock(xl); }
  } else if (rpS2 === "reset") {
    var which = a3 === "confirm" ? "" : a3;
    var conf = rpW[rpW.length - 1] === "confirm";
    var rk;
    if (which === "" || which === "all") {
      rk = [];
      for (var zk in RP.lists) if (RP.lists.hasOwnProperty(zk)) rk.push(zk);
    } else {
      var k2 = RP.keyFor(rpW[2]);
      rk = k2 ? [k2] : null;
    }
    if (!rk) {
      rpSay("ROLEPLAY AEM RESET [GENERAL|RACE|CLASS|ALL] CONFIRM.", "orange");
    } else {
      var lost = 0;
      for (var zi = 0; zi < rk.length; zi++) lost += (RP.lists[rk[zi]] || []).length;
      if (!conf) {
        rpSay("this replaces " + (which && which !== "all" ? RP.label(rk[0]) : "every list") + " with the starting emotes: " + lost + " emote" + (lost === 1 ? "" : "s") + " now there would be lost (ROLEPLAY AEM EXPORT keeps a copy). Add CONFIRM to do it.", "orange");
      } else {
        for (var zj = 0; zj < rk.length; zj++) { delete RP.lists[rk[zj]]; delete RP.seeded[rk[zj]]; }
        // A named list not in use now is refilled too; the rest when they're next used.
        for (var zl = 0; zl < rk.length; zl++) RP.seedKey(rk[zl]);
        RP.seedActive();
        RP.save();
        rpSay((which && which !== "all" ? RP.label(rk[0]) : "every list") + " back to the starting emotes (" + lost + " removed). ROLEPLAY AEM LIST shows them.", "orange");
      }
    }
  } else {
    rpSay("unknown command 'aem " + rpS2 + "'. ROLEPLAY HELP for commands.", "orange");
  }
} else if (rpSub === "debug") {
  var dk = [];
  for (var dl in RP.lists) if (RP.lists.hasOwnProperty(dl)) dk.push(dl + "=" + RP.lists[dl].length);
  rpSay("me=" + RP.me + " race=" + RP.race + " cls=" + RP.cls + " form=" + RP.isForm() + " gender=" + (RP.gender || "-") + "/game " + (RP.gameGender || "-") + " on=" + RP.on + " timer=" + !!RP.timer + " due=" + (RP.timer ? RP.mmss(RP.due - Date.now()) : "-") + " held=" + (RP.held || "-") + " hold now=" + (RP.holdWhy() || "-") + " sent=" + RP.sent + " lists={" + dk.join(", ") + "} seeded=" + JSON.stringify(RP.seeded) + " view=" + JSON.stringify(RP.viewKeys || "active") + " defs=" + Object.keys(RP.defs).length + " affs=" + Object.keys(RP.affs).join(",") + " pause=" + (get_variable("pauseTriggers") || "unset"));
} else {
  rpSay("unknown command '" + rpSub + "'. ROLEPLAY HELP for commands.", "orange");
}
