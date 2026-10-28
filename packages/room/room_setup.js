// room_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry and state for the Here tab
// (#158), a replacement for the stock Room tab fed only by GMCP:
//   R.info     the last Room.Info (name, desc, area, environment, details, exits, num)
//   R.players  name -> fullname, from Room.Players / AddPlayer / RemovePlayer
//   R.items    id -> item, from Char.Items List / Add / Remove / Update (location "room")
//   R.me       your name (Char.Name / Char.Status, kept as room_name), left off the players
//   R.raw      the last payload of each method, for ROOM DEBUG
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.room) client.loom.room = {};
// redraw: how loom redraws the Here tab when an integration's source changes (#159);
// soon: that redraw gathers bursts itself, so loom calls it at once (#136).
// busy (#318): true while a loyal probe's answer is still coming. Every
// package that sends a command and reads its answer says so through its
// registry entry's busy(), so others can wait their turn.
client.loom.registry.room = { version: "1.1.4", keyword: "ROOM", desc: "{{description}}", redraw: function () { var r = client.loom.room; if (r && r.drawSoon) r.drawSoon(); else run_function("room_render", [], "room"); }, soon: true, busy: function () { return !!(client.loom.room && client.loom.room.probing); } };
var R = client.loom.room;
// One draw for a burst of changes: a room step brings Room.Info, the players
// and the items, and loom's integrations (basher, patrolling…) ask for a
// redraw of their own right after. All of them land here, so the tab draws
// once, 50 ms after the last (it drew twice per step before, #136).
R.drawSoon = function () {
  clearTimeout(R.drawT);
  R.drawT = setTimeout(function () { R.drawT = null; run_function("room_render", [], "room"); }, 50);
};
if (!R.info) R.info = null;
if (!R.players) R.players = {};
if (!R.items) R.items = {};
if (!R.raw) R.raw = {};
// Your target (IRE.Target.Info: id and health), and the tar variable as last
// seen, so a change of it redraws the tab.
if (R.target === undefined) R.target = null;
if (R.lastTar === undefined) R.lastTar = "";
if (R.tarAt === undefined) R.tarAt = 0;
// The tar variable is set inside Nexus (TAR, aliases) and sends nothing to
// the game, so waiting for the next prompt to notice it made the glow lag
// (Ricardo: "less crisp than the stock tab"). Look at it a few times a
// second instead: one variable read and a compare, and a draw only when it
// changed. Replaced on every setup, so a reimport never leaves two.
if (R.tarWatch) clearInterval(R.tarWatch);
R.tarWatch = setInterval(function () {
  var tw;
  try { tw = String(get_variable("tar") || ""); } catch (e) { return; }
  if (tw === R.lastTar) return;
  R.lastTar = tw;
  R.tarAt = Date.now();
  clearTimeout(R.drawT);
  run_function("room_render", [], "room");
}, 150);
if (!R.me) { try { R.me = String(get_variable("room_name") || ""); } catch (e) { R.me = ""; } }
// The description starts folded to two lines (room_desc "folded"/"open").
R.descOpen = get_variable("room_desc") == "open";
R.tab = "Here";

// A remembered room (#367, Ricardo): { id, name, area }, saved as room_mark.
// Here's button next to the room number: REMEMBER marks this room; once you
// have moved on it reads GO BACK and walks you there (PATH FIND <id>);
// arriving after GO BACK forgets it, so the button offers REMEMBER again.
// In the marked room itself it reads "remembered" (a click forgets it).
//   R.goingBack  true from GO BACK until you arrive (Room.Info in room_gmcp)
R.mark = null;
try { var rmMk = JSON.parse(get_variable("room_mark") || "null"); if (rmMk && rmMk.id) R.mark = rmMk; } catch (e) { R.mark = null; }
if (R.goingBack === undefined) R.goingBack = false;
R.markName = function (m) { return m ? (m.name || "room") + " (" + m.id + ")" : ""; };
R.markSave = function () {
  if (R.mark) set_variable("room_mark", JSON.stringify(R.mark)); else delete_variable("room_mark");
  run_function("room_render", [], "room");
  // Waypoints pins the remembered room (#369, link room-waypoints).
  if (client.loom.notify) client.loom.notify("room");
};
R.remember = function () {
  var I = R.info;
  if (!I || !I.num) { display_notice("[room] no room yet: move or LOOK first.", "orange"); return; }
  R.mark = { id: String(I.num), name: String(I.name || "").replace(/\s*\((?:indoors|outdoors)\)\s*$/i, ""), area: String(I.area || ""), at: Date.now() };
  R.goingBack = false;
  R.markSave();
  display_notice("[room] remembered " + R.markName(R.mark) + ". GO BACK in Here (or ROOM BACK) walks you here.", "lime");
};
R.goBack = function () {
  if (!R.mark) { display_notice("[room] no room remembered: ROOM REMEMBER, or REMEMBER in Here.", "orange"); return; }
  if (R.info && String(R.info.num) === R.mark.id) { display_notice("[room] you're in " + R.markName(R.mark) + " already.", "cyan"); return; }
  R.goingBack = true;
  send_command("path find " + R.mark.id, 1);
  display_notice("[room] going back to " + R.markName(R.mark) + ".", "cyan");
};
R.forget = function () {
  var was = R.mark;
  R.mark = null;
  R.goingBack = false;
  R.markSave();
  display_notice(was ? "[room] forgot " + R.markName(was) + "." : "[room] no room remembered.", "cyan");
};
// What other packages may ask room to do, through loom's integrations
// (#369, Waypoints' Remembered box): the same as Here's buttons.
R.entry = {
  remember: function () { client.loom.room.remember(); },
  back: function () { client.loom.room.goBack(); },
  forget: function () { client.loom.room.forget(); }
};
// The tab's clicks (its page can't reach client.loom by name in every Nexus).
try {
  window.loomRoom = {
    remember: function () { client.loom.room.remember(); },
    back: function () { client.loom.room.goBack(); },
    forget: function () { client.loom.room.forget(); }
  };
} catch (e) {}

// Newbies (#242): players whose full name (GMCP fullname) carries one of
// these titles get a green leaf. Here reads the title live; for tabs that
// see no titles (Online, Comms) the names are remembered (room_newbies,
// name -> when last seen with the title) and forgotten once the player is
// seen without it. Helpers rebuilt on every run, the list kept.
// The titles are the player's (#389, ROOM NOVICE): Eleusis's three by
// default, saved as room_novice_titles (JSON list) only when changed.
R.newbieDefault = ["Uaithne", "Ithin", "Tuqad"];
R.newbieTitles = R.newbieDefault.slice(0);
try {
  var rmNt = JSON.parse(get_variable("room_novice_titles") || "null");
  if (Array.isArray(rmNt)) R.newbieTitles = rmNt.filter(function (t) { return typeof t == "string" && /^[A-Za-z']+$/.test(t); });
} catch (e) {}
R.saveNovice = function () {
  var same = R.newbieTitles.length === R.newbieDefault.length && R.newbieTitles.every(function (t, i) { return t === R.newbieDefault[i]; });
  try { if (same) delete_variable("room_novice_titles"); else set_variable("room_novice_titles", JSON.stringify(R.newbieTitles)); } catch (e) {}
  // Names remembered under a title no longer listed are forgotten.
  var lc = R.newbieTitles.map(function (t) { return t.toLowerCase(); });
  for (var k in R.newbies) { if (R.newbies.hasOwnProperty(k) && lc.indexOf(String(R.newbies[k].title).toLowerCase()) < 0) delete R.newbies[k]; }
  R.saveNewbies();
  if (client.loom.notify) client.loom.notify("room");
};
R.newbieTitle = function (name, full) {
  var words = String(full || "").split(/[^A-Za-z']+/);
  var lc = R.newbieTitles.map(function (t) { return t.toLowerCase(); });
  for (var i = 0; i < words.length; i++) { if (words[i] && words[i] !== name && lc.indexOf(words[i].toLowerCase()) >= 0) return words[i]; }
  return "";
};
if (!R.newbies) {
  try { R.newbies = JSON.parse(get_variable("room_newbies") || "{}") || {}; } catch (e) { R.newbies = {}; }
}
// seen(name, full): note a player seen in a room; true when the remembered
// list changed.
R.seen = function (name, full) {
  if (!name) return false;
  var k = String(name).toLowerCase();
  var t = R.newbieTitle(name, full);
  if (t) { var was = R.newbies[k] ? R.newbies[k].title : ""; R.newbies[k] = { title: t, t: Date.now() }; return was !== t; }
  if (R.newbies[k]) { delete R.newbies[k]; return true; }
  return false;
};
R.saveNewbies = function () { try { set_variable("room_newbies", JSON.stringify(R.newbies)); } catch (e) {} };
R.leaf = function (title) { return '<span title="' + String(title || "newbie").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;") + '" style="margin-left:4px;cursor:default;"><svg width="10" height="10" viewBox="0 0 10 10" style="vertical-align:-1px;" xmlns="http://www.w3.org/2000/svg"><path d="M1.2 8.8C1.2 4.2 3.8 1.2 8.8 1.2C8.8 6.2 5.8 8.8 1.2 8.8Z" fill="#8fd694"/><path d="M1.6 8.4L6.2 3.8" stroke="#2f5532" stroke-width="0.9"/></svg></span>'; };
// Loyals (Ricardo): GMCP says nothing about whose a mob is (a loyal is
// attrib "m" like any other), but PROBE does: "He is loyal to Falau." (and
// "You see nothing in it." in place of a holding list on some). So every
// living mob id seen for the first time is probed once, silently: one probe
// at a time, every line gagged from the send until the probe's answer ends:
// the line after "<mob> is holding:", "You see nothing in it.", "What do you
// wish to examine?" (gone), or a prompt after its health line. A 2 s safety
// timeout only for an answer that never comes. Probes wait while the basher has a run (a gagged combat line
// would be lost), while triggers are paused, and while another package's answer
// is still coming (R.probeOthers, #318). PROBE is free (Ricardo).
//   R.loyal    id -> owner, "" = loyal to nobody, for this session
//   R.loyals   the loyals remembered across sessions (below)
//   R.probeQ   ids waiting; R.probing {id, name, at, owner, holding, lines}
//   R.probeLast  the last probe's lines and how it ended, for ROOM PROBE DEBUG
// ROOM PROBE ON|OFF (room_probe, default on).
R.probeOn = get_variable("room_probe") != "off";
if (!R.loyal) R.loyal = {};
if (!R.probeQ) R.probeQ = [];
if (R.probing === undefined) R.probing = null;
R.probeMs = 2000;
R.loyalCap = 3000;
// Loyals remembered (Ricardo, 1.1): a mob keeps its id for as long as it
// lives, so a loyal found once is known on sight next time, with no probe.
// Only someone's loyals are kept (not ignored owners, not mobs loyal to
// nobody: those respawn under new ids). A remembered id is used only while
// the mob's name is the same, and is probed again once R.loyalsCheck old (it
// may have changed hands); the least recently seen go beyond R.loyalsCap.
//   R.loyals  id -> { n: name, o: owner, c: when probed, t: when last seen },
//             saved in room_loyals (JSON)
R.loyalsCap = 500;
R.loyalsCheck = 30 * 86400000;
R.loyals = {};
try {
  var rmLs = JSON.parse(get_variable("room_loyals") || "{}");
  if (rmLs && typeof rmLs == "object" && !Array.isArray(rmLs)) {
    for (var rmLk in rmLs) {
      var rmLe = rmLs[rmLk];
      if (rmLs.hasOwnProperty(rmLk) && rmLe && typeof rmLe == "object" && typeof rmLe.n == "string" && typeof rmLe.o == "string" && rmLe.o && typeof rmLe.c == "number" && typeof rmLe.t == "number") R.loyals[rmLk] = { n: rmLe.n, o: rmLe.o, c: rmLe.c, t: rmLe.t };
    }
  }
} catch (e) { R.loyals = {}; }
R.saveLoyals = function () {
  var ks = Object.keys(R.loyals);
  if (ks.length > R.loyalsCap) {
    ks.sort(function (a, b) { return R.loyals[a].t - R.loyals[b].t; });
    for (var i = 0; i < ks.length - R.loyalsCap; i++) delete R.loyals[ks[i]];
  }
  try { if (Object.keys(R.loyals).length) set_variable("room_loyals", JSON.stringify(R.loyals)); else delete_variable("room_loyals"); } catch (e) {}
};
// Keep (or drop) what a probe found about mob id, called name.
R.loyalsKeep = function (id, name, owner) {
  if (owner && !R.loyalIgnored(owner)) { var now = Date.now(); R.loyals[id] = { n: name, o: owner, c: now, t: now }; R.saveLoyals(); }
  else if (R.loyals.hasOwnProperty(id)) { delete R.loyals[id]; R.saveLoyals(); }
};
// Known from an earlier session: true (and R.loyal set) when it can be used.
R.loyalsKnown = function (id, name) {
  var e = R.loyals[id];
  if (!e) return false;
  var now = Date.now();
  if (e.n !== name || now - e.c > R.loyalsCheck || R.loyalIgnored(e.o)) { delete R.loyals[id]; R.saveLoyals(); return false; }
  R.loyal[id] = e.o;
  // Last seen, saved at most once a day.
  if (now - e.t > 86400000) { e.t = now; R.saveLoyals(); }
  return true;
};
// Queue a mob from Char.Items, unless it's dead, known, queued or being probed.
// A calm room first (Ricardo, 2026-10-24): a mob is probed only once it has
// been in the room with you for R.probeCalmMs and you haven't lost health for
// as long. Loyals are never aggressive, so a mob that attacks on arrival shows
// itself before any probe goes out, and no probe is out while blows are
// landing; rooms you pass through aren't probed at all. Lag delays the room
// and the attack alike, so their order holds. The trade-off: a mob you attack
// within those 3 s hasn't been probed for the basher's loyal check.
//   R.probeSince  id -> when the mob was first seen here
//   R.hurtAt      when Char.Vitals last showed less health than before
R.probeCalmMs = 3000;
if (!R.probeSince) R.probeSince = {};
if (R.hurtAt === undefined) R.hurtAt = 0;
R.probeAdd = function (it) {
  if (!it || !/m/.test(it.attrib || "") || /d/.test(it.attrib || "")) return;
  var id = String(it.id);
  if (R.loyal.hasOwnProperty(id) || R.probeQ.indexOf(id) >= 0 || (R.probing && R.probing.id === id)) return;
  if (R.loyalsKnown(id, String(it.name || "a mob"))) { if (client.loom.notify) client.loom.notify("room"); return; }
  if (R.basherActive(String(it.name || ""))) return;
  R.probeQ.push(id);
  R.probeSince[id] = Date.now();
};
// Wake up when the next waiting mob (or the room) has been calm long enough.
R.probeWakeIn = function (ms) {
  clearTimeout(R.probeWake);
  R.probeWake = setTimeout(function () {
    R.probeWake = null;
    // A timer runs between packets: nothing of a packet is still coming.
    R.probeAtPrompt = true; R.probeNext(); R.probeAtPrompt = false;
  }, Math.max(20, ms + 20));
};
// Whether the basher hunts mobs of this name in this area (#422, Ricardo):
// ACTIVE in its list, read through the basher-room link. Those are ordinary
// denizens, so they aren't probed. Ignored entries (named NPCs, new types)
// still are. With the basher missing or the link off, false: probe as before.
R.basherActive = function (name) {
  var LL = client.loom.loom;
  var q = (LL && LL.answer) ? LL.answer("room", "room.queue", {}) : undefined;
  return !!(q && q.active && name && q.active[name] === true);
};
// Whether the basher is fighting (its run, read through the basher-room link).
R.probeBusy = function () {
  var LL = client.loom.loom;
  var q = (LL && LL.answer) ? LL.answer("room", "room.queue", {}) : undefined;
  return !!(q && (q.state === "RUNNING" || q.state === "FLEEING"));
};
// When probes may go out, by the game's own text, never a timer (Ricardo:
// lag breaks time gates). The room you walk into arrives with its mob list,
// and a probe sent then took the room's text for its answer. So after a move
// (Room.Info) probes wait for the room's exits line, its last line; a mob
// arriving where you stand is probed at the next prompt.
//   R.probeHold  "room" while a moved-into room's text is still coming;
//                lifted by its exits line, or by the second prompt after it
R.probeExits = /^(?:You see (?:a single exit|exits) leading .*\.|There are no obvious exits\.)$/;
// Which other packages still have an answer coming to something they sent
// (their registry entry's busy(), #318): sigils' monolith probe, patrolling's
// PLANTS and INFO HERE, a room being harvested, social's QW. A probe sent
// before those answers arrive would gag them (Ricardo: SIGILS WATCH and the
// first harvest went missing), and their lines could end the probe early.
// The game answers in order, so a probe waits for them, never the other way.
//   R.probeWaitOn  the names it waited on last, for ROOM PROBE
R.probeOthers = function () {
  var out = [], reg = client.loom.registry || {};
  for (var k in reg) {
    if (!reg.hasOwnProperty(k) || k === "room" || !reg[k] || typeof reg[k].busy !== "function") continue;
    var b = false;
    try { b = reg[k].busy(); } catch (e) { b = false; }
    if (b) out.push(k);
  }
  return out;
};
// Send the next probe, if nothing is in the way. Called on room changes and
// every prompt, so a wait ends by itself.
R.probeNext = function () {
  if (R.probing) {
    if (Date.now() - R.probing.at > R.probeMs) R.probeEnd(false);
    else return;
  }
  if (!R.probeOn || !R.probeQ.length || R.probeHold) return;
  if (get_variable("pauseTriggers") == "on" || R.probeBusy()) return;
  R.probeWaitOn = R.probeOthers();
  if (R.probeWaitOn.length) return;
  // Calm: no health lost for R.probeCalmMs, and the mob here at least as long.
  var now = Date.now();
  var hurtLeft = R.hurtAt + R.probeCalmMs - now;
  if (hurtLeft > 0) { R.probeWakeIn(hurtLeft); return; }
  var soonest = -1;
  for (var qi = 0; qi < R.probeQ.length; qi++) {
    var qid = R.probeQ[qi], qit = R.items[qid];
    if (!qit || /d/.test(qit.attrib || "")) { R.probeQ.splice(qi, 1); delete R.probeSince[qid]; qi--; continue; }
    var left = (R.probeSince[qid] || now) + R.probeCalmMs - now;
    if (left <= 0) { R.probeQ.splice(qi, 1); R.probeQ.unshift(qid); soonest = -1; break; }
    if (soonest < 0 || left < soonest) soonest = left;
  }
  if (soonest >= 0) { R.probeWakeIn(soonest); return; }
  while (R.probeQ.length) {
    var id = R.probeQ.shift();
    delete R.probeSince[id];
    var it = R.items[id];
    if (it && !/d/.test(it.attrib || "")) {
      // Sent from a line (the room's exits line, a probe ending on a line):
      // the rest of this packet isn't the answer (p.sendPacket, probeLine).
      var p = { id: id, name: String(it.name || "a mob"), at: Date.now(), owner: "", holding: false, health: false, lines: [], how: "", prompts: 0, sendPacket: !R.probeAtPrompt, foreign: 0, replayed: 0 };
      R.probing = p;
      clearTimeout(R.probeT);
      R.probeT = setTimeout(function () { if (R.probing === p) { p.how = "timeout"; R.probeEnd(false); } }, R.probeMs);
      send_command("probe " + id, 1);
      return;
    }
  }
};
// Whom "loyal to X" names, when X is a player: one capitalised word that
// isn't a city. Wild mobs are loyal to their home too ("He is loyal to Gnoll
// fortress.", Ricardo), and city denizens to their city: those are nobody's.
R.loyalNot = ["Ashtan", "Cyrene", "Eleusis", "Hashan", "Mhaldor", "Targossas"];
R.loyalOwner = function (x) {
  x = String(x || "").trim();
  return (/^[A-Z][a-z]+$/.test(x) && R.loyalNot.indexOf(x) < 0) ? x : "";
};
// Places named in one word look like players ("He is loyal to Qurnok.",
// Ricardo): the player adds them by hand, ROOM PROBE IGNORE <name>.
//   R.loyalIgnore  lowercased names, saved in room_loyal_ignore (JSON list)
// R.loyal keeps what the probe read; the list is applied when read, so
// UNIGNORE brings the marks back without probing again.
R.loyalIgnore = [];
try {
  var rmIg = JSON.parse(get_variable("room_loyal_ignore") || "[]");
  if (Object.prototype.toString.call(rmIg) === "[object Array]") {
    for (var rmIgI = 0; rmIgI < rmIg.length; rmIgI++) { if (typeof rmIg[rmIgI] == "string" && rmIg[rmIgI]) R.loyalIgnore.push(rmIg[rmIgI].toLowerCase()); }
  }
} catch (e) { R.loyalIgnore = []; }
R.saveLoyalIgnore = function () {
  try { if (R.loyalIgnore.length) set_variable("room_loyal_ignore", JSON.stringify(R.loyalIgnore)); else delete_variable("room_loyal_ignore"); } catch (e) {}
};
R.loyalIgnored = function (x) { return R.loyalIgnore.indexOf(String(x || "").toLowerCase()) >= 0; };
// The owner of mob id as shown: "" when nobody's or ignored, undefined when
// not probed yet.
R.ownerOf = function (id) {
  var k = String(id);
  if (!R.loyal.hasOwnProperty(k)) return undefined;
  var o = R.loyal[k] || "";
  return (o && !R.loyalIgnored(o)) ? o : "";
};
// Lines a probe must never hide (#393): channel lines announced by GMCP
// (Comm.Channel.Text comes before its line), kept 3 s, each let through once.
R.probeChans = [];
R.probeStrip = function (t) { return String(t || "").replace(/\u001b\[[0-9;]*m/g, "").replace(/\s+/g, " ").trim(); };
R.probeChan = function (text) {
  var now = Date.now(), keep = [];
  for (var i = 0; i < R.probeChans.length; i++) if (now - R.probeChans[i].at < 3000) keep.push(R.probeChans[i]);
  keep.push({ t: R.probeStrip(text), at: now });
  R.probeChans = keep.slice(-10);
};
R.probeChanned = function (line) {
  var t = R.probeStrip(line), now = Date.now();
  for (var i = 0; i < R.probeChans.length; i++) {
    if (now - R.probeChans[i].at < 3000 && R.probeChans[i].t === t) { R.probeChans.splice(i, 1); return true; }
  }
  return false;
};
// The prompt line (Ricardo's log, #393): Nexus hands it to triggers like any
// other line, and it closes its packet in the text itself, whatever order the
// GMCP came in. A probe never hides it, and uses it to know where packets end.
// Standard prompts start "7547h, 5989m"; a custom prompt is recognised by
// your health and mana as Char.Vitals last gave them (R.vitHM), both on the
// line as whole numbers. Otherwise the GMCP Char.Vitals counts instead
// (probePrompt).
R.promptRe = /^\s*\d+h, \d+m\b/;
R.isPrompt = function (raw) {
  if (R.promptRe.test(raw)) return true;
  var hm = R.vitHM;
  if (!hm || !hm[0] || !hm[1]) return false;
  return new RegExp("(^|\\D)" + hm[0] + "(\\D|$)").test(raw) && new RegExp("(^|\\D)" + hm[1] + "(\\D|$)").test(raw);
};
// Once prompt lines are recognised (R.promptText), a waiting probe goes out at
// the prompt line, the end of its packet's text, rather than at Char.Vitals,
// which can come ahead of the text: a probe sent there took the rest of the
// packet ("A gnoll sentinel enters from the north.") for its answer, and the
// real answer, a packet later, showed (Ricardo, 2026-10-24).
R.probeIdle = function (line) {
  if (R.promptText && !R.probeQ.length) return;
  if (!R.isPrompt(String(line || ""))) return;
  R.promptText = true;
  if (!R.probeQ.length) return;
  R.probeAtPrompt = true;
  R.probeNext();
  R.probeAtPrompt = false;
};
// Too soon to be the answer (Ricardo, 2026-10-24: a bunyip attacked 29 ms
// after its probe went out; answers in his log took 128 ms and more): an
// answer needs a round trip to the game, so a line arriving sooner than 80%
// of the fastest answer seen (R.rttMin, learned from each answer's health
// line) is someone else's, and isn't hidden: it shows as it came, colours and
// highlights included. Lag only makes answers later, never earlier. Until an
// answer has been timed, nothing is let through this way.
R.probeTooSoon = function (p) { return !!(R.rttMin && Date.now() - p.at < R.rttMin * 0.8); };
// Lines a probe hid that turned out not to be its answer (after that first
// stretch): shown again at once, as one block so their order holds, in
// plain text (a trigger only gets a line's text, not its colours).
R.probeReplay = function (p) {
  var ls = p.lines || [];
  if (ls.length) {
    var esc = function (t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
    var done = false;
    try {
      if (typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function") {
        var h = [];
        for (var i = 0; i < ls.length; i++) h.push(esc(ls[i]));
        nexusclient.add_html_line('<span style="white-space:pre-wrap">' + h.join("\n") + '</span>');
        done = true;
      }
    } catch (e) { done = false; }
    if (!done) { try { display_notice(ls.join("\n"), "#c0c0c0"); } catch (e) {} }
  }
  p.replayed = (p.replayed || 0) + ls.length;
  p.lines = [];
};
// Every line while a probe is out: gagged, and read. Not gagged: prompts,
// channel lines, the rest of the packet the probe went out in, and, after a
// move, the new room and what follows it.
//   p.sendPacket  the probe went out partway through a packet (at the room's
//                 exits line): the game can't answer within that packet, so
//                 nothing is hidden until it ends, at its prompt line or the
//                 first Char.Vitals after the send, whichever comes first.
// A move with a probe out (p.moved, the new room's name): when you walk, your
// commands are taken in order, so the answer comes before the new room; when
// you follow someone, the game can move you first, and the answer comes after
// the room's text: "What do you wish to examine?", the mob being left behind.
// So the room's title line starts p.late: the room shows, and only that one
// line is still hidden if it comes, ending the probe. No other probe goes out
// meanwhile, so answers can't be taken for the wrong probe. "You follow …" lines
// before the title show too.
R.probeLine = function (line) {
  var p = R.probing;
  if (!p) return;
  var raw = String(line || "");
  var isPrompt = R.isPrompt(raw);
  if (isPrompt) R.promptText = true;
  if (p.sendPacket) { if (isPrompt) p.sendPacket = false; return; }
  if (isPrompt) {
    // A prompt after answer lines closes the answer: its result counts. After
    // a move, the second prompt from the new room's title (or from the move,
    // with no title seen) ends the wait for a late answer.
    // Ended here, at a prompt line, the next probe may go out at once: the
    // packet's text is over (R.probeAtPrompt).
    R.probeAtPrompt = true;
    if (p.late) { if (++p.lateText >= 2) { p.how = "moved"; R.probeEnd(false); } }
    else if (p.moved !== undefined) { if (++p.moveText >= 2) { p.how = "moved"; R.probeEnd(false); } }
    else if (p.lines.length && p.health) { p.how = "prompt line"; R.probeEnd(true); }
    else if (p.lines.length) {
      // A packet without the health line every answer has: someone else's
      // (an attack, a message). Its lines are shown again, and the probe
      // keeps waiting for its answer, for up to three such packets.
      R.probeReplay(p);
      if (++p.foreign >= 3) { p.how = "no answer"; R.probeEnd(false); }
    }
    R.probeAtPrompt = false;
    return;
  }
  if (p.start !== undefined && !p.lines.length && line === p.start) { p.start = undefined; return; }
  if (R.probeChans.length && R.probeChanned(line)) return;
  if (p.late) {
    if (/^\s*What do you wish to examine\?\s*$/.test(raw)) { gag_current_line(); p.how = "late"; R.probeEnd(false); }
    return;
  }
  if (p.moved) {
    if (raw.trim().indexOf(p.moved) === 0) { p.late = true; p.latePrompts = -1; p.lateText = 0; return; }
    if (/^You follow /.test(raw)) return;
  }
  if (R.probeTooSoon(p)) return;
  gag_current_line();
  line = raw.trim();
  if (p.lines.length < 20) p.lines.push(line);
  if (/ health remaining\.$/.test(line)) {
    p.health = true;
    var rtt = Date.now() - p.at;
    if (rtt > 0 && (!R.rttMin || rtt < R.rttMin)) R.rttMin = rtt;
  }
  if (/^What do you wish to examine\?$/.test(line)) {
    // That one line is the whole answer: anything hidden before it wasn't.
    if (p.lines.length && p.lines[p.lines.length - 1] === line) p.lines.pop();
    if (p.lines.length) R.probeReplay(p);
    p.lines.push(line);
    p.how = "gone"; R.probeEnd(false); return;
  }
  var m = /^(?:He|She|It|They) (?:is|are) loyal to (.+?)\.$/.exec(line);
  if (m) { p.owner = R.loyalOwner(m[1]); return; }
  if (p.holding) { p.how = "holding"; R.probeEnd(true); return; }
  if (/^You see nothing in it\.$/.test(line)) { p.how = "nothing"; R.probeEnd(true); return; }
  if (/ (?:is|are) holding:$/.test(line)) p.holding = true;
};
// Char.Vitals, once per packet, before or after its text. The first after a
// probe went out partway through a packet ends that packet's grace (see
// p.sendPacket). A health line read, then a prompt: the answer is in. When
// prompt lines are recognised (R.promptText), they decide the rest. Otherwise
// (another prompt), counted here: the first prompt once answer lines were
// read, else the second; after a move, the second from the title or the move.
R.probePrompt = function () {
  var p = R.probing;
  if (!p) return false;
  if (p.sendPacket) { p.sendPacket = false; return false; }
  p.prompts = (p.prompts || 0) + 1;
  if (p.health) { p.how = "prompt"; R.probeEnd(true); return true; }
  if (R.promptText) return false;
  if (p.late) { if (++p.latePrompts >= 2) { p.how = "moved"; R.probeEnd(false); return true; } return false; }
  if (p.moved !== undefined) { if (++p.movePrompts >= 2) { p.how = "moved"; R.probeEnd(false); return true; } return false; }
  if (p.prompts >= 1 && p.lines.length && !p.health) {
    // As at a prompt line: lines without the health line weren't the answer.
    R.probeReplay(p);
    if (++p.foreign >= 3) { p.how = "no answer"; R.probeEnd(false); return true; }
    p.prompts = 0;
    return false;
  }
  if (p.prompts >= 2 || (p.prompts >= 1 && p.lines.length)) { p.how = "prompts"; R.probeEnd(p.lines.length > 0); return true; }
  return false;
};
// A probe's end: ok = the whole output was read. A loyal gets one notice.
R.probeEnd = function (ok) {
  var p = R.probing;
  R.probing = null;
  clearTimeout(R.probeT);
  if (!p) return;
  // Ended without its answer (timeout, a move): what it hid wasn't the answer.
  if (!ok && !p.health && p.how !== "gone" && p.lines.length) R.probeReplay(p);
  R.probeLast = { id: p.id, name: p.name, lines: p.lines, how: p.how || "?", ms: Date.now() - p.at, replayed: p.replayed || 0 };
  if (ok) {
    if (Object.keys(R.loyal).length >= R.loyalCap) R.loyal = {};
    R.loyal[p.id] = p.owner;
    R.loyalsKeep(p.id, p.name, p.owner);
    // Silent (Ricardo): the loyal shows in Here, no notice.
    if (p.owner && !R.loyalIgnored(p.owner)) {
      if (client.loom.notify) client.loom.notify("room");
      R.drawSoon();
    }
  }
  R.probeNext();
};
// The read-only look other packages see through loom: never its variables.
//   look.newbie(name) -> the newbie title ("Ithin") someone was last seen
//     with, or undefined.
//   look.loyal(id) -> the owner's name when that mob is someone's loyal, ""
//     when probed and loyal to nobody, undefined when not probed yet.
//   look.mark() -> the remembered room { id, name, area, at } (at: when it
//     was remembered, missing for one remembered before 1.1.2), or null.
//   look.here() -> the number of the room you're in, or "".
R.look = {
  mark: function () { var m = client.loom.room.mark; return m ? { id: m.id, name: m.name, area: m.area, at: m.at } : null; },
  here: function () { var i = client.loom.room.info; return i && i.num ? String(i.num) : ""; },
  newbie: function (name) { var e = R.newbies[String(name || "").toLowerCase()]; return e ? e.title : undefined; },
  loyal: function (id) { return R.ownerOf(id); }
};
