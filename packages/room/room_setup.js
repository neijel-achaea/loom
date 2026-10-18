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
// redraw: how loom redraws the Here tab when an integration's source changes (#159).
client.loom.registry.room = { version: "0.2.6", keyword: "ROOM", desc: "{{description}}", redraw: function () { run_function("room_render", [], "room"); } };
var R = client.loom.room;
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

// Newbies (#242): players whose full name (GMCP fullname) carries one of
// these titles get a green leaf. Here reads the title live; for tabs that
// see no titles (Online, Comms) the names are remembered (room_newbies,
// name -> when last seen with the title) and forgotten once the player is
// seen without it. Helpers rebuilt on every run, the list kept.
R.newbieTitles = ["Uaithne", "Ithin", "Tuqad"];
R.newbieTitle = function (name, full) {
  var words = String(full || "").split(/[^A-Za-z']+/);
  for (var i = 0; i < words.length; i++) { if (words[i] !== name && R.newbieTitles.indexOf(words[i]) >= 0) return words[i]; }
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
// the line after "<mob> is holding:", "What do you wish to examine?" (gone),
// or the first prompt after any of its lines, whatever the wording (the
// answer comes in one go, prompt last). 2 s safety timeout. Probes wait while the basher has a run (a gagged combat line
// would be lost) and while triggers are paused. PROBE is free (Ricardo).
//   R.loyal    id -> owner, "" = loyal to nobody; in memory only (ids are
//              per mob, so a reload just probes again)
//   R.probeQ   ids waiting; R.probing {id, name, at, owner, holding, lines}
//   R.probeLast  the last probe's lines and how it ended, for ROOM PROBE DEBUG
// ROOM PROBE ON|OFF (room_probe, default on).
R.probeOn = get_variable("room_probe") != "off";
if (!R.loyal) R.loyal = {};
if (!R.probeQ) R.probeQ = [];
if (R.probing === undefined) R.probing = null;
R.probeMs = 2000;
R.loyalCap = 3000;
// Queue a mob from Char.Items, unless it's dead, known, queued or being probed.
R.probeAdd = function (it) {
  if (!it || !/m/.test(it.attrib || "") || /d/.test(it.attrib || "")) return;
  var id = String(it.id);
  if (R.loyal.hasOwnProperty(id) || R.probeQ.indexOf(id) >= 0 || (R.probing && R.probing.id === id)) return;
  R.probeQ.push(id);
};
// Whether the basher is fighting (its run, read through the basher-room link).
R.probeBusy = function () {
  var LL = client.loom.loom;
  var q = (LL && LL.answer) ? LL.answer("room", "room.queue", {}) : undefined;
  return !!(q && (q.state === "RUNNING" || q.state === "FLEEING"));
};
// Probes go out 300 ms after the last mob news, never at once: the room you
// walked into arrives alongside its mob list, and a probe sent then took the
// room's text for its answer (Ricardo: the real answer then showed).
R.probeDelay = 300;
// soft (from prompts): leave a probe already waiting to go alone, so a stream
// of prompts never keeps pushing it back.
R.probeKick = function (soft) {
  if (soft && R.probeKOn) return;
  clearTimeout(R.probeK);
  R.probeKOn = true;
  R.probeK = setTimeout(function () { R.probeKOn = false; R.probeNext(); }, R.probeDelay);
};
// Send the next probe, if nothing is in the way. Called on room changes and
// every prompt, so a wait ends by itself.
R.probeNext = function () {
  if (R.probing) {
    if (Date.now() - R.probing.at > R.probeMs) R.probeEnd(false);
    else return;
  }
  if (!R.probeOn || !R.probeQ.length) return;
  if (get_variable("pauseTriggers") == "on" || R.probeBusy()) return;
  while (R.probeQ.length) {
    var id = R.probeQ.shift();
    var it = R.items[id];
    if (it && !/d/.test(it.attrib || "")) {
      var p = { id: id, name: String(it.name || "a mob"), at: Date.now(), owner: "", holding: false, lines: [], how: "" };
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
// Every line while a probe is out: gagged, and read.
R.probeLine = function (line) {
  var p = R.probing;
  if (!p) return;
  gag_current_line();
  line = String(line || "").trim();
  if (p.lines.length < 20) p.lines.push(line);
  if (/^What do you wish to examine\?$/.test(line)) { p.how = "gone"; R.probeEnd(false); return; }
  var m = /^(?:He|She|It|They) (?:is|are) loyal to (.+?)\.$/.exec(line);
  if (m) { p.owner = R.loyalOwner(m[1]); return; }
  if (p.holding) { p.how = "holding"; R.probeEnd(true); return; }
  if (/^You see nothing in it\.$/.test(line)) { p.how = "nothing"; R.probeEnd(true); return; }
  if (/ (?:is|are) holding:$/.test(line)) p.holding = true;
};
// The prompt after a probe's lines: its answer is over, whatever it said.
// It counts as read when a health line came ("He has 95% health remaining.").
R.probePrompt = function () {
  var p = R.probing;
  if (!p || !p.lines.length) return false;
  var read = false;
  for (var i = 0; i < p.lines.length; i++) if (/ health remaining\.$/.test(p.lines[i])) read = true;
  p.how = "prompt";
  R.probeEnd(read);
  return true;
};
// A probe's end: ok = the whole output was read. A loyal gets one notice.
R.probeEnd = function (ok) {
  var p = R.probing;
  R.probing = null;
  clearTimeout(R.probeT);
  if (!p) return;
  R.probeLast = { id: p.id, name: p.name, lines: p.lines, how: p.how || "?", ms: Date.now() - p.at };
  if (ok) {
    if (Object.keys(R.loyal).length >= R.loyalCap) R.loyal = {};
    R.loyal[p.id] = p.owner;
    if (p.owner) {
      display_notice("[room] " + p.name + " (" + p.id + ") is loyal to " + p.owner + ".", "cyan");
      if (client.loom.notify) client.loom.notify("room");
      clearTimeout(R.drawT);
      R.drawT = setTimeout(function () { run_function("room_render", [], "room"); }, 50);
    }
  }
  R.probeKick();
};
// The read-only look other packages see through loom: never its variables.
//   look.newbie(name) -> the newbie title ("Ithin") someone was last seen
//     with, or undefined.
//   look.loyal(id) -> the owner's name when that mob is someone's loyal, ""
//     when probed and loyal to nobody, undefined when not probed yet.
R.look = {
  newbie: function (name) { var e = R.newbies[String(name || "").toLowerCase()]; return e ? e.title : undefined; },
  loyal: function (id) { var k = String(id); return R.loyal.hasOwnProperty(k) ? R.loyal[k] : undefined; }
};
