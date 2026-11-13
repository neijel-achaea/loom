// chronicle_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, saved state, helpers.
//
// Chronicle (#491) keeps a record of what happens to your character, one
// Achaean day (one real hour) at a time: the areas you spend time in and the
// rooms you linger in, the IC channels, emotes in your room, the letters,
// messages and news you read, notes you add, and what other packages report
// through loom. This is the record only; summaries written from it come in a
// later version (docs/chronicle.md).
//
// Data kept, per day: CR.days = [{ d, ev: [event...] }], oldest first, saved
// in chronicle_days. d is the Achaean day number (as ledger's: year * 300 +
// month * 25 + day, months from 0), 0 for events from before the date was
// known. Every event has t (ms) and k (its kind):
//   place  { area, room }             an area you spent a minute or more in
//   stay   { room, area, min, with }  a room you stayed in 5 minutes or more
//   chan   { ch, name, who, text }    a line on an IC channel (tells too)
//   emote  { who, text }              an emote by someone in your room
//   letter { what, text }             a letter you read
//   msg    { num, who, text }         a message you read
//   news   { section, num, date, from, to, subject, text }
//   note   { text }                   CHRONICLE NOTE
//   link   { src, key, text }         from another package, through loom
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.chronicle) client.loom.chronicle = {};
client.loom.registry.chronicle = { version: "0.1.0", keyword: "CHRONICLE", desc: "{{description}}",
  redraw: function () { run_function("chronicle_render", [], "chronicle"); } };
var CR = client.loom.chronicle;

// Limits. A day keeps its last perDay events; the record keeps maxDays days,
// and drops the oldest while it's over maxBytes saved.
CR.perDay = 600;
CR.maxDays = 30;
CR.maxBytes = 400000;
CR.textMax = 600;     // a channel line or emote
CR.longMax = 5000;    // a letter, message or news post
CR.areaMs = 60000;    // an area counts after a minute in it
CR.stayMs = 300000;   // a room after five minutes
CR.capMs = 10000;     // a capture with no prompt seen ends after this
CR.emoteMax = 6;      // emotes from one person in a minute before they're taken for combat
CR.emoteMute = 120000;

// Saved state. A variable that isn't a readable table starts afresh (#135).
CR.readVar = function (name) {
  var v;
  try { v = get_variable(name); } catch (e) { v = undefined; }
  if (typeof v == "string") { try { v = JSON.parse(v); } catch (e) { v = null; } }
  return v;
};
if (!Array.isArray(CR.days)) {
  var crD = CR.readVar("chronicle_days");
  CR.days = [];
  if (Array.isArray(crD)) {
    for (var crI = 0; crI < crD.length; crI++) {
      var crB = crD[crI];
      if (crB && typeof crB == "object" && typeof crB.d == "number" && Array.isArray(crB.ev)) CR.days.push({ d: crB.d, ev: crB.ev.filter(function (e) { return e && typeof e == "object" && e.k; }) });
    }
  }
}
if (!CR.anchor) {
  var crA = CR.readVar("chronicle_anchor");
  CR.anchor = (crA && typeof crA == "object" && typeof crA.d == "number" && crA.d > 0 && typeof crA.at == "number") ? crA : null;
}
if (!CR.over || typeof CR.over != "object") {
  var crO = CR.readVar("chronicle_channels");
  CR.over = (crO && typeof crO == "object" && !Array.isArray(crO)) ? crO : {};
}
if (CR.me === undefined) { var crM = CR.readVar("chronicle_name"); CR.me = typeof crM == "string" ? crM : ""; }
if (!CR.seen) CR.seen = {};        // channel key -> true, heard this session
if (!CR.captions) CR.captions = {};
if (!CR.players) CR.players = {};  // lower-case name -> name, in your room
if (!CR.room) CR.room = null;
if (!CR.area) CR.area = null;
if (!CR.rate) CR.rate = {};
if (!CR.recent) CR.recent = [];    // channel lines just heard: [plain, at]
if (CR.capt === undefined) CR.capt = null;
if (CR.cont === undefined) CR.cont = null;

// --- time and days ---------------------------------------------------------
// One Achaean day is one real hour, and a new one begins at the top of the
// hour (Ricardo). So from one known date (the anchor) any moment's day is
// worked out by counting whole hours: the date stays right across reloads and
// time away. Every date line the game shows moves the anchor.
CR.hour = function (t) { return Math.floor(t / 3600000); };
CR.dayOf = function (t) {
  var a = CR.anchor;
  return a ? a.d + CR.hour(t) - CR.hour(a.at) : 0;
};
CR.months = ["Sarapin", "Daedalan", "Aeguary", "Miraman", "Scarlatan", "Ero", "Valnuary", "Lupar", "Phaestian", "Chronos", "Glacian", "Mayan"];
CR.ord = function (n) {
  var s = (n % 100 >= 11 && n % 100 <= 13) ? "th" : (["th", "st", "nd", "rd"][n % 10] || "th");
  return n + s;
};
CR.dayName = function (d) {
  if (!d) return "undated";
  var n = d - 1, y = Math.floor(n / 300), r = n - y * 300;
  return CR.ord((r % 25) + 1) + " " + CR.months[Math.floor(r / 25)] + ", " + y + " AF";
};
// A date line: "It is now the 5th of Lupar, 1016 years after..." (the hourly
// rollover) or "Today is the ..." (DATE).
CR.setDate = function (dd, month, yy) {
  var mi = -1;
  for (var i = 0; i < CR.months.length; i++) { if (CR.months[i].toLowerCase() == String(month).toLowerCase()) mi = i; }
  if (mi < 0) return;
  var d = yy * 300 + mi * 25 + dd;
  var had = !!CR.anchor;
  CR.anchor = { d: d, at: Date.now() };
  set_variable("chronicle_anchor", JSON.stringify(CR.anchor));
  if (!had) CR.relabel();
  CR.dirty();
};
// Ledger's date, when it has one and ours is missing.
CR.borrowDate = function () {
  var lg = client.loom && client.loom.ledger;
  if (!CR.anchor && lg && typeof lg.day == "number" && lg.day > 0) {
    CR.anchor = { d: lg.day, at: Date.now() };
    set_variable("chronicle_anchor", JSON.stringify(CR.anchor));
    CR.relabel();
  }
};
// Events kept before the date was known go to their own day once it is.
CR.relabel = function () {
  var und = null, i;
  for (i = 0; i < CR.days.length; i++) { if (CR.days[i].d === 0) und = CR.days.splice(i, 1)[0]; }
  if (!und || !CR.anchor) { if (und) CR.days.unshift(und); return; }
  for (i = 0; i < und.ev.length; i++) CR.put(und.ev[i]);
};
CR.today = function () { return CR.dayOf(Date.now()); };
CR.bucket = function (d, make) {
  for (var i = CR.days.length - 1; i >= 0; i--) { if (CR.days[i].d === d) return CR.days[i]; }
  if (!make) return null;
  var b = { d: d, ev: [] };
  var at = CR.days.length;
  while (at > 0 && CR.days[at - 1].d > d) at--;
  CR.days.splice(at, 0, b);
  return b;
};

// --- recording ---------------------------------------------------------------
CR.plain = function (s) { return String(s === undefined || s === null ? "" : s).replace(/\u001b\[[0-9;]*m/g, "").replace(/[\u0000-\u0009\u000b-\u001f]/g, "").replace(/\s+$/, ""); };
CR.clip = function (s, n) { s = String(s); return s.length > n ? s.slice(0, n - 1) + "\u2026" : s; };
CR.put = function (ev) {
  var b = CR.bucket(CR.dayOf(ev.t), true);
  // In time order: an area or a stay is recorded when it has lasted, but
  // belongs where it began.
  var at = b.ev.length;
  while (at > 0 && b.ev[at - 1].t > ev.t) at--;
  b.ev.splice(at, 0, ev);
  if (b.ev.length > CR.perDay) b.ev.splice(0, b.ev.length - CR.perDay);
};
CR.add = function (ev) {
  if (!ev.t) ev.t = Date.now();
  CR.borrowDate();
  // The same line again within two minutes (an NPC thanking you for each
  // corpse, someone following you room after room) counts up the first.
  if (ev.k == "chan" || ev.k == "emote") {
    var rb = CR.bucket(CR.dayOf(ev.t), false);
    if (rb) {
      for (var ri = rb.ev.length - 1; ri >= 0 && ri >= rb.ev.length - 8; ri--) {
        var re = rb.ev[ri];
        if (ev.t - re.t > 120000) break;
        if (re.k == ev.k && re.text == ev.text) { re.n = (re.n || 1) + 1; CR.dirty(); return re; }
      }
    }
  }
  CR.put(ev);
  CR.dirty();
  return ev;
};
// Saved a little later, so a busy hour writes once in a while rather than per
// line; drawn soon after, so a burst is one draw.
CR.dirty = function () {
  if (!CR.saveT) CR.saveT = setTimeout(function () { client.loom.chronicle.saveT = null; client.loom.chronicle.save(); }, 10000);
  if (!CR.drawT) CR.drawT = setTimeout(function () { client.loom.chronicle.drawT = null; run_function("chronicle_render", [], "chronicle"); }, 300);
};
CR.save = function () {
  while (CR.days.length > CR.maxDays) CR.days.shift();
  var s = JSON.stringify(CR.days);
  while (s.length > CR.maxBytes && CR.days.length > 1) { CR.days.shift(); s = JSON.stringify(CR.days); }
  set_variable("chronicle_days", s);
};

// --- channels -----------------------------------------------------------------
// IC channels are kept, OOC and utility ones not (Ricardo, 2026-11-13): say,
// tells, yell, the city, house and order, house newbie, group, clans and the
// gods' emotes. Any other channel is left out until CHRONICLE CHANNEL <key> ON.
CR.names = function (k) {
  k = String(k || "");
  return [k, String(CR.captions[k] || "").replace(/^the\s+/i, "")].join("|").toLowerCase();
};
CR.chanDefault = function (k) {
  if (/^tell\s/i.test(String(k))) return true;
  return /(?:^|\|)(?:says?|tells?|yells?|ct|city|ht|gt|house|hnt|gnt|house newbie[^|]*|ot|order|group|emotes?|clt\d+|clan of[^|]*)(?:\||$)/.test(CR.names(k));
};
CR.chanKey = function (k) { k = String(k || ""); return /^tell\s/i.test(k) ? "tells" : k; };
CR.chanOn = function (k) {
  var key = CR.chanKey(k);
  if (CR.over[key] !== undefined) return !!CR.over[key];
  return CR.chanDefault(k);
};
CR.chanName = function (k) {
  k = String(k || "");
  if (/^tell\s/i.test(k)) return "tell";
  if (CR.captions[k]) return CR.captions[k].replace(/^the\s+(?:clan\s+of\s+)?/i, "");
  // Until the game sends the channel list (at login): the key, readably.
  var nice = { says: "Says", ct: "City", ht: "House", gt: "House", hnt: "House newbie", gnt: "House newbie", ot: "Order", yell: "Yell", yells: "Yell", emotes: "Emotes" };
  return nice[k] || k;
};
// Anything after // is OOC (Ricardo) and left out; a line with nothing IC
// left goes altogether. A URL's :// is not a marker.
CR.ic = function (text) {
  var m = /(^|[^:])\/\/.*$/.exec(text);
  if (!m) return text;
  var t = text.slice(0, m.index + m[1].length).replace(/\s+$/, "");
  if ((t.match(/"/g) || []).length % 2 === 1) {
    if (/"\s*$/.test(t)) return "";
    t += '"';
  }
  if (/^\([^)]*\):?\s*$/.test(t) || /,\s*""$/.test(t) || !/\S/.test(t)) return "";
  return t;
};
CR.chan = function (g) {
  var k = String(g.channel || "");
  if (!k) return;
  CR.seen[CR.chanKey(k)] = true;
  if (!CR.chanOn(k)) return;
  var text = CR.ic(CR.plain(g.text));
  if (!text) return;
  // The channel's own prefix ("(Heartwood): ") goes: the entry names it.
  var bare = text.replace(/^\([^)]{1,40}\):\s+/, "");
  var now = Date.now();
  CR.recent.push([text, now]);
  while (CR.recent.length > 20 || (CR.recent.length && now - CR.recent[0][1] > 5000)) CR.recent.shift();
  // The same line taken for an emote a moment ago (it came as text first).
  var b = CR.bucket(CR.dayOf(now), false);
  if (b) {
    for (var i = b.ev.length - 1; i >= 0 && i >= b.ev.length - 5; i--) {
      if (b.ev[i].k == "emote" && b.ev[i].text == text && now - b.ev[i].t < 5000) b.ev.splice(i, 1);
    }
  }
  CR.add({ t: now, k: "chan", ch: CR.chanKey(k), name: CR.chanName(k), who: String(g.talker || ""), text: CR.clip(bare, CR.textMax) });
};

// --- places ---------------------------------------------------------------------
CR.enter = function (g) {
  var num = g.num !== undefined ? String(g.num) : "";
  if (CR.room && CR.room.num === num) return;
  var now = Date.now();
  CR.leave(now);
  var area = String(g.area || "");
  if (!CR.area || CR.area.name !== area) CR.area = { name: area, at: now, ev: null };
  CR.room = { num: num, name: CR.plain(g.name), area: area, at: now, ev: null, with: {} };
  CR.players = {};
};
CR.leave = function (now) {
  var r = CR.room;
  if (r && r.ev) { r.ev.min = Math.round((now - r.at) / 60000); r.ev.with = CR.withList(r); CR.dirty(); }
};
CR.withList = function (r) {
  var out = [];
  for (var n in r.with) { if (r.with.hasOwnProperty(n)) out.push(r.with[n]); }
  return out;
};
CR.meet = function (name) {
  name = String(name || "").split(/\s+/)[0];
  if (!/^[A-Za-z]+$/.test(name)) return;
  name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  CR.players[name.toLowerCase()] = name;
  if (CR.room && name.toLowerCase() !== String(CR.me).toLowerCase()) {
    CR.room.with[name.toLowerCase()] = name;
    if (CR.room.ev) CR.room.ev.with = CR.withList(CR.room);
  }
};
// Every prompt: an area or room long enough is recorded, and a capture that
// never saw its prompt ends.
CR.tick = function () {
  var now = Date.now();
  if (CR.area && !CR.area.ev && CR.area.name && now - CR.area.at >= CR.areaMs) {
    CR.area.ev = CR.add({ t: CR.area.at, k: "place", area: CR.area.name, room: CR.room ? CR.room.name : "" });
  }
  var r = CR.room;
  if (r && !r.ev && r.name && now - r.at >= CR.stayMs) {
    r.ev = CR.add({ t: r.at, k: "stay", room: r.name, area: r.area, min: Math.round((now - r.at) / 60000), with: CR.withList(r) });
  } else if (r && r.ev) {
    var mn = Math.round((now - r.at) / 60000);
    if (mn !== r.ev.min) { r.ev.min = mn; CR.dirty(); }
  }
  if (CR.capt && now - CR.capt.at > CR.capMs) CR.finish();
};

// --- game lines -----------------------------------------------------------------
// The prompt ends a capture. Standard prompts start "7547h, 5989m"; a custom
// one is known by your health and mana from Char.Vitals, as room does.
CR.promptRe = /^\s*\d+h, \d+m\b/;
CR.isPrompt = function (raw) {
  if (CR.promptRe.test(raw)) return true;
  var hm = CR.vitHM;
  if (!hm || !hm[0] || !hm[1]) return false;
  return new RegExp("(^|\\D)" + hm[0] + "(\\D|$)").test(raw) && new RegExp("(^|\\D)" + hm[1] + "(\\D|$)").test(raw);
};
CR.re = {
  date: /^(?:It is now|Today is) the (\d+)(?:st|nd|rd|th) of (\w+), (\d+) years after/,
  letter: /^You read what is written on (.+):\s*$/,
  news: /^([A-Z][A-Za-z ]*?) NEWS #(\d+)\s+\((.+)\)\s*$/,
  msg: /^Message #(\d+)\s+Sent by (\S+)\s*$/,
  more: /^\[Type MORE if you wish to continue reading\./,
  moreCmd: /^\s*more\s*$/i,
  // Your own custom emotes (EMOTE, and roleplay's ambient ones) come back as
  // "You have emoted: Neijel draws his lips back..." (Ricardo). Socials
  // ("You skip about merrily.") aren't kept: they look like every other
  // "You ..." line.
  mine: /^You have emoted: (.+)$/,
  // Lines starting with a name that aren't emotes: talk (it comes by GMCP)
  // and comings and goings.
  talk: /^\w+ (?:says|asks|exclaims|whispers|yells|shouts|tells|answers|replies|mutters|sings|quietly says)\b/,
  // Housekeeping, not roleplay: curing, gold, wielding, following.
  chore: /^\w+ (?:takes some salve|rubs some|eats (?:a|an|some)\b|sips|quaffs|smokes|applies|presses|touches|puts some gold sovereigns|picks up \d+ gold|starts to wield|ceases to wield|begins to wield|follows you|follows \w+ |begins to follow|stops following|stands up|sits down)/,
  move: /^\w+ (?:arrives|leaves|has arrived|has left|enters|walks|flies|swims|rides|sprints|bounds|lopes|slithers|crawls|limps|strides|trots|glides|wanders|stumbles|is here|appears|vanishes|disappears)\b/
};
CR.line = function (raw) {
  raw = CR.plain(raw);
  if (CR.isPrompt(raw)) { if (CR.capt) CR.finish(); return; }
  var m;
  if ((m = CR.re.date.exec(raw))) { CR.setDate(parseInt(m[1], 10), m[2], parseInt(m[3], 10)); return; }
  if ((m = CR.re.letter.exec(raw))) { CR.start({ k: "letter", what: m[1] }); return; }
  if ((m = CR.re.news.exec(raw))) { CR.start({ k: "news", section: m[1], num: parseInt(m[2], 10), date: m[3] }); return; }
  if ((m = CR.re.msg.exec(raw))) { CR.start({ k: "msg", num: parseInt(m[1], 10), who: m[2] }); return; }
  if (CR.re.moreCmd.test(raw)) {
    if (CR.cont && Date.now() - CR.cont.at < 600000) { CR.capt = { ev: CR.cont.ev, lines: [], at: Date.now(), more: true }; CR.cont = null; }
    return;
  }
  if (!CR.capt && (m = CR.re.mine.exec(raw))) { CR.add({ k: "emote", who: CR.me || "you", text: CR.clip(m[1], CR.textMax) }); return; }
  if (CR.capt) {
    if (CR.capt.ev.k == "news" && CR.re.more.test(raw)) { CR.cont = { ev: CR.capt.ev, at: Date.now() }; CR.finish(); return; }
    CR.capt.lines.push(raw);
    if (CR.capt.lines.length > 400) CR.finish();
    return;
  }
  CR.emote(raw);
};
CR.start = function (ev) {
  if (CR.capt) CR.finish();
  CR.cont = null;
  ev.t = Date.now();
  CR.capt = { ev: ev, lines: [], at: ev.t, more: false };
};
// The captured lines, blank runs closed up, become the event's text.
CR.finish = function () {
  var c = CR.capt;
  CR.capt = null;
  if (!c) return;
  var ev = c.ev, out = [], i;
  for (i = 0; i < c.lines.length; i++) {
    var ln = c.lines[i], f;
    if (ev.k == "news" && !c.more) {
      if ((f = /^From\s*:\s*(.*)$/.exec(ln))) { ev.from = f[1]; continue; }
      if ((f = /^To\s*:\s*(.*)$/.exec(ln))) { ev.to = f[1]; continue; }
      if ((f = /^Subject\s*:\s*(.*)$/.exec(ln))) { ev.subject = f[1]; continue; }
      if (/^-{5,}\s*$/.test(ln)) continue;
    }
    if (ev.k == "msg" && !out.length && (f = /^(\d{4}\/\d\d\/\d\d\/\d\d:\d\d)\s+(.*)$/.exec(ln))) { ev.when = f[1]; ln = f[2]; }
    if (!/\S/.test(ln) && (!out.length || !/\S/.test(out[out.length - 1]))) continue;
    out.push(ln.replace(/^\s+/, ""));
  }
  while (out.length && !/\S/.test(out[out.length - 1])) out.pop();
  var text = out.join("\n");
  if (c.more) {
    ev.text = CR.clip((ev.text ? ev.text + "\n" : "") + text, CR.longMax);
    CR.dirty();
    return;
  }
  ev.text = CR.clip(text, CR.longMax);
  if (!CR.known(ev)) CR.add(ev);
  else if (CR.cont && CR.cont.ev === ev) CR.cont = null;
};
// A message or news post read again isn't recorded again; a letter read again
// the same day isn't either.
CR.known = function (ev) {
  for (var i = CR.days.length - 1; i >= 0; i--) {
    var b = CR.days[i];
    for (var j = b.ev.length - 1; j >= 0; j--) {
      var e = b.ev[j];
      if (e.k !== ev.k) continue;
      if (ev.k == "news" && e.section == ev.section && e.num == ev.num) return true;
      if (ev.k == "msg" && e.num == ev.num) return true;
      if (ev.k == "letter" && b.d === CR.dayOf(ev.t) && e.text == ev.text) return true;
    }
  }
  return false;
};
// An emote: a line starting with the name of someone in your room (you too),
// that isn't talk or a coming or going. Someone with more than a few lines a
// minute is fighting, not emoting: left out for a while.
CR.emote = function (raw) {
  var m = /^([A-Z][a-z]+)\b/.exec(raw);
  if (!m) return;
  var lc = m[1].toLowerCase();
  if (!CR.players[lc] && lc !== String(CR.me).toLowerCase()) return;
  if (CR.re.talk.test(raw) || CR.re.move.test(raw) || CR.re.chore.test(raw) || / says,? "/.test(raw)) return;
  var now = Date.now(), i;
  for (i = 0; i < CR.recent.length; i++) { if (CR.recent[i][0] == raw) return; }
  var rt = CR.rate[lc] || (CR.rate[lc] = { at: [], mute: 0 });
  if (rt.mute > now) return;
  while (rt.at.length && now - rt.at[0] > 60000) rt.at.shift();
  rt.at.push(now);
  if (rt.at.length > CR.emoteMax) {
    rt.mute = now + CR.emoteMute;
    // The burst so far was combat too: take it back out.
    var b = CR.bucket(CR.dayOf(now), false);
    if (b) { for (i = b.ev.length - 1; i >= 0; i--) { if (b.ev[i].k == "emote" && b.ev[i].who == m[1] && now - b.ev[i].t <= 60000) b.ev.splice(i, 1); } }
    CR.dirty();
    return;
  }
  CR.add({ t: now, k: "emote", who: m[1], text: CR.clip(raw, CR.textMax) });
};

// --- the record as text ----------------------------------------------------------
CR.hhmm = function (t) { var d = new Date(t); return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2); };
CR.describe = function (e) {
  switch (e.k) {
    case "place": return "In " + e.area + (e.room ? " (" + e.room + ")" : "");
    case "stay": return "Stayed " + (e.min || 0) + " min in " + e.room + (e.area ? ", " + e.area : "") + (e.with && e.with.length ? ", with " + e.with.join(", ") : "");
    case "chan": return "[" + e.name + "] " + e.text;
    case "emote": return e.text;
    case "letter": return "Read " + e.what + ":\n" + (e.text || "");
    case "msg": return "Message from " + e.who + ": " + (e.text || "");
    case "news": return "Read " + e.section + " news #" + e.num + (e.subject ? ", \"" + e.subject + "\"" : "") + (e.from ? " by " + e.from : "") + ":\n" + (e.text || "");
    case "note": return "Note: " + e.text;
    case "link": return e.text + " (" + e.src + ")";
  }
  return String(e.text || "");
};
CR.show = function (e) { return CR.describe(e) + (e.n > 1 ? " (\u00d7" + e.n + ")" : ""); };
CR.markdown = function (days) {
  var out = ["# Chronicle" + (CR.me ? " of " + CR.me : ""), ""];
  for (var i = 0; i < days.length; i++) {
    var b = days[i];
    if (!b.ev.length) continue;
    out.push("## " + CR.dayName(b.d), "");
    for (var j = 0; j < b.ev.length; j++) {
      var e = b.ev[j], txt = CR.show(e).split("\n");
      out.push("- " + CR.hhmm(e.t) + " **" + e.k + "** " + txt[0]);
      for (var l = 1; l < txt.length; l++) out.push("  > " + txt[l]);
    }
    out.push("");
  }
  return out.join("\n");
};
// A Markdown file of the whole record, downloaded by the browser.
CR.download = function () {
  var md = CR.markdown(CR.days);
  CR.lastExport = md;
  try {
    var blob = new Blob([md], { type: "text/markdown" });
    var a = document.createElement("a");
    var d = new Date();
    a.href = URL.createObjectURL(blob);
    a.download = "chronicle-" + (CR.me || "character").toLowerCase() + "-" + d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2) + ".md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(function () { try { URL.revokeObjectURL(a.href); } catch (e) {} }, 10000);
    return true;
  } catch (e) { return false; }
};

// --- what other packages offer, through loom -------------------------------------
// entry.record({ source, key, text, at }): one line in the record, tagged with
// its source; the same source and key is recorded once. entry.withdraw(source
// [, key]) takes them back out of the current day (earlier days are history).
CR.entry = {
  record: function (it) {
    if (!it || !it.source || !it.text) return false;
    var src = String(it.source), key = String(it.key === undefined ? "" : it.key);
    for (var i = 0; i < CR.days.length; i++) {
      for (var j = 0; j < CR.days[i].ev.length; j++) { var e = CR.days[i].ev[j]; if (e.k == "link" && e.src == src && e.key == key) return false; }
    }
    CR.add({ t: (typeof it.at == "number" && it.at > 0 && it.at <= Date.now()) ? it.at : Date.now(), k: "link", src: src, key: key, text: CR.clip(String(it.text), CR.textMax) });
    return true;
  },
  withdraw: function (source, key) {
    var b = CR.bucket(CR.today(), false);
    if (!b) return;
    var n = b.ev.length;
    b.ev = b.ev.filter(function (e) { return !(e.k == "link" && e.src == String(source) && (key === undefined || e.key == String(key))); });
    if (b.ev.length !== n) CR.dirty();
  }
};
// What it offers: the record of a day (today if none given).
CR.look = {
  day: function (d) { var b = CR.bucket(d === undefined ? CR.today() : d, false); return b ? b.ev.slice() : []; }
};
