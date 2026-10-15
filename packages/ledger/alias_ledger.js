// LEDGER [subcommand ...]: the one command for this package.
if (!client.loom || !client.loom.ledger || !client.loom.ledger.months) run_function("ledger_setup", [], "ledger");
var LG = client.loom.ledger;
var lgRaw = String(args[1] || "").trim();
var lgSp = lgRaw.search(/\s/);
var lgSub = (lgSp < 0 ? lgRaw : lgRaw.slice(0, lgSp)).toLowerCase();
var lgRest = lgSp < 0 ? "" : lgRaw.slice(lgSp + 1).trim();
function lgSay(t, c) { display_notice("[ledger] " + t, c || "cyan"); }
function lgLoad() { var a = []; try { a = JSON.parse(get_variable("ledger_items")) || []; } catch (e) { a = []; } return a; }
function lgSave(a) { set_variable("ledger_items", JSON.stringify(a)); }
// Entry numbers may be typed as 3 or #3.
function lgFind(items, want) { for (var i = 0; i < items.length; i++) { if (items[i].id === want) return i; } return -1; }
var lgWant = parseInt(lgRest.replace(/^#/, ""), 10);

if (lgSub === "" || lgSub === "status") {
  run_function("ledger_digest", [], "ledger");
  run_function("ledger_sync", [], "ledger");
} else if (lgSub === "help") {
  run_function("ledger_help", [], "ledger");
} else if (lgSub === "date") {
  run_function("ledger_sync", [], "ledger");
} else if (lgSub === "add") {
  var raw = lgRest;
  var at = raw.indexOf(" @ ");
  var txt = raw;
  var tail = "";
  if (at >= 0) {
    txt = raw.substring(0, at).trim();
    tail = raw.substring(at + 3).trim().toLowerCase();
  }
  var today = LG.day;
  var due = null;
  var rep = null;
  var bad = "";
  if (!txt.length) {
    bad = "no text given. LEDGER ADD <text> [@ 15th Miraman 1015 | @ +4 months] [repeat]";
  } else if (tail.length && today === 0) {
    bad = "date not known yet - run LEDGER DATE first";
  } else if (tail.length) {
    var mRel = tail.match(/^\+(\d+)\s+(day|days|month|months)(\s+repeat)?$/);
    var mFix = tail.match(/^(\d+)(?:st|nd|rd|th)?\s+([a-z]+)\s+(\d+)(\s+repeat)?$/);
    if (mRel) {
      var nn = parseInt(mRel[1], 10);
      var step = (mRel[2].charAt(0) == "m") ? nn * 25 : nn;
      due = today + step;
      if (mRel[3]) rep = { t: "i", n: step };
    } else if (mFix) {
      var fd = parseInt(mFix[1], 10);
      var fy = parseInt(mFix[3], 10);
      var fi = -1;
      for (var k = 0; k < LG.months.length; k++) { if (LG.months[k].toLowerCase() == mFix[2]) fi = k; }
      if (fi < 0) bad = "unknown month: " + mFix[2];
      else if (fd < 1 || fd > 25) bad = "day must be 1-25";
      else {
        due = fy * 300 + fi * 25 + fd;
        if (mFix[4]) rep = { t: "a", m: fi, d: fd };
      }
    } else {
      bad = "cannot read '" + tail + "' - use '15th Miraman 1015' or '+4 months', optionally + ' repeat'";
    }
    if (!bad.length && due < today) bad = "that date is already behind you - nothing added";
  }
  if (bad.length) {
    lgSay(bad, "orange");
  } else {
    var items = lgLoad();
    var seq = parseInt(get_variable("ledger_seq") || "0", 10) + 1;
    items.push({ id: seq, text: txt, source: "manual", status: "open", created: today, touched: today, due: due, repeat: rep, tag: null, link: null, notified: false });
    lgSave(items);
    set_variable("ledger_seq", "" + seq);
    lgSay("#" + seq + " added" + (due ? "" : " (standing)"), "lime");
    run_function("ledger_check", [], "ledger");
  }
} else if (lgSub === "done" || lgSub === "drop" || lgSub === "touch") {
  var its = lgLoad();
  var idx = isNaN(lgWant) ? -1 : lgFind(its, lgWant);
  var td = LG.day;
  if (isNaN(lgWant)) {
    lgSay("LEDGER " + lgSub.toUpperCase() + " <#>", "orange");
  } else if (idx < 0) {
    lgSay("no item #" + lgWant, "orange");
  } else if (lgSub === "touch") {
    its[idx].touched = td;
    lgSave(its);
    lgSay("#" + lgWant + " touched", "lime");
  } else if (lgSub === "done" && its[idx].repeat) {
    var r = its[idx].repeat;
    var next;
    if (r.t == "i") { next = td + r.n; }
    else {
      var y = Math.floor((td - 1) / 300);
      next = y * 300 + r.m * 25 + r.d;
      while (next <= td) next = next + 300;
    }
    its[idx].due = next;
    its[idx].touched = td;
    its[idx].notified = false;
    lgSave(its);
    var gap = next - td;
    lgSay("#" + lgWant + " done - next in " + Math.floor(gap / 25) + "mo " + (gap % 25) + "d", "lime");
  } else {
    var gone = its[idx].text;
    // An item another package added stays away until its condition clears
    // (its source withdraws it), instead of coming straight back (#34).
    if (its[idx].source && its[idx].source !== "manual" && its[idx].key !== undefined) {
      LG.dismissed[its[idx].source + "|" + its[idx].key] = true;
      LG.saveDismissed();
    }
    its.splice(idx, 1);
    lgSave(its);
    lgSay("#" + lgWant + " " + (lgSub === "done" ? "done" : "dropped") + " - " + gone, lgSub === "done" ? "lime" : "orange");
  }
  run_function("ledger_render", [], "ledger");
} else if (lgSub === "dismissed") {
  // Reminders other packages made that you DONE/DROPped, kept away until
  // their condition clears (#34).
  var lgDk = [];
  for (var lgD in LG.dismissed) { if (LG.dismissed.hasOwnProperty(lgD)) lgDk.push(lgD.replace("|", " ")); }
  if (!lgDk.length) lgSay("nothing dismissed.");
  else lgSay("dismissed, kept away until their condition clears: " + lgDk.sort().join(", ") + ". LEDGER RESTORE <source> [key] brings one back.");
} else if (lgSub === "restore") {
  // LEDGER RESTORE <source> [key] | ALL: end dismissals; the source is asked
  // to look again at once (through loom), so a reminder still due comes back.
  var lgRw = lgRest.toLowerCase().split(/\s+/);
  var lgRs = lgRw[0] || "", lgRk = lgRw.slice(1).join(" ");
  if (!lgRs) {
    lgSay("LEDGER RESTORE <source> [key], or LEDGER RESTORE ALL. LEDGER DISMISSED lists them.", "orange");
  } else {
    var lgGone = [], lgSrcs = {};
    for (var lgX in LG.dismissed) {
      if (!LG.dismissed.hasOwnProperty(lgX)) continue;
      var lgP = lgX.split("|");
      if (lgRs === "all" || (lgP[0] === lgRs && (!lgRk || lgP[1] === lgRk))) { lgGone.push(lgP.join(" ")); lgSrcs[lgP[0]] = true; delete LG.dismissed[lgX]; }
    }
    if (!lgGone.length) {
      lgSay("nothing dismissed for '" + lgRest + "'. LEDGER DISMISSED lists them.", "orange");
    } else {
      LG.saveDismissed();
      lgSay("restored: " + lgGone.join(", ") + ".", "lime");
      for (var lgS in lgSrcs) { if (lgSrcs.hasOwnProperty(lgS) && client.loom.notify) client.loom.notify(lgS); }
    }
  }
} else if (lgSub === "debug") {
  var dv = lgRest.toLowerCase();
  if (dv === "on" || dv === "off") {
    LG.debug = (dv === "on");
    set_variable("ledger_debug", LG.debug ? "1" : "0");
    lgSay("debug " + (LG.debug ? "ON" : "OFF"), "lime");
  } else {
    var all = lgLoad();
    lgSay("day " + LG.day + " | items " + all.length + " | seq " + get_variable("ledger_seq") + " | armed " + (LG.armed ? "yes" : "no") + " | inblock " + (LG.inBlock ? "yes" : "no") + " | pause " + (get_variable("pauseTriggers") || "unset") + " | debug " + (LG.debug ? "ON" : "OFF") + ". LEDGER DEBUG ON/OFF.");
  }
} else if (lgSub === "rebuild") {
  client.loom.ledger = {};
  run_function("ledger_setup", [], "ledger");
  run_function("ledger_render", [], "ledger");
  lgSay("rebuilt from the saved variables (day " + client.loom.ledger.day + ")", "lime");
} else {
  lgSay("unknown command '" + lgSub + "'. LEDGER HELP for commands.", "orange");
}
