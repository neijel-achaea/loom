// transmutation_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, saved state, helpers.
// Transmutation is the Transmutation trade skill's package (#373). For now it
// does extraction only: on entering a mountain or natural underground room it
// extracts the area's mineral when your rift is short of it, and stores it.
// Every area gives one mineral and it never changes (Ricardo), so the package
// keeps a map of area -> mineral, learnt from MINERALS: it sends MINERALS
// itself once in an area it doesn't know yet, and learns from yours too.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.transmutation) client.loom.transmutation = {};
var TR = client.loom.transmutation;
// busy (#318): true only while something it sent is out (an EXTRACT with
// its INR, a MINERALS, the rift reading), so Here's probe, harvesting and
// gathering wait for it, and it for them, without both waiting on each other.
client.loom.registry.transmutation = { version: "0.1.1", keyword: "TRANSMUTATION", desc: "{{description}}", busy: function () {
  var t = client.loom.transmutation;
  return !!(t && t.on && (t.current || t.probing || t.reading) && Date.now() - (t.sentAt || 0) < 15000);
} };

// Environments (GMCP Room.Info environment, lower case) minerals can be
// extracted in.
TR.envs = { mountain: true, mountains: true, "natural underground": true };
// Every mineral (HELP MINERALS): what MIN accepts.
TR.minerals = ["antimony", "argentum", "arsenic", "aurum", "azurite", "bisemutum", "calamine", "calcite", "cinnabar", "cuprum",
  "dolomite", "ferrum", "gypsum", "magnesium", "malachite", "plumbum", "potash", "quartz", "quicksilver", "realgar", "stannum"];
TR.known = function (m) { return TR.minerals.indexOf(String(m || "").toLowerCase()) >= 0; };
// A room can't be extracted from again for a while (the game says "that
// day"): rooms extracted this session are skipped for an hour.
TR.againMs = 3600000;
// An area is taken to have no minerals after this many of its rooms showed
// none. Rooms don't get worked out (Ricardo), so one empty MINERALS answers
// for the whole area.
TR.noneAfter = 1;

// Saved state. A variable that isn't a readable table starts afresh (#135).
TR.readTable = function (name, dflt) {
  var v = get_variable(name);
  if (typeof v == "string") { try { v = JSON.parse(v); } catch (e) { v = null; } }
  return (v && typeof v == "object" && !Array.isArray(v)) ? v : dflt;
};
TR.min = TR.readTable("transmutation_min", {});
TR.stock = TR.readTable("transmutation_stock", {});
// Area (GMCP Room.Info area) -> its mineral, "" for an area with none.
TR.areas = TR.readTable("transmutation_areas", {});
if (!to_number(get_variable("transmutation_default_min"))) set_variable("transmutation_default_min", 500);
TR.defMin = to_number(get_variable("transmutation_default_min"));

// Runtime state. The switch is never remembered: transmutation loads off.
if (TR.on === undefined) TR.on = false;
if (TR.here === undefined) TR.here = "";
if (TR.area === undefined) TR.area = "";
if (TR.room === undefined) TR.room = "";
if (!TR.done) TR.done = {};
if (!TR.noneSeen) TR.noneSeen = {};
if (!TR.asked) TR.asked = {};
if (TR.want === undefined) TR.want = null;
if (TR.current === undefined) TR.current = null;
if (TR.probing === undefined) TR.probing = null;
if (TR.reading === undefined) TR.reading = false;
if (TR.wantRead === undefined) TR.wantRead = false;
TR.inRift = false;
TR.ownRift = false;
TR.dashes = 0;
TR.spot = null;
TR.bal = true;
TR.eq = true;
TR.timeoutMs = 15000;

TR.minOf = function (m) { return TR.min[m] != null ? TR.min[m] : TR.defMin; };
TR.have = function (m) { var s = TR.stock[m]; return (s === undefined || s === null) ? null : s; };
TR.paused = function () { return get_variable("pauseTriggers") == "on"; };
TR.say = function (text, colour) { display_notice("[transmutation] " + text, colour || "cyan"); };
TR.save = function () {
  set_variable("transmutation_min", TR.min);
  set_variable("transmutation_stock", TR.stock);
  set_variable("transmutation_areas", TR.areas);
  if (client.loom.notify) client.loom.notify("transmutation");
};
// Is any other package waiting for an answer to something it sent (#318)?
TR.othersBusy = function () {
  var r = client.loom.registry || {};
  for (var k in r) {
    if (!r.hasOwnProperty(k) || k == "transmutation" || !r[k] || typeof r[k].busy != "function") continue;
    try { if (r[k].busy()) return k; } catch (e) {}
  }
  return "";
};

// What this room wants: a MINERALS for an area not known yet, an EXTRACT
// when the area's mineral is short and this room hasn't been extracted
// lately, or nothing.
TR.decide = function () {
  TR.want = null;
  if (!TR.on || TR.paused() || !TR.envs[TR.here] || !TR.area) return;
  var m = TR.areas[TR.area];
  // One MINERALS per room: an answer that never came isn't asked again.
  if (m === undefined) { if (!TR.asked[TR.room || TR.area]) TR.want = { probe: true }; return; }
  if (!m) return;
  if ((TR.have(m) || 0) >= TR.minOf(m)) return;
  if (TR.room && TR.done[TR.room] && Date.now() - TR.done[TR.room] < TR.againMs) return;
  TR.want = { m: m };
};
// A new room (Room.Info).
TR.enter = function (g) {
  TR.here = String(g.environment || "").toLowerCase();
  TR.area = String(g.area || "");
  TR.room = (g.num === undefined || g.num === null) ? "" : String(g.num);
  TR.probing = null;
  TR.spot = null;
  if (TR.on && !TR.started) { TR.started = true; TR.wantRead = true; }
  TR.decide();
};

// At each prompt (after its packet's lines): settle what's out, then send the
// next thing when balance, equilibrium and every other package allow it.
TR.prompt = function () {
  var now = Date.now();
  // A MINERALS you typed ends with its packet.
  if (!TR.probing) TR.spot = null;
  if (!TR.on) return;
  // A rift reading whose listing never came stops waiting.
  if (TR.reading && now - TR.sentAt > TR.timeoutMs) { TR.reading = false; TR.ownRift = false; }
  if (TR.probing) {
    TR.probing.prompts++;
    // The MINERALS header came with this packet (or never will).
    if (TR.probing.answered || TR.probing.prompts >= 3 || now - TR.probing.at > TR.timeoutMs) TR.probed();
    else return;
  }
  if (TR.current) {
    var c = TR.current;
    c.prompts++;
    if (!TR.bal || !TR.eq) c.lost = true;
    else if (c.lost) c.back++;
    // Stored: the "You store" line cleared it. Otherwise: balance came back
    // and the queued INR had two prompts to answer; or the extract failed
    // without taking balance; or too long.
    if (c.back >= 2 || (!c.lost && c.prompts >= 3) || now - c.at > TR.timeoutMs) TR.current = null;
    else return;
  }
  TR.pump();
};
TR.pump = function () {
  if (!TR.on || TR.paused() || TR.current || TR.probing || TR.reading) return;
  if (!TR.wantRead && !TR.want) return;
  if (!TR.bal || !TR.eq || TR.othersBusy()) return;
  TR.sentAt = Date.now();
  if (TR.wantRead) {
    TR.wantRead = false;
    TR.reading = true;
    send_command("ir minerals");
    return;
  }
  var w = TR.want;
  TR.want = null;
  if (w.probe) {
    TR.probing = { area: TR.area, room: TR.room, at: TR.sentAt, prompts: 0, answered: false };
    TR.asked[TR.room || TR.area] = true;
    TR.spot = null;
    send_command("minerals");
    return;
  }
  TR.current = { m: w.m, at: TR.sentAt, prompts: 0, lost: false, back: 0 };
  if (TR.room) TR.done[TR.room] = TR.sentAt;
  send_command("extract " + w.m);
};
// "You kneel and collect chunks of earth, … pull a group of 5 calamine
// crystals from the dirt and rock. …": ours worked, so store it once
// balance is back. Any other answer is settled at the prompt (TR.prompt).
TR.extracted = function () {
  var c = TR.current;
  if (!c || c.inr) return false;
  c.inr = true;
  send_command("queue add be inr " + c.m);
  return true;
};

// MINERALS output: "You spot the following minerals here:", then one row per
// mineral ("Calamine Abundant"), or nothing when there are none. Ours or one
// you typed: either way what's seen is the area's mineral.
TR.spotStart = function () {
  TR.spot = [];
  if (TR.probing) TR.probing.answered = true;
};
TR.spotRow = function (name, amount) {
  if (!TR.spot) return false;
  var m = String(name || "").toLowerCase();
  if (!TR.known(m)) return false;
  TR.spot.push({ m: m, amount: String(amount || "").trim().toLowerCase() });
  if (!TR.probing && TR.area) TR.learn(TR.area, m);
  return true;
};
// Our MINERALS has been answered (or given up on): learn the area, or count
// a room without minerals.
TR.probed = function () {
  var p = TR.probing;
  TR.probing = null;
  if (!p) return;
  if (TR.spot && TR.spot.length) {
    TR.learn(p.area, TR.spot[0].m);
  } else if (p.answered) {
    TR.noneSeen[p.area] = (TR.noneSeen[p.area] || 0) + 1;
    if (TR.noneSeen[p.area] >= TR.noneAfter) {
      TR.areas[p.area] = "";
      TR.save();
      TR.say(p.area + ": no minerals, so none to extract there (TRANSMUTATION FORGET HERE to look again).");
    }
  }
  TR.spot = null;
  // Still in the room probed: extract now if short.
  if (TR.area == p.area && TR.room == p.room) TR.decide();
};
TR.learn = function (area, m) {
  if (TR.areas[area] === m) return;
  var was = TR.areas[area];
  TR.areas[area] = m;
  delete TR.noneSeen[area];
  TR.save();
  TR.say(area + " gives " + m + (was ? " (was " + was + ")" : "") + ".", "lime");
};

// "You store N malachite, bringing the total in the rift to M." (and remove)
TR.stored = function (name, total, storing) {
  var m = String(name || "").toLowerCase();
  if (!TR.known(m)) return;
  TR.stock[m] = total;
  if (storing && TR.current && TR.current.m == m) TR.current = null;
  TR.save();
};

// The read-only look other packages see through loom (#159), the same shape
// as harvesting's and gathering's: look.plant(name) -> { stock, min, tracked },
// look.levels() -> [{ plant, rift, stock, min }] for minerals seen in the rift,
// and look.areas() -> { area: mineral } ("" for none).
TR.look = {
  plant: function (name) {
    var m = String(name || "").trim().toLowerCase();
    return { stock: TR.have(m), min: TR.minOf(m), tracked: TR.known(m) };
  },
  levels: function () {
    var out = [];
    for (var i = 0; i < TR.minerals.length; i++) {
      var h = TR.have(TR.minerals[i]);
      if (h !== null) out.push({ plant: TR.minerals[i], rift: TR.minerals[i], stock: h, min: TR.minOf(TR.minerals[i]) });
    }
    return out;
  },
  areas: function () {
    var out = {};
    for (var a in TR.areas) if (TR.areas.hasOwnProperty(a)) out[a] = TR.areas[a];
    return out;
  }
};
if (client.loom.notify) client.loom.notify("transmutation");
