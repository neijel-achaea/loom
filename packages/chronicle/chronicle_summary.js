// chronicle_summary -- run from chronicle_setup. Summaries: when an Achaean
// day ends, its record is sent to an LLM (Anthropic's API, with the player's
// own key) and comes back as a short paragraph in the chronicle's voice.
//
// The voice is built in three layers (Ricardo, 2026-11-13):
//   1. a chronicler's voice that fits Achaea, the same for everyone;
//   2. what the game says of the character (Char.Status: race, class, age,
//      city, house, order), kept in chronicle_char;
//   3. what the player writes (CHRONICLE VOICE), in chronicle_voice.
// Third person by default; CHRONICLE PERSON FIRST writes it as their journal.
//
// The key lives in this browser's localStorage only, never in a Nexus
// variable (variables are stored with IRE and travel in .nxs exports).
var CR = client.loom.chronicle;

CR.keyName = "loom_chronicle_key";
CR.api = "https://api.anthropic.com/v1/messages";
CR.defaultModel = "claude-haiku-5-5";
CR.words = 100;
CR.budget = 24000;               // characters of record sent for one day
CR.retryMs = [30000, 120000, 600000];

CR.getKey = function () { try { return localStorage.getItem(CR.keyName) || ""; } catch (e) { return ""; } };
CR.setKey = function (k) {
  try { if (k) localStorage.setItem(CR.keyName, k); else localStorage.removeItem(CR.keyName); return true; } catch (e) { return false; }
};
CR.str = function (name, dflt) { var v = CR.readVar(name); return typeof v == "string" ? v : dflt; };
CR.voice = CR.str("chronicle_voice", "");
CR.person = CR.str("chronicle_person", "third") === "first" ? "first" : "third";
CR.model = CR.str("chronicle_model", "") || CR.defaultModel;
CR.auto = CR.str("chronicle_auto", "on") !== "off";
if (!CR.char || typeof CR.char != "object") {
  var crCh = CR.readVar("chronicle_char");
  CR.char = (crCh && typeof crCh == "object" && !Array.isArray(crCh)) ? crCh : {};
}
if (!CR.usage || typeof CR.usage != "object") {
  var crUs = CR.readVar("chronicle_usage");
  CR.usage = (crUs && typeof crUs == "object" && typeof crUs.calls == "number") ? crUs : { calls: 0, inTok: 0, outTok: 0 };
}
if (!Array.isArray(CR.queue)) CR.queue = [];
if (CR.busy === undefined) CR.busy = false;

// Layer 2, from Char.Status. In dragonform the race reads as a dragon: the
// last other race seen is kept.
CR.status = function (g) {
  var c = CR.char, changed = false;
  var put = function (k, v) {
    v = String(v === undefined || v === null ? "" : v).replace(/\s*\(\d+\)\s*$/, "").replace(/^\s+|\s+$/g, "");
    if (/^(none|\(none\))$/i.test(v)) v = "";
    if (c[k] !== v) { c[k] = v; changed = true; }
  };
  if (g.fullname !== undefined) put("fullname", g.fullname);
  if (g.race !== undefined && !/dragon/i.test(String(g.race))) put("race", g.race);
  if (g.race !== undefined && /dragon/i.test(String(g.race))) put("dragon", g.race);
  if (g["class"] !== undefined) put("cls", g["class"]);
  if (g.age !== undefined) put("age", g.age);
  if (g.city !== undefined) put("city", g.city);
  if (g.house !== undefined) put("house", g.house);
  if (g.order !== undefined) put("order", g.order);
  if (g.gender !== undefined) put("gender", g.gender);
  if (changed) set_variable("chronicle_char", JSON.stringify(c));
};
CR.facts = function () {
  var c = CR.char, out = [];
  var who = c.fullname || CR.me;
  if (!who) return "";
  var bits = [];
  if (c.gender) bits.push(c.gender);
  if (c.race) bits.push(c.race);
  if (c.cls) bits.push(c.cls);
  out.push(who + (bits.length ? ", a " + bits.join(" ") : "") + (c.age ? ", " + c.age + " years old" : "") + ".");
  if (c.dragon) out.push("Has attained Dragonhood (" + c.dragon + ") and is often in dragonform.");
  out.push(c.city ? "Citizen of " + c.city + "." : "Belongs to no city.");
  if (c.house) out.push("Member of " + c.house + ".");
  if (c.order) out.push("Of the order of " + c.order + ".");
  return out.join(" ");
};

// Layer 1, and the rules.
CR.system = function (prev, scope) {
  scope = scope || { what: "day", words: CR.words };
  var name = CR.me || "the adventurer";
  var p = [];
  if (CR.person === "first") {
    p.push("You keep the private journal of " + name + ", an adventurer of Achaea. Write as " + name + ", in the first person and past tense, as an entry written at the end of the day: plain, measured prose in their own manner, the way a journal kept in Sapience would read.");
  } else {
    p.push("You are the chronicler of " + name + ", an adventurer of Achaea. Write as an unnamed scribe keeping their annals: third person, past tense, measured and plain, the way a record kept in Sapience would read.");
  }
  p.push("Use the world's own terms. Never mention game mechanics: experience, levels, renown, credits, kill counts, minutes, commands, quests as such, or the client. Hunting is hunting; a quest is a task or a deed.");
  p.push("Leave out anything out of character: talk of the game and its tools, the real world, and anything that reads as players talking rather than their characters.");
  p.push("Invent nothing: no events, motives, feelings or relationships the lines don't show. Where they're unclear, say less.");
  p.push("No padding: a quiet day gets a sentence or two, not scenery. Atmosphere only from what the lines name (a room's name, the weather, an emote); no invented actions, sights or sensations to fill space.");
  p.push("Write from the chronicler's own knowledge: never mention the record, its lines, or what it doesn't say, and don't remark on gaps or abrupt endings. Don't open with the date.");
  p.push("Tells reach someone from afar: a person heard only through tells wasn't there in person. Who was present shows in what was said aloud, emotes, and who was in the room. Say who did what: don't credit " + name + " with what a companion did.");
  p.push("Keep what changes things: people met, promises made, tasks taken on, letters, messages and news, places first seen, words that mattered. Pass over routine. Name people as the record names them.");
  if (scope.what === "day") p.push("Write one paragraph of about " + scope.words + " words (fewer for a quiet day), plain text, no heading and no date: the date is shown above it. British spelling.");
  else p.push("You are given the entries already written for each " + (scope.what === "month" ? "day of a month" : "month of a year") + ". From them, write the entry for the whole " + scope.what + ": what changed and what mattered over it (people, turning points, tasks begun and finished, where " + name + " stands at its end), not a list of " + (scope.what === "month" ? "days" : "months") + ". About " + scope.words + " words, one or two paragraphs, plain text, no heading and no date. British spelling.");
  var f = CR.facts();
  if (f) p.push("Who " + name + " is, as the world knows: " + f);
  if (CR.voice) p.push("What the player tells you about " + name + " (take it as true, and let it shape what matters, without repeating it): " + CR.voice);
  if (prev) p.push("The previous " + scope.what + "'s entry, for continuity only (don't repeat it): " + prev);
  return p.join("\n\n");
};
// The time of the Achaean day a moment falls in. The real clock means
// nothing in the world (a day is one real hour), so the summary is given the
// part of the day instead (Ricardo). Assumes the day starts at midnight on
// the hour and has 24 hours of 2.5 real minutes.
CR.phase = function (t) {
  var d = new Date(t), h = (d.getMinutes() + d.getSeconds() / 60) * 24 / 60;
  return h < 5 ? "night" : h < 7 ? "dawn" : h < 12 ? "morning" : h < 14 ? "midday" : h < 18 ? "afternoon" : h < 21 ? "evening" : "late evening";
};
// The day's record as lines, cut to the budget.
CR.recordText = function (b) {
  var out = [], len = 0;
  for (var i = 0; i < b.ev.length; i++) {
    var e = b.ev[i];
    if (e.k == "link" && e.src == "chronicle") continue;
    var ln = CR.phase(e.t) + " " + e.k + ": " + CR.clip(CR.show(e), 1500).replace(/\n/g, " / ");
    if (len + ln.length > CR.budget) { out.push("(the rest of the record is cut short)"); break; }
    out.push(ln);
    len += ln.length + 1;
  }
  return out.join("\n");
};
CR.prevSum = function (d) {
  for (var i = CR.days.length - 1; i >= 0; i--) { if (CR.days[i].d < d && CR.days[i].sum) return CR.days[i].sum.text; }
  return "";
};

// --- months and years --------------------------------------------------------
// A day number's month and year: day d is year * 300 + month * 25 + day, so
// (d - 1) / 25 counts months and (d - 1) / 300 years from 0 AF.
CR.monthOf = function (d) { return Math.floor((d - 1) / 25); };
CR.yearOf = function (d) { return Math.floor((d - 1) / 300); };
CR.monthName = function (m) { return CR.months[m % 12] + ", " + Math.floor(m / 12) + " AF"; };
CR.yearName = function (y) { return "the year " + y + " AF"; };
// The rollups, saved apart from the days: chronicle_annals = { m: { month:
// sum }, y: { year: sum }, f: { "m123": failures } }.
if (!CR.annals || typeof CR.annals != "object") {
  var crAn = CR.readVar("chronicle_annals");
  CR.annals = (crAn && typeof crAn == "object" && !Array.isArray(crAn)) ? crAn : {};
}
if (!CR.annals.m || typeof CR.annals.m != "object") CR.annals.m = {};
if (!CR.annals.y || typeof CR.annals.y != "object") CR.annals.y = {};
if (!CR.annals.f || typeof CR.annals.f != "object") CR.annals.f = {};
CR.saveAnnals = function () { set_variable("chronicle_annals", JSON.stringify(CR.annals)); };
CR.daysOfMonth = function (m) { return CR.days.filter(function (b) { return b.d > 0 && CR.monthOf(b.d) === m; }); };
CR.monthsOfYear = function (y) {
  var seen = {}, out = [], i;
  for (i = 0; i < CR.days.length; i++) { if (CR.days[i].d > 0 && CR.yearOf(CR.days[i].d) === y) seen[CR.monthOf(CR.days[i].d)] = true; }
  for (var k in CR.annals.m) { if (CR.annals.m.hasOwnProperty(k) && Math.floor(k / 12) === y) seen[k] = true; }
  for (var n in seen) { if (seen.hasOwnProperty(n)) out.push(parseInt(n, 10)); }
  return out.sort(function (a, b) { return a - b; });
};
// What a rollup is written from: the entries below it, and the player's own
// notes (they're what a summary of summaries most easily loses).
CR.monthText = function (m) {
  var out = [], notes = [], ds = CR.daysOfMonth(m);
  for (var i = 0; i < ds.length; i++) {
    if (ds[i].sum && !ds[i].sum.draft) out.push("[" + CR.dayName(ds[i].d).replace(/,.*$/, "") + "] " + ds[i].sum.text);
    for (var j = 0; j < ds[i].ev.length; j++) { if (ds[i].ev[j].k == "note") notes.push(ds[i].ev[j].text); }
  }
  return out.join("\n\n") + (notes.length ? "\n\nNotes the player made this month: " + notes.join(" / ") : "");
};
CR.yearText = function (y) {
  var out = [], ms = CR.monthsOfYear(y);
  for (var i = 0; i < ms.length; i++) { var a = CR.annals.m[ms[i]]; if (a && !a.draft) out.push("[" + CR.months[ms[i] % 12] + "] " + a.text); }
  return out.join("\n\n");
};

// --- the queue ----------------------------------------------------------------
// Items: a day number, "m<month>" or "y<year>". Every finished day with a
// record and no summary (or a draft), then every finished month whose days
// are all done, then every finished year whose months are: written one at a
// time, oldest first, at each new day and at load. Three failures leave an
// item for CHRONICLE WRITE.
CR.fails = function (it) { return typeof it == "number" ? ((CR.bucket(it, false) || {}).fails || 0) : (CR.annals.f[it] || 0); };
CR.due = function () {
  var today = CR.today();
  if (!today || CR.retryT) return;
  var curM = CR.monthOf(today), curY = CR.yearOf(today), i, max = CR.retryMs.length;
  var add = function (it) { if (CR.queue.indexOf(it) < 0 && CR.fails(it) < max) CR.queue.push(it); };
  var months = {}, years = {};
  for (i = 0; i < CR.days.length; i++) {
    var b = CR.days[i];
    if (b.d <= 0) continue;
    if (b.d < today && b.ev.length && (!b.sum || b.sum.draft)) add(b.d);
    months[CR.monthOf(b.d)] = true;
  }
  for (var m in months) {
    if (!months.hasOwnProperty(m)) continue;
    m = parseInt(m, 10);
    years[Math.floor(m / 12)] = true;
    var am = CR.annals.m[m];
    if (m >= curM || (am && !am.draft)) continue;
    var ds = CR.daysOfMonth(m), ready = true, any = false;
    for (i = 0; i < ds.length; i++) {
      if (ds[i].sum && !ds[i].sum.draft) any = true;
      else if (ds[i].ev.length && (ds[i].fails || 0) < max) ready = false;
    }
    if (ready && any) add("m" + m);
  }
  for (var k in CR.annals.m) { if (CR.annals.m.hasOwnProperty(k)) years[Math.floor(k / 12)] = true; }
  for (var y in years) {
    if (!years.hasOwnProperty(y)) continue;
    y = parseInt(y, 10);
    var ay = CR.annals.y[y];
    if (y >= curY || (ay && !ay.draft)) continue;
    var ms = CR.monthsOfYear(y), done = true, has = false;
    for (i = 0; i < ms.length; i++) {
      var a = CR.annals.m[ms[i]];
      if (a && !a.draft) has = true;
      else if ((CR.annals.f["m" + ms[i]] || 0) < max && CR.daysOfMonth(ms[i]).length) done = false;
    }
    if (done && has) add("y" + y);
  }
  var rank = function (it) { return typeof it == "number" ? [0, it] : it.charAt(0) === "m" ? [1, +it.slice(1)] : [2, +it.slice(1)]; };
  CR.queue.sort(function (a, c) { var x = rank(a), z = rank(c); return x[0] - z[0] || x[1] - z[1]; });
  CR.pump();
};
CR.pump = function () {
  if (CR.busy || !CR.queue.length || !CR.auto || !CR.getKey()) return;
  CR.write(CR.queue.shift(), false);
};
CR.label = function (it) { return typeof it == "number" ? CR.dayName(it) : it.charAt(0) === "m" ? CR.monthName(+it.slice(1)) : CR.yearName(+it.slice(1)); };
// The request. Recent models think before answering, and thinking counts
// against max_tokens: a busy day's thinking used up 900 and left no text
// (Ricardo, 2026-11-13). So: room for both, and low effort (a summary
// doesn't need deep thought). A model that refuses those settings (400) is
// asked again without them, and they stay off for the session.
CR.lean = CR.lean !== false;
CR.request = function (sys, user) {
  var r = { model: CR.model, max_tokens: 4000, system: sys, messages: [{ role: "user", content: user }] };
  if (CR.lean) { r.thinking = { type: "adaptive" }; r.output_config = { effort: "low" }; }
  return r;
};
// One call. manual: CHRONICLE WRITE, which reports back and ignores past
// failures. Something still going (today, this month) gets a draft, replaced
// when it ends.
CR.write = function (it, manual) {
  var key = CR.getKey(), sys, user;
  if (typeof it == "number") {
    var b = CR.bucket(it, false);
    if (!b || !b.ev.length) { if (manual) display_notice("[chronicle] nothing recorded for " + CR.dayName(it) + ".", "cyan"); CR.pump(); return; }
    sys = CR.system(CR.prevSum(it), { what: "day", words: CR.words });
    user = "The record of " + CR.dayName(it) + ", line by line (part of the day, kind, what happened):\n\n" + CR.recordText(b) + "\n\nWrite the entry for this day.";
  } else if (it.charAt(0) === "m") {
    var m = +it.slice(1), mt = CR.monthText(m);
    if (!/\S/.test(mt)) { if (manual) display_notice("[chronicle] no day of " + CR.monthName(m) + " has its summary yet.", "cyan"); CR.pump(); return; }
    var pm = CR.annals.m[m - 1];
    sys = CR.system(pm ? pm.text : "", { what: "month", words: 200 });
    user = "The entries for the days of " + CR.monthName(m) + " that were played, in order:\n\n" + mt + "\n\nWrite the entry for this month.";
  } else {
    var y = +it.slice(1), yt = CR.yearText(y);
    if (!/\S/.test(yt)) { if (manual) display_notice("[chronicle] no month of " + CR.yearName(y) + " has its summary yet.", "cyan"); CR.pump(); return; }
    var py = CR.annals.y[y - 1];
    sys = CR.system(py ? py.text : "", { what: "year", words: 250 });
    user = "The entries for the months of " + CR.yearName(y) + " that were played, in order:\n\n" + yt + "\n\nWrite the entry for this year.";
  }
  if (!key) { if (manual) display_notice("[chronicle] no API key in this browser: CHRONICLE KEY <key> first.", "orange"); return; }
  CR.busy = true;
  CR.writing = it;
  var started = Date.now();
  fetch(CR.api, {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true", "content-type": "application/json" },
    body: JSON.stringify(CR.request(sys, user))
  }).then(function (r) {
    return r.json().then(function (j) { return { status: r.status, j: j }; }, function () { return { status: r.status, j: null }; });
  }).then(function (res) {
    client.loom.chronicle.written(it, res, manual, started);
  }).catch(function (e) {
    client.loom.chronicle.written(it, { status: 0, j: null, err: String(e && e.message || e) }, manual, started);
  });
};
CR.written = function (it, res, manual, started) {
  CR.busy = false;
  CR.writing = null;
  var j = res.j || {}, today = CR.today();
  // The answer's text blocks (a model may put other blocks, such as its
  // thinking, before them).
  var text = "", kinds = [];
  if (Array.isArray(j.content)) {
    for (var ci = 0; ci < j.content.length; ci++) {
      var blk = j.content[ci] || {};
      kinds.push(blk.type || "?");
      if (blk.type === "text" && typeof blk.text == "string") text += (text ? "\n\n" : "") + blk.text;
    }
  }
  text = text.replace(/^\s+|\s+$/g, "");
  try { CR.lastRes = res.status + " " + CR.clip(JSON.stringify(j), 600); } catch (e) { CR.lastRes = String(res.status); }
  var label = CR.label(it);
  if (res.status === 200 && text) {
    if (j.usage) { CR.usage.calls++; CR.usage.inTok += j.usage.input_tokens || 0; CR.usage.outTok += j.usage.output_tokens || 0; set_variable("chronicle_usage", JSON.stringify(CR.usage)); }
    var sum = { text: text, at: Date.now(), model: CR.model };
    if (typeof it == "number") {
      var b = CR.bucket(it, false);
      if (b) { sum.draft = it >= today; b.sum = sum; delete b.fails; }
    } else if (it.charAt(0) === "m") {
      sum.draft = +it.slice(1) >= CR.monthOf(today); CR.annals.m[+it.slice(1)] = sum; delete CR.annals.f[it]; CR.saveAnnals();
    } else {
      sum.draft = +it.slice(1) >= CR.yearOf(today); CR.annals.y[+it.slice(1)] = sum; delete CR.annals.f[it]; CR.saveAnnals();
    }
    CR.lastErr = "";
    if (manual) display_notice("[chronicle] " + label + " written.", "lime");
    CR.save();
    CR.dirty();
    if (!manual) CR.due(); else CR.pump();
    return;
  }
  var why = res.err ? "no answer (" + res.err + ")" : (j.error && j.error.message) ? res.status + ": " + j.error.message :
    res.status === 200 ? "an answer with no text (stop: " + (j.stop_reason || "?") + ", blocks: " + (kinds.join(", ") || "none") + "; CHRONICLE DEBUG shows it)" : "answer " + res.status;
  CR.lastErr = why;
  if (res.status === 400 && CR.lean && /thinking|effort|output_config/i.test(String(j.error && j.error.message || ""))) {
    CR.lean = false;
    CR.write(it, manual);
    return;
  }
  // A bad key or a bad model won't get better by waiting: stop and say so.
  if (res.status === 401 || res.status === 403 || res.status === 404 || res.status === 400) {
    CR.queue = [];
    display_notice("[chronicle] the summary for " + label + " failed, " + why + ". " +
      (res.status === 401 || res.status === 403 ? "Check your key (CHRONICLE KEY <key>)." : "Check the model (CHRONICLE MODEL)."), "orange");
    CR.dirty();
    return;
  }
  var n = 0;
  if (!manual) {
    if (typeof it == "number") { var fb = CR.bucket(it, false); if (fb) n = fb.fails = (fb.fails || 0) + 1; }
    else { n = CR.annals.f[it] = (CR.annals.f[it] || 0) + 1; CR.saveAnnals(); }
  }
  if (manual) display_notice("[chronicle] the summary for " + label + " failed, " + why + ".", "orange");
  else if (n < CR.retryMs.length) {
    CR.queue = [];
    CR.retryT = setTimeout(function () { var c = client.loom.chronicle; c.retryT = null; c.due(); }, CR.retryMs[n - 1]);
  } else display_notice("[chronicle] gave up on the summary for " + label + " after " + n + " tries (" + why + "). CHRONICLE WRITE to try again.", "orange");
  CR.save();
  CR.dirty();
  CR.pump();
};
// What CHRONICLE WRITE names: a day ("8 Scarlatan", "today", "yesterday", or
// nothing for the last day before today), MONTH [name] (this month if none),
// or YEAR [number] (this year if none).
CR.findItem = function (s) {
  s = String(s || "").replace(/^\s+|\s+$/g, "").toLowerCase();
  var today = CR.today(), m;
  if ((m = /^month(?:\s+(.+))?$/.exec(s))) {
    if (!m[1]) return today ? "m" + CR.monthOf(today) : 0;
    for (var k = CR.months.length - 1; k >= 0; k--) {
      if (CR.months[k].toLowerCase().indexOf(m[1]) === 0) {
        var cm = CR.monthOf(today), yy = Math.floor(cm / 12);
        var mi = yy * 12 + k;
        if (mi > cm) mi -= 12;
        return "m" + mi;
      }
    }
    return 0;
  }
  if ((m = /^year(?:\s+(\d+))?$/.exec(s))) return m[1] ? "y" + parseInt(m[1], 10) : (today ? "y" + CR.yearOf(today) : 0);
  if (!s) { for (var i = CR.days.length - 1; i >= 0; i--) { if (CR.days[i].d > 0 && CR.days[i].d < today && CR.days[i].ev.length) return CR.days[i].d; } return 0; }
  if (s === "today") return today;
  if (s === "yesterday") return today - 1;
  if (!(m = /^(\d+)(?:st|nd|rd|th)?\s+(?:of\s+)?([a-z]+)/.exec(s))) return 0;
  for (var j = CR.days.length - 1; j >= 0; j--) {
    if (CR.dayName(CR.days[j].d).toLowerCase().indexOf(CR.ord(parseInt(m[1], 10)) + " " + m[2]) === 0) return CR.days[j].d;
  }
  return 0;
};
