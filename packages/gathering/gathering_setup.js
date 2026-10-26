// gathering_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, saved state, helpers.
// Gathering is the Gathering trade skill's counterpart to harvesting: on
// entering a room it gathers the materials of the room's environment that
// your rift is short of, one per balance, and puts each into the rift.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.gathering) client.loom.gathering = {};
var GA = client.loom.gathering;
// busy (#318): true while a GATHER or the rift reading is out, or while the
// room's queue is still being worked through, so Here's probe and other
// packages wait their turn. 10 s without a send no longer counts.
client.loom.registry.gathering = { version: "0.1.0", keyword: "GATHERING", desc: "{{description}}", busy: function () {
  var g = client.loom.gathering;
  return !!(g && g.on && (g.current || g.reading || (g.queue && g.queue.length)) && Date.now() - (g.sentAt || 0) < 10000);
} };

// What each environment (GMCP Room.Info environment, lower case) gives.
// Saltwater and milk need an empty vial, and GATHER FROM FARM gives eggs or
// milk at random, so those three are left to you.
GA.envs = {
  jungle:                ["fruit", "cacao"],
  garden:                ["fruit", "vegetables"],
  grasslands:            ["grain", "sugarcane"],
  valley:                ["olives"],
  forest:                ["nuts"],
  "natural underground": ["lumic", "dust"],
  river:                 ["clay"]
};
// Other names a material goes by (patrolling's plant names, singulars).
GA.alias = { vegetable: "vegetables", olive: "olives", nut: "nuts", fruits: "fruit", grains: "grain", sugarcanes: "sugarcane", cacaos: "cacao", diamond: "dust" };
GA.name = function (s) {
  var n = String(s || "").trim().toLowerCase();
  return GA.alias[n] || n;
};
GA.known = function (m) {
  for (var e in GA.envs) { if (GA.envs.hasOwnProperty(e) && GA.envs[e].indexOf(m) >= 0) return true; }
  return false;
};

// Saved state. A variable that isn't a readable table starts afresh (#135).
GA.readTable = function (name, dflt) {
  var v = get_variable(name);
  if (typeof v == "string") { try { v = JSON.parse(v); } catch (e) { v = null; } }
  return (v && typeof v == "object" && !Array.isArray(v)) ? v : dflt;
};
GA.min = GA.readTable("gathering_min", {});
// Material -> its name in the rift, where they differ. Learnt from the
// "You store N …" line that follows our own INR.
GA.map = GA.readTable("gathering_map", { vegetables: "vegetable", olives: "olive" });
GA.stock = GA.readTable("gathering_stock", {});
if (!to_number(get_variable("gathering_default_min"))) set_variable("gathering_default_min", 500);
GA.defMin = to_number(get_variable("gathering_default_min"));

// Runtime state. The switch is never remembered: gathering loads off.
if (GA.on === undefined) GA.on = false;
if (!GA.queue) GA.queue = [];
if (GA.current === undefined) GA.current = null;
if (GA.here === undefined) GA.here = "";
if (GA.reading === undefined) GA.reading = false;
if (GA.wantRead === undefined) GA.wantRead = false;
GA.inRift = false;
GA.ownRift = false;
GA.dashes = 0;
GA.inrFor = null;
GA.lastFail = null;
GA.bal = true;
GA.eq = true;
if (!GA.rttMin) GA.rttMin = 0;
GA.timeoutMs = 5000;

GA.rift = function (m) { return GA.map[m] || m; };
GA.minOf = function (m) { return GA.min[m] != null ? GA.min[m] : GA.defMin; };
GA.have = function (m) { var s = GA.stock[GA.rift(m)]; return (s === undefined || s === null) ? null : s; };
GA.paused = function () { return get_variable("pauseTriggers") == "on"; };
GA.save = function () {
  set_variable("gathering_min", GA.min);
  set_variable("gathering_map", GA.map);
  set_variable("gathering_stock", GA.stock);
  if (client.loom.notify) client.loom.notify("gathering");
};
// Is any other package waiting for an answer to something it sent (#318)?
// Gathering shares harvesting's success line, so it never has a GATHER out
// while harvesting (or a probe) has a command out.
GA.othersBusy = function () {
  var r = client.loom.registry || {};
  for (var k in r) {
    if (!r.hasOwnProperty(k) || k == "gathering" || !r[k] || typeof r[k].busy != "function") continue;
    try { if (r[k].busy()) return k; } catch (e) {}
  }
  return "";
};

// A new room: queue this environment's materials that are short.
GA.room = function (env) {
  GA.here = String(env || "").toLowerCase();
  GA.queue = [];
  GA.current = null;
  GA.lastFail = null;
  if (!GA.on || GA.paused()) return;
  if (!GA.started) { GA.started = true; GA.wantRead = true; }
  var list = GA.envs[GA.here] || [];
  for (var i = 0; i < list.length; i++) {
    var h = GA.have(list[i]);
    if ((h || 0) < GA.minOf(list[i])) GA.queue.push(list[i]);
  }
  if (GA.queue.length || GA.wantRead) GA.sentAt = Date.now();
};

// At each prompt (after its packet's lines): settle a GATHER that got no
// success line, then send the next thing when balance, equilibrium and every
// other package allow it.
GA.prompt = function () {
  // A rift reading whose listing never came (an empty rift, say) stops waiting.
  if (GA.reading && Date.now() - GA.sentAt > GA.timeoutMs) { GA.reading = false; GA.ownRift = false; }
  if (GA.current) {
    GA.prompts++;
    var waited = Date.now() - GA.sentAt;
    var soonest = GA.rttMin ? Math.floor(GA.rttMin * 0.8) : 60;
    if ((GA.prompts >= 1 && waited >= soonest) || GA.prompts >= 2 || waited > GA.timeoutMs) GA.fail(GA.current);
    else return;
  }
  GA.pump();
};
GA.pump = function () {
  if (!GA.on || GA.paused() || GA.current || GA.reading) return;
  if (!GA.wantRead && !GA.queue.length) return;
  if (!GA.bal || !GA.eq || GA.othersBusy()) return;
  if (GA.wantRead) {
    GA.wantRead = false;
    GA.reading = true;
    GA.sentAt = Date.now();
    send_command("ir ingredients");
    return;
  }
  GA.current = GA.queue.shift();
  GA.prompts = 0;
  GA.sentAt = Date.now();
  send_command("gather " + GA.current);
};
// A success line for what we sent (or for one we gave up on a moment ago).
GA.success = function () {
  var m = GA.current;
  if (!m && GA.lastFail && Date.now() - GA.lastFail.at < 3000) m = GA.lastFail.m;
  if (!m) return false;
  if (GA.current) {
    var rtt = Date.now() - GA.sentAt;
    if (rtt > 0 && (!GA.rttMin || rtt < GA.rttMin)) GA.rttMin = rtt;
  }
  GA.current = null;
  GA.lastFail = null;
  GA.inrFor = m;
  GA.last = m;
  GA.lastAt = Date.now();
  send_command("queue add be inr " + GA.rift(m));
  return true;
};
// Anything that came with a gather (seeds with fruit, gold with clay) goes
// into the rift too.
GA.extra = function (what) {
  if (!GA.lastAt || Date.now() - GA.lastAt > 1000) return;
  send_command("queue add be inr " + what);
};
GA.fail = function (m) {
  GA.current = null;
  GA.lastFail = { m: m, at: Date.now() };
};
// "You store N x, bringing the total in the rift to M."
GA.stored = function (name, total) {
  if (GA.inrFor) {
    // Learn the rift name, unless it is another material's.
    var other = GA.riftOwner(name);
    if (!other || other == GA.inrFor) {
      if (name != GA.inrFor) GA.map[GA.inrFor] = name;
      else delete GA.map[GA.inrFor];
    }
    GA.inrFor = null;
  } else if (!GA.isRiftName(name)) return;
  GA.stock[name] = total;
  GA.save();
};
// The material whose rift name this is, if any.
GA.riftOwner = function (name) {
  for (var e in GA.envs) {
    if (!GA.envs.hasOwnProperty(e)) continue;
    for (var i = 0; i < GA.envs[e].length; i++) if (GA.rift(GA.envs[e][i]) == name) return GA.envs[e][i];
  }
  return "";
};
GA.isRiftName = function (name) {
  return GA.stock.hasOwnProperty(name) || !!GA.riftOwner(name);
};

// The read-only look other packages see through loom (#159), same shape as
// harvesting's: look.plant(name) -> { stock, min, tracked }, look.levels().
GA.look = {
  plant: function (name) {
    var m = GA.name(name);
    return { stock: GA.have(m), min: GA.minOf(m), tracked: GA.known(m) };
  },
  levels: function () {
    var out = [], seen = {};
    for (var e in GA.envs) {
      if (!GA.envs.hasOwnProperty(e)) continue;
      for (var i = 0; i < GA.envs[e].length; i++) {
        var m = GA.envs[e][i];
        if (seen[m]) continue;
        seen[m] = true;
        var h = GA.have(m);
        if (h !== null) out.push({ plant: m, stock: h, min: GA.minOf(m) });
      }
    }
    return out;
  }
};
if (client.loom.notify) client.loom.notify("gathering");
