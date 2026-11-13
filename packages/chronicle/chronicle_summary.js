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
CR.system = function (prev) {
  var name = CR.me || "the adventurer";
  var p = [];
  if (CR.person === "first") {
    p.push("You keep the private journal of " + name + ", an adventurer of Achaea. Write as " + name + ", in the first person and past tense, as an entry written at the end of the day: plain, measured prose in their own manner, the way a journal kept in Sapience would read.");
  } else {
    p.push("You are the chronicler of " + name + ", an adventurer of Achaea. Write as an unnamed scribe keeping their annals: third person, past tense, measured and plain, the way a record kept in Sapience would read.");
  }
  p.push("Use the world's own terms. Never mention game mechanics: experience, levels, renown, credits, kill counts, minutes, commands, quests as such, or the client. Hunting is hunting; a quest is a task or a deed.");
  p.push("Leave out anything out of character: talk of the game and its tools, the real world, and anything that reads as players talking rather than their characters.");
  p.push("Invent nothing: no events, motives, feelings or relationships the record doesn't show. Where the record is unclear, say less.");
  p.push("Keep what changes things: people met, promises made, tasks taken on, letters, messages and news, places first seen, words that mattered. Pass over routine. Name people as the record names them.");
  p.push("Write one paragraph of about " + CR.words + " words (fewer for a quiet day), plain text, no heading and no date: the date is shown above it. British spelling.");
  var f = CR.facts();
  if (f) p.push("Who " + name + " is, as the world knows: " + f);
  if (CR.voice) p.push("What the player tells you about " + name + " (take it as true, and let it shape what matters, without repeating it): " + CR.voice);
  if (prev) p.push("The previous entry, for continuity only (don't repeat it): " + prev);
  return p.join("\n\n");
};
// The day's record as lines, cut to the budget.
CR.recordText = function (b) {
  var out = [], len = 0;
  for (var i = 0; i < b.ev.length; i++) {
    var e = b.ev[i];
    if (e.k == "link" && e.src == "chronicle") continue;
    var ln = CR.hhmm(e.t) + " " + e.k + ": " + CR.clip(CR.show(e), 1500).replace(/\n/g, " / ");
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

// --- the queue ----------------------------------------------------------------
// Every day before today that has a record and no summary (and hasn't failed
// three times) is written, one at a time, oldest first: at each new day, and
// at load, so a day you logged out in is written next time.
CR.due = function () {
  var today = CR.today();
  if (!today) return;
  for (var i = 0; i < CR.days.length; i++) {
    var b = CR.days[i];
    if (b.d > 0 && b.d < today && b.ev.length && (!b.sum || b.sum.draft) && (b.fails || 0) < CR.retryMs.length && !CR.retryT && CR.queue.indexOf(b.d) < 0) CR.queue.push(b.d);
  }
  CR.queue.sort(function (a, c) { return a - c; });
  CR.pump();
};
CR.pump = function () {
  if (CR.busy || !CR.queue.length || !CR.auto || !CR.getKey()) return;
  CR.write(CR.queue.shift(), false);
};
// One call. manual: CHRONICLE WRITE, which reports back and ignores past
// failures. A day still going (today) gets a draft, replaced when it ends.
CR.write = function (d, manual) {
  var b = CR.bucket(d, false), key = CR.getKey();
  if (!b || !b.ev.length) { if (manual) display_notice("[chronicle] nothing recorded for " + CR.dayName(d) + ".", "cyan"); CR.busy = false; CR.pump(); return; }
  if (!key) { if (manual) display_notice("[chronicle] no API key in this browser: CHRONICLE KEY <key> first.", "orange"); return; }
  CR.busy = true;
  CR.writing = d;
  var body = {
    model: CR.model,
    max_tokens: 600,
    system: CR.system(CR.prevSum(d)),
    messages: [{ role: "user", content: "The record of " + CR.dayName(d) + ", line by line (time, kind, what happened):\n\n" + CR.recordText(b) + "\n\nWrite the entry for this day." }]
  };
  var started = Date.now();
  fetch(CR.api, {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true", "content-type": "application/json" },
    body: JSON.stringify(body)
  }).then(function (r) {
    return r.json().then(function (j) { return { status: r.status, j: j }; }, function () { return { status: r.status, j: null }; });
  }).then(function (res) {
    client.loom.chronicle.written(d, res, manual, started);
  }).catch(function (e) {
    client.loom.chronicle.written(d, { status: 0, j: null, err: String(e && e.message || e) }, manual, started);
  });
};
CR.written = function (d, res, manual, started) {
  CR.busy = false;
  CR.writing = 0;
  var b = CR.bucket(d, false);
  var j = res.j || {};
  var text = (j.content && j.content[0] && typeof j.content[0].text == "string") ? j.content[0].text.replace(/^\s+|\s+$/g, "") : "";
  if (res.status === 200 && text && b) {
    if (j.usage) { CR.usage.calls++; CR.usage.inTok += j.usage.input_tokens || 0; CR.usage.outTok += j.usage.output_tokens || 0; set_variable("chronicle_usage", JSON.stringify(CR.usage)); }
    b.sum = { text: text, at: Date.now(), model: CR.model, draft: d >= CR.today() };
    delete b.fails;
    CR.lastErr = "";
    if (manual) display_notice("[chronicle] " + CR.dayName(d) + " written.", "lime");
    CR.save();
    CR.dirty();
    CR.pump();
    return;
  }
  var why = res.err ? "no answer (" + res.err + ")" : (j.error && j.error.message) ? res.status + ": " + j.error.message : "answer " + res.status;
  CR.lastErr = why;
  // A bad key or a bad model won't get better by waiting: stop and say so.
  if (res.status === 401 || res.status === 403 || res.status === 404 || res.status === 400) {
    CR.queue = [];
    display_notice("[chronicle] the summary for " + CR.dayName(d) + " failed, " + why + ". " +
      (res.status === 401 || res.status === 403 ? "Check your key (CHRONICLE KEY <key>)." : "Check the model (CHRONICLE MODEL)."), "orange");
    CR.dirty();
    return;
  }
  if (b && !manual) b.fails = (b.fails || 0) + 1;
  var n = b ? (b.fails || 0) : 0;
  if (manual) display_notice("[chronicle] the summary for " + CR.dayName(d) + " failed, " + why + ".", "orange");
  else if (n < CR.retryMs.length) {
    CR.retryT = setTimeout(function () { var c = client.loom.chronicle; c.retryT = null; c.due(); }, CR.retryMs[n - 1]);
  } else display_notice("[chronicle] gave up on the summary for " + CR.dayName(d) + " after " + n + " tries (" + why + "). CHRONICLE WRITE " + CR.dayName(d).replace(/,.*$/, "") + " to try again.", "orange");
  CR.save();
  CR.dirty();
  CR.pump();
};
// A day by name ("8th Scarlatan", "8 scarlatan", "today", "yesterday"), or
// the last day before today.
CR.findDay = function (s) {
  s = String(s || "").replace(/^\s+|\s+$/g, "").toLowerCase();
  var today = CR.today();
  if (!s) { for (var i = CR.days.length - 1; i >= 0; i--) { if (CR.days[i].d > 0 && CR.days[i].d < today && CR.days[i].ev.length) return CR.days[i].d; } return 0; }
  if (s === "today") return today;
  if (s === "yesterday") return today - 1;
  var m = /^(\d+)(?:st|nd|rd|th)?\s+(?:of\s+)?([a-z]+)/.exec(s);
  if (!m) return 0;
  for (var j = CR.days.length - 1; j >= 0; j--) {
    var nm = CR.dayName(CR.days[j].d).toLowerCase();
    if (nm.indexOf(CR.ord(parseInt(m[1], 10)) + " " + m[2]) === 0) return CR.days[j].d;
  }
  return 0;
};
