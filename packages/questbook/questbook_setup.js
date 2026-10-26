// questbook_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Questing Companion (#376): quests you write down
// yourself as lists of steps, which then walk you through them every time
// you do them again. A guide, never a bot: a step can be one click (walk
// there, send the line), but nothing runs by itself.
//
// Step 1 (Ricardo, 2026-10-26): the list and following a quest, with steps
// added by command. Recording comes next.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.questbook) client.loom.questbook = {};
client.loom.registry.questbook = { version: "0.2.2", keyword: "QUESTBOOK", desc: "{{description}}",
  redraw: function () { run_function("questbook_render", [], "questbook"); } };
var QU = client.loom.questbook;

// Saved (per character, as every Nexus variable):
//   questbook_list   = [{ id, name, area, repeat, at, rewards: { renown, gold,
//                     items: [] }, steps: [{ k, … }] }], the quests as written;
//   questbook_state  = { id: { step, started, kills, last, done } }: where you
//                   are in each, when it was last done and how often;
//   questbook_folded = [area, …], the areas folded in the tab;
//   questbook_filter = "ready" | "waiting" (absent: all);
//   questbook_midnight = "hh:mm", the game's midnight on your own clock, when
//                   monthly quests reset (absent: 02:00, Ricardo's);
//   questbook_year   = when an Achaean year began (ms), learnt from the game's
//                   date line, so yearly quests reset on 1st Sarapin.
// A variable that isn't readable starts afresh (#135).
QU.read = function (name, arr) {
  var v = get_variable(name);
  if (typeof v == "string") { try { v = JSON.parse(v); } catch (e) { v = null; } }
  if (arr) return Array.isArray(v) ? v : [];
  return (v && typeof v == "object" && !Array.isArray(v)) ? v : {};
};

// Step kinds: what a step holds and when it ticks (the issue's table).
//   go    { room, name, area }        you arrive (click: PATH FIND)
//   greet { who }                     you send GREET <who> (its button)
//   talk, ask, say { cmd }            you send it (its button sends it)
//   get, buy { what, cmd? }           it appears in your inventory
//   give, drop { what, cmd? }        it leaves your inventory
//   kill  { what, n }                 that many "You have slain …" lines
//   note  { text }                    by hand
QU.repeats = ["none", "daily", "monthly", "yearly"];
QU.kinds = ["go", "greet", "talk", "ask", "say", "get", "buy", "give", "drop", "kill", "note"];
QU.cleanStep = function (s) {
  if (!s || typeof s != "object" || QU.kinds.indexOf(String(s.k)) < 0) return null;
  var k = String(s.k), o = { k: k };
  if (k === "go") {
    if (!/^\d+$/.test(String(s.room || ""))) return null;
    o.room = String(s.room); o.name = String(s.name || ""); o.area = String(s.area || "");
  } else if (k === "greet") {
    if (!String(s.who || "").trim()) return null;
    o.who = String(s.who).trim();
  } else if (k === "talk" || k === "ask" || k === "say") {
    if (!String(s.cmd || "").trim()) return null;
    o.cmd = String(s.cmd).trim();
  } else if (k === "get" || k === "buy" || k === "give" || k === "drop") {
    if (!String(s.what || "").trim()) return null;
    o.what = String(s.what).trim();
    if (String(s.cmd || "").trim()) o.cmd = String(s.cmd).trim();
  } else if (k === "kill") {
    if (!String(s.what || "").trim()) return null;
    o.what = String(s.what).trim(); o.n = Math.max(1, Math.min(99, Math.floor(Number(s.n) || 1)));
  } else {
    if (!String(s.text || "").trim()) return null;
    o.text = String(s.text).trim();
  }
  return o;
};

QU.list = [];
var quRaw = QU.read("questbook_list", true);
for (var quI = 0; quI < quRaw.length; quI++) {
  var quE = quRaw[quI];
  if (!quE || typeof quE != "object" || !/^\d+$/.test(String(quE.id || "")) || !String(quE.name || "").trim()) continue;
  var quSt = [];
  if (Array.isArray(quE.steps)) for (var quJ = 0; quJ < quE.steps.length; quJ++) { var quS = QU.cleanStep(quE.steps[quJ]); if (quS) quSt.push(quS); }
  var quR = (quE.rewards && typeof quE.rewards == "object") ? quE.rewards : {};
  var quItems = [];
  if (Array.isArray(quR.items)) for (var quK = 0; quK < quR.items.length; quK++) if (String(quR.items[quK] || "").trim()) quItems.push(String(quR.items[quK]).trim());
  QU.list.push({ id: String(quE.id), name: String(quE.name).trim(), area: String(quE.area || ""),
    repeat: QU.repeats.indexOf(quE.repeat) >= 0 ? quE.repeat : "daily", at: Number(quE.at) || 0,
    rewards: { renown: Math.max(0, Math.floor(Number(quR.renown) || 0)), gold: Math.max(0, Math.floor(Number(quR.gold) || 0)), items: quItems },
    steps: quSt });
}
QU.state = {};
var quStRaw = QU.read("questbook_state", false);
for (var quId in quStRaw) {
  if (!quStRaw.hasOwnProperty(quId) || !/^\d+$/.test(quId)) continue;
  var quX = quStRaw[quId];
  if (!quX || typeof quX != "object") continue;
  QU.state[quId] = { step: Math.max(0, Math.floor(Number(quX.step) || 0)), started: Number(quX.started) || 0,
    kills: Math.max(0, Math.floor(Number(quX.kills) || 0)), last: Number(quX.last) || 0, done: Math.max(0, Math.floor(Number(quX.done) || 0)) };
}
QU.folded = {};
var quF = QU.read("questbook_folded", true);
for (var quL = 0; quL < quF.length; quL++) if (typeof quF[quL] == "string") QU.folded[quF[quL]] = true;
var quFl = get_variable("questbook_filter");
QU.filter = (quFl === "ready" || quFl === "waiting") ? quFl : "all";
QU.midnight = /^([01]\d|2[0-3]):[0-5]\d$/.test(String(get_variable("questbook_midnight") || "")) ? String(get_variable("questbook_midnight")) : "02:00";
QU.year = Number(get_variable("questbook_year")) || 0;
// Runtime only: the room you're in, your inventory (id -> name), the quest
// shown in the tab (open), the one being followed (ticks go to it), and
// steps struck through while editing.
if (QU.here === undefined) QU.here = null;
if (!QU.inv || typeof QU.inv != "object") QU.inv = {};
if (QU.open === undefined) QU.open = null;
if (QU.follow === undefined) QU.follow = null;
QU.edit = false;
QU.struck = {};

QU.save = function () {
  if (QU.list.length) set_variable("questbook_list", JSON.stringify(QU.list)); else delete_variable("questbook_list");
  QU.saveState();
};
QU.saveState = function () {
  var out = {}, any = false;
  for (var i = 0; i < QU.list.length; i++) {
    var s = QU.state[QU.list[i].id];
    if (s && (s.step || s.started || s.kills || s.last || s.done)) { out[QU.list[i].id] = s; any = true; }
  }
  if (any) set_variable("questbook_state", JSON.stringify(out)); else delete_variable("questbook_state");
  if (client.loom.notify) client.loom.notify("questbook");
  run_function("questbook_render", [], "questbook");
};
QU.saveFolded = function () {
  var out = [];
  for (var a in QU.folded) if (QU.folded.hasOwnProperty(a) && QU.folded[a]) out.push(a);
  if (out.length) set_variable("questbook_folded", JSON.stringify(out)); else delete_variable("questbook_folded");
};
QU.st = function (q) {
  if (!QU.state[q.id]) QU.state[q.id] = { step: 0, started: 0, kills: 0, last: 0, done: 0 };
  return QU.state[q.id];
};
QU.byId = function (id) {
  for (var i = 0; i < QU.list.length; i++) if (QU.list[i].id === String(id)) return QU.list[i];
  return null;
};
QU.byName = function (name) {
  var n = String(name || "").trim().toLowerCase();
  for (var i = 0; i < QU.list.length; i++) if (QU.list[i].name.toLowerCase() === n) return QU.list[i];
  return null;
};
// A quest by its name or its number.
QU.find = function (q) {
  q = String(q || "").trim();
  return (/^\d+$/.test(q) && QU.byId(q)) || QU.byName(q);
};
QU.nextId = function () {
  var n = 0;
  for (var i = 0; i < QU.list.length; i++) n = Math.max(n, Number(QU.list[i].id) || 0);
  return String(n + 1);
};
QU.roomName = function (n) { return String(n || "").replace(/\s*\((?:indoors|outdoors)\)\s*$/i, ""); };
QU.times = function (n) { return n === 1 ? "once" : (n === 2 ? "twice" : n + " times"); };
QU.say = function (text, colour) { display_notice("[questbook] " + text, colour || "cyan"); };

// --- Repeats --------------------------------------------------------------
// In Achaean time (Ricardo): an Achaean day is a real hour, a month a real day
// and a year 12 real days. Each resets at a set moment:
//   daily    at the top of every hour;
//   monthly  every day at the game's midnight (QU.midnight on your clock);
//   yearly   on 1st Sarapin: every 12 days from QU.year, the start of a year
//            learnt from the game's date line (until then, 12 days after you
//            last did it);
//   none     done once, never again.
QU.hourMs = 3600000;
QU.dayMs = 24 * QU.hourMs;
QU.yearMs = 12 * QU.dayMs;
// The latest monthly reset (the game's midnight) at or before now.
QU.lastMidnight = function (now) {
  var hm = QU.midnight.split(":"), d = new Date(now);
  d.setHours(Number(hm[0]), Number(hm[1]), 0, 0);
  if (d.getTime() > now) d.setDate(d.getDate() - 1);
  return d.getTime();
};
// A moment n calendar days later, at the same time on the clock.
QU.addDays = function (t, n) { var d = new Date(t); d.setDate(d.getDate() + n); return d.getTime(); };
// The latest reset of a repeat at or before now (0: none known).
QU.lastReset = function (repeat, now) {
  if (repeat === "daily") { var d = new Date(now); d.setMinutes(0, 0, 0); return d.getTime(); }
  if (repeat === "monthly") return QU.lastMidnight(now);
  if (repeat === "yearly" && QU.year) {
    // Whole calendar days, so a clock change doesn't shift the reset an hour.
    var days = Math.round((QU.lastMidnight(now) - QU.year) / QU.dayMs);
    return QU.addDays(QU.year, Math.floor(days / 12) * 12);
  }
  return 0;
};
QU.nextReset = function (repeat, now) {
  if (repeat === "daily") return QU.lastReset(repeat, now) + QU.hourMs;
  if (repeat === "monthly") return QU.addDays(QU.lastMidnight(now), 1);
  if (repeat === "yearly" && QU.year) return QU.addDays(QU.lastReset(repeat, now), 12);
  return 0;
};
// The game's date line ("Today is the 5th of Valnuary, …", or the new day's
// "It is now the …"): the month began at the last midnight, so the year
// began that many days before it.
QU.months = ["sarapin", "daedalan", "aeguary", "miraman", "scarlatan", "ero", "valnuary", "lupar", "phaestian", "chronos", "glacian", "mayan"];
QU.seeDate = function (month) {
  var m = QU.months.indexOf(String(month || "").toLowerCase());
  if (m < 0) return;
  var start = QU.addDays(QU.lastMidnight(Date.now()), -m);
  if (start === QU.year) return;
  QU.year = start;
  set_variable("questbook_year", String(start));
  run_function("questbook_render", [], "questbook");
};
// When a quest is ready again (0 = now: never done, or its reset has passed
// since); Infinity for a quest that doesn't repeat, once done.
QU.readyAt = function (q) {
  var s = QU.state[q.id], last = s ? s.last : 0;
  if (!last) return 0;
  if (q.repeat === "none") return Infinity;
  var now = Date.now();
  if (q.repeat === "yearly" && !QU.year) { var after = QU.addDays(last, 12); return after > now ? after : 0; }
  return last < QU.lastReset(q.repeat, now) ? 0 : QU.nextReset(q.repeat, now);
};
// "going" (in progress), "ready", "waiting" or "done" (doesn't repeat).
QU.status = function (q) {
  var s = QU.state[q.id];
  if (s && (s.step > 0 || s.started) && s.step < q.steps.length) return "going";
  var r = QU.readyAt(q);
  return r === Infinity ? "done" : (r ? "waiting" : "ready");
};
QU.repeatText = function (r) { return r === "none" ? "once" : r; };
QU.span = function (ms) {
  var m = Math.max(1, Math.ceil(ms / 60000));
  if (m < 60) return m + " MIN";
  var h = Math.round(m / 60);
  if (h < 48) return h + " H";
  return Math.round(h / 24) + " D";
};
QU.ago = function (t) {
  if (!t) return "never";
  var now = new Date(Date.now()), then = new Date(t);
  var day = function (d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); };
  var dd = Math.round((day(now) - day(then)) / 86400000);
  if (dd <= 0) return "today";
  if (dd === 1) return "yesterday";
  return dd + " days ago";
};
QU.rewardText = function (q) {
  var r = q.rewards, out = [];
  if (r.renown) out.push("renown " + r.renown);
  if (r.gold) out.push(r.gold.toLocaleString() + " gold");
  for (var i = 0; i < r.items.length; i++) out.push(r.items[i]);
  return out;
};

// --- Steps ----------------------------------------------------------------
// What a step does, in a few words (HELP's verbs, for notices and the tab).
QU.stepWhat = function (s) {
  if (s.k === "go") return s.name || ("room " + s.room);
  if (s.k === "talk" || s.k === "ask" || s.k === "say") return s.cmd;
  if (s.k === "greet") return s.who;
  if (s.k === "kill") return (s.n > 1 ? s.n + " × " : "") + s.what;
  if (s.k === "note") return s.text;
  return s.what;
};
// The command a step's button sends, if it has one.
QU.stepCmd = function (s) {
  if (s.k === "go") return "path find " + s.room;
  if (s.k === "greet") return "greet " + s.who;
  if (s.cmd) return s.cmd;
  return "";
};
// The name of a step's room when it's a waypoint (link waypoints-questbook).
QU.waypoint = function (id) {
  var L = client.loom.loom;
  var w = (L && L.answer) ? L.answer("questbook", "questbook.waypoint", { id: String(id) }) : undefined;
  return (w && w.name) ? w : undefined;
};
// A step from what's typed after STEP (or STEP EDIT <n> / INSERT <n>):
//   GO [room number]                  this room (or that number)
//   GREET <denizen>                   the game's way to start talking to one
//   TALK|ASK|SAY <command>
//   GET|BUY|GIVE|DROP <item> [/ <command>]
//   KILL [count] <mob>
//   NOTE <text>
// `was`: the step being edited (a GO to the same room keeps its name).
// -> { step } or { err }.
QU.parseStep = function (text, was) {
  text = String(text || "").trim();
  var sp = text.search(/\s/);
  var k = (sp < 0 ? text : text.substring(0, sp)).toLowerCase();
  var rest = sp < 0 ? "" : text.substring(sp).trim();
  var usage = "QUESTBOOK STEP GO [room] | GREET <denizen> | TALK|ASK|SAY <command> | GET|BUY|GIVE|DROP <item> [/ <command>] | KILL [count] <mob> | NOTE <text> (also STEP EDIT <n> …, STEP INSERT <n> …, STEP REMOVE <n>).";
  if (k === "go") {
    if (rest && !/^\d+$/.test(rest)) return { err: "QUESTBOOK STEP GO [room number]: no number saves the room you're in." };
    if (!rest) {
      if (!QU.here || !QU.here.id) return { err: "no room yet: move or LOOK first (or give the room's number)." };
      return { step: { k: "go", room: QU.here.id, name: QU.here.name, area: QU.here.area } };
    }
    if (QU.here && QU.here.id === rest) return { step: { k: "go", room: rest, name: QU.here.name, area: QU.here.area } };
    if (was && was.k === "go" && was.room === rest) return { step: { k: "go", room: rest, name: was.name, area: was.area } };
    var w = QU.waypoint(rest);
    return { step: { k: "go", room: rest, name: w ? w.name : "", area: "" } };
  }
  if (k === "greet") {
    if (!rest) return { err: "QUESTBOOK STEP GREET <denizen>, as you'd type GREET in the game." };
    return { step: { k: "greet", who: rest } };
  }
  if (k === "talk" || k === "ask" || k === "say") {
    if (!rest) return { err: "QUESTBOOK STEP " + k.toUpperCase() + " <the command, as you'd type it>." };
    return { step: { k: k, cmd: rest } };
  }
  if (k === "get" || k === "buy" || k === "give" || k === "drop") {
    var p = rest.split(/\s+\/\s+/);
    if (!p[0]) return { err: "QUESTBOOK STEP " + k.toUpperCase() + " <item> [/ <command>]." };
    return { step: { k: k, what: p[0], cmd: p.slice(1).join(" / ") } };
  }
  if (k === "kill") {
    var m = /^(?:(\d+)\s+)?(.+)$/.exec(rest);
    if (!m) return { err: "QUESTBOOK STEP KILL [count] <mob>." };
    return { step: { k: "kill", n: Number(m[1] || 1), what: m[2] } };
  }
  if (k === "note") {
    if (!rest) return { err: "QUESTBOOK STEP NOTE <text>." };
    return { step: { k: "note", text: rest } };
  }
  return { err: usage };
};
// A step written back as it would be typed (✎ in EDIT STEPS puts it in the
// input line after STEP EDIT <n>).
QU.stepSpec = function (s) {
  if (s.k === "go") return "GO " + s.room;
  if (s.k === "talk" || s.k === "ask" || s.k === "say") return s.k.toUpperCase() + " " + s.cmd;
  if (s.k === "greet") return "GREET " + s.who;
  if (s.k === "kill") return "KILL " + (s.n > 1 ? s.n + " " : "") + s.what;
  if (s.k === "note") return "NOTE " + s.text;
  return s.k.toUpperCase() + " " + s.what + (s.cmd ? " / " + s.cmd : "");
};
// Replace step i (edit), or put a new one before it (insert). Where you are
// in the quest stays on the same step.
QU.putStep = function (q, i, s, insert) {
  s = QU.cleanStep(s);
  if (!s) return false;
  var st = QU.state[q.id];
  if (insert) { q.steps.splice(i, 0, s); if (st && st.step > i) st.step++; }
  else { q.steps[i] = s; if (st && st.step === i) st.kills = 0; }
  QU.save();
  QU.say(q.name + ": step " + (i + 1) + (insert ? " inserted: " : " is now ") + s.k.toUpperCase() + " " + QU.stepWhat(s) + ".", "lime");
  return true;
};
// What a repeat means, for notices.
QU.repeatWhen = function (r) {
  if (r === "daily") return "an Achaean day: at the top of every hour";
  if (r === "monthly") return "an Achaean month: every day at the game's midnight, " + QU.midnight + " on your clock";
  if (r === "yearly") return "an Achaean year: every 12 days, on 1st Sarapin" + (QU.year ? "" : "; type DATE once so Questbook knows when that is");
  return "once";
};
QU.addStep = function (q, s) {
  s = QU.cleanStep(s);
  if (!s) return false;
  q.steps.push(s);
  QU.save();
  QU.say(q.name + ": step " + q.steps.length + " " + s.k.toUpperCase() + " " + QU.stepWhat(s) + ".", "lime");
  return true;
};
QU.removeStep = function (q, i) {
  var s = q.steps.splice(i, 1)[0];
  var st = QU.state[q.id];
  if (st && st.step > i) st.step--;
  if (st && st.step === i) st.kills = 0;
  QU.save();
  QU.say(q.name + ": removed step " + (i + 1) + " " + s.k.toUpperCase() + " " + QU.stepWhat(s) + ".", "lime");
};

// --- Following ------------------------------------------------------------
// Open a quest in the tab; one you can do now is followed: its steps tick as
// you play. A waiting quest is only shown, and so is one you're writing
// (QUESTBOOK NEW): adding GO steps where you stand mustn't tick them. START
// OVER or FOLLOW THIS follows it.
QU.openQuest = function (q, writing) {
  QU.open = q ? q.id : null;
  QU.edit = false; QU.struck = {};
  if (q && !writing && q.steps.length && (QU.status(q) === "ready" || QU.status(q) === "going")) QU.follow = q.id;
  QU.check();
  run_function("questbook_render", [], "questbook");
};
QU.followed = function () { return QU.follow ? QU.byId(QU.follow) : null; };
QU.current = function (q) {
  var s = QU.state[q.id], i = s ? s.step : 0;
  return i < q.steps.length ? q.steps[i] : null;
};
// The current step of the followed quest is done: on to the next, and the
// quest is done after its last.
QU.tick = function (why) {
  var q = QU.followed();
  if (!q) return;
  var st = QU.st(q), s = q.steps[st.step];
  if (!s) return;
  if (!st.started) st.started = Date.now();
  st.step++; st.kills = 0;
  if (st.step >= q.steps.length) { QU.finish(q); return; }
  QU.say(q.name + ": " + (why ? why + ". " : "") + "Step " + (st.step + 1) + " of " + q.steps.length + ": " + q.steps[st.step].k.toUpperCase() + " " + QU.stepWhat(q.steps[st.step]) + ".", "lime");
  QU.saveState();
  QU.check();
};
QU.finish = function (q) {
  var st = QU.st(q);
  st.step = 0; st.started = 0; st.kills = 0; st.last = Date.now(); st.done++;
  if (QU.follow === q.id) QU.follow = null;
  var ra = QU.readyAt(q);
  QU.say(q.name + " done (" + QU.times(st.done) + ")." + (ra === Infinity ? " It doesn't repeat." : (ra ? " Again in " + QU.span(ra - Date.now()).toLowerCase() + "." : "")), "lime");
  QU.saveState();
};
QU.back = function (q) {
  var st = QU.st(q);
  if (st.step > 0) { st.step--; st.kills = 0; QU.saveState(); return true; }
  return false;
};
QU.restart = function (q) {
  var st = QU.st(q);
  st.step = 0; st.started = 0; st.kills = 0;
  QU.follow = q.id;
  QU.saveState();
};
// Jump to a step (a click on its number): the steps before it count as done.
QU.jump = function (q, i) {
  if (i < 0 || i >= q.steps.length) return;
  var st = QU.st(q);
  st.step = i; st.kills = 0;
  if (!st.started && i > 0) st.started = Date.now();
  QU.follow = q.id;
  QU.saveState();
  QU.check();
};
// A GO step whose room you're already in ticks at once (after any tick, an
// added step or opening the quest, and on every arrival).
QU.check = function () {
  for (var guard = 0; guard < 50; guard++) {
    var q = QU.followed();
    if (!q) return;
    var s = QU.current(q);
    if (!s || s.k !== "go" || !QU.here || QU.here.id !== s.room) return;
    QU.tick("You're at " + (s.name || s.room));
  }
};
// The current step's button: walk, or send its line (which ticks it).
QU.act = function () {
  var q = QU.followed();
  if (!q) return;
  var s = QU.current(q);
  if (!s) return;
  if (s.k === "note" || s.k === "kill" || ((s.k === "get" || s.k === "buy" || s.k === "give" || s.k === "drop") && !s.cmd)) { QU.tick("Ticked by hand"); return; }
  if (get_variable("pauseTriggers") == "on") { QU.say("Loom is paused (LOOM PAUSE OFF to send).", "orange"); return; }
  var cmd = QU.stepCmd(s);
  if (s.k === "go" && QU.here && QU.here.id === s.room) { QU.check(); return; }
  send_command(cmd, 1);
  if (s.k === "talk" || s.k === "ask" || s.k === "say" || s.k === "greet") QU.tick("Sent");
  else if (s.k === "go") QU.say("walking to " + (s.name || s.room) + " (" + s.room + ").", "cyan");
};

// Game events, for the followed quest's current step.
QU.onArrive = function () { QU.check(); };
QU.norm = function (t) { return String(t || "").toLowerCase().replace(/\s+/g, " ").trim(); };
// An item's name matches a step's item when it holds the step's words.
QU.itemMatch = function (name, what) {
  var n = QU.norm(name), w = QU.norm(what);
  return !!w && n.indexOf(w) >= 0;
};
QU.onInvAdd = function (name) {
  var q = QU.followed(), s = q && QU.current(q);
  if (s && (s.k === "get" || s.k === "buy") && QU.itemMatch(name, s.what)) QU.tick("You have " + name);
};
QU.onInvRemove = function (name) {
  var q = QU.followed(), s = q && QU.current(q);
  if (s && (s.k === "give" || s.k === "drop") && QU.itemMatch(name, s.what)) QU.tick(name + " is gone");
};
QU.onSlain = function (what) {
  var q = QU.followed(), s = q && QU.current(q);
  if (!s || s.k !== "kill" || !QU.itemMatch(what, s.what)) return;
  var st = QU.st(q);
  st.kills++;
  if (st.kills >= s.n) { QU.tick("Killed " + s.n); return; }
  if (!st.started) st.started = Date.now();
  QU.say(q.name + ": " + st.kills + " of " + s.n + " " + s.what + ".", "lime");
  QU.saveState();
};

// --- Tab helpers ----------------------------------------------------------
QU.setFilter = function (f) {
  QU.filter = (f === "ready" || f === "waiting") ? f : "all";
  if (QU.filter === "all") delete_variable("questbook_filter"); else set_variable("questbook_filter", QU.filter);
  run_function("questbook_render", [], "questbook");
};
QU.fold = function (area) {
  QU.folded[area] = !QU.folded[area];
  QU.saveFolded();
  run_function("questbook_render", [], "questbook");
};
// EDIT STEPS: × strikes a step through (click again brings it back); DONE
// EDITING drops the struck steps.
QU.editDone = function () {
  var q = QU.open ? QU.byId(QU.open) : null;
  if (q) {
    var idx = [];
    for (var k in QU.struck) if (QU.struck.hasOwnProperty(k) && QU.struck[k]) idx.push(Number(k));
    idx.sort(function (a, b) { return b - a; });
    for (var i = 0; i < idx.length; i++) if (idx[i] < q.steps.length) QU.removeStep(q, idx[i]);
  }
  QU.edit = false; QU.struck = {};
  run_function("questbook_render", [], "questbook");
};

// The read-only look other packages see through loom: never its variables.
//   look.quest(id) -> { name, area, status, step, steps } or undefined;
//   look.following() -> the followed quest's { id, name, step, steps, kind }.
QU.look = {
  quest: function (id) {
    var q = QU.byId(id);
    if (!q) return undefined;
    var s = QU.state[q.id];
    return { name: q.name, area: q.area, status: QU.status(q), step: s ? s.step : 0, steps: q.steps.length };
  },
  following: function () {
    var q = QU.followed();
    if (!q) return undefined;
    var c = QU.current(q);
    return { id: q.id, name: q.name, step: QU.st(q).step, steps: q.steps.length, kind: c ? c.k : "" };
  }
};

// The tab's clicks. Its page shares window with the scripts but can't reach
// client.loom in every Nexus, so these closures carry them.
try {
  window.loomQuestbook = {
    open: function (id) { var Q = client.loom.questbook; Q.openQuest(id ? Q.byId(id) : null); },
    filter: function (f) { client.loom.questbook.setFilter(f); },
    fold: function (i) { var Q = client.loom.questbook, g = Q.areasDrawn || []; if (g[i] !== undefined) Q.fold(g[i]); },
    act: function () { client.loom.questbook.act(); },
    next: function () { client.loom.questbook.tick("Ticked by hand"); },
    jump: function (i) { var Q = client.loom.questbook, q = Q.open ? Q.byId(Q.open) : null; if (q && !Q.edit) Q.jump(q, i); },
    restart: function () { var Q = client.loom.questbook, q = Q.open ? Q.byId(Q.open) : null; if (q) { Q.restart(q); Q.say(q.name + ": started over.", "lime"); Q.check(); } },
    follow: function () { var Q = client.loom.questbook, q = Q.open ? Q.byId(Q.open) : null; if (q) { Q.follow = q.id; Q.check(); run_function("questbook_render", [], "questbook"); } },
    edit: function () { var Q = client.loom.questbook; if (Q.edit) Q.editDone(); else { Q.edit = true; Q.struck = {}; run_function("questbook_render", [], "questbook"); } },
    // ✎: "questbook step edit <n> <the step as typed>" into the input line,
    // to fix and send (Nexus's input is a React field, so the value goes in
    // through the native setter and an input event, as comms does).
    pen: function (i) {
      var Q = client.loom.questbook, q = Q.open ? Q.byId(Q.open) : null;
      if (!q || !q.steps[i]) return;
      var v = "questbook step edit " + (i + 1) + " " + Q.stepSpec(q.steps[i]);
      var inp = window.loomQuestbook.input();
      if (!inp) { Q.say("couldn't find the input line. Type: " + v, "orange"); return; }
      try {
        var desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inp), "value");
        if (desc && desc.set) desc.set.call(inp, v); else inp.value = v;
      } catch (e) { inp.value = v; }
      try { inp.dispatchEvent(new Event("input", { bubbles: true })); } catch (e) {}
      try { inp.focus(); inp.setSelectionRange(v.length, v.length); } catch (e) {}
    },
    input: function () {
      var ids = ["userinput", "user_input", "input", "command_input"];
      for (var i = 0; i < ids.length; i++) {
        var e = document.getElementById(ids[i]);
        if (e && (e.tagName === "TEXTAREA" || e.tagName === "INPUT")) return e;
      }
      var li = window.loomCommsLastInput || window.loomQuestbookLastInput;
      if (li && li.isConnected && li.offsetParent !== null) return li;
      var sels = ["textarea", "input[type=text], input:not([type])"];
      for (var s = 0; s < sels.length; s++) {
        var all = document.querySelectorAll(sels[s]);
        for (var j = 0; j < all.length; j++) { if (all[j].offsetParent !== null) return all[j]; }
      }
      return null;
    },
    strike: function (i) { var Q = client.loom.questbook; Q.struck[i] = !Q.struck[i]; run_function("questbook_render", [], "questbook"); },
    record: function () { client.loom.questbook.say("recording comes in the next step of #376. For now: QUESTBOOK NEW <name>, then QUESTBOOK STEP … (QUESTBOOK HELP).", "cyan"); }
  };
  if (!window.loomQuestbookFocus) {
    window.loomQuestbookFocus = true;
    document.addEventListener("focusin", function (ev) {
      var tg = ev.target;
      if (tg && (tg.tagName === "TEXTAREA" || (tg.tagName === "INPUT" && (!tg.type || tg.type === "text")))) window.loomQuestbookLastInput = tg;
    }, true);
  }
} catch (e) {}
// "AGAIN IN 5 H" counts down, and a quest turns ready at its reset with no
// game event to say so: the tab redraws once a minute (it sends nothing).
// Replaced on each setup, stopped at uninstall.
if (QU.clock) clearInterval(QU.clock);
QU.clock = setInterval(function () { run_function("questbook_render", [], "questbook"); }, 60000);
if (client.loom.notify) client.loom.notify("questbook");
