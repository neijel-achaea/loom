// remedies_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, saved state, helpers.
// Remedies is for the Remedies trade skill. Its first job (#436, Ricardo):
// REMEDIES BREW tops every elixir and salve in your rift up to its target,
// brewing in your pot and pouring into the rift, one step at a time, each
// waiting for the game's answer to the one before; then it stops.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.remedies) client.loom.remedies = {};
var RM = client.loom.remedies;
// busy (#318): true while a run has a command out, so Here's probe and
// other packages wait their turn (and a run waits for theirs).
client.loom.registry.remedies = { version: "0.1.0", keyword: "REMEDIES", desc: "{{description}}", busy: function () {
  var r = client.loom.remedies;
  return !!(r && r.run && r.run.out && Date.now() - (r.run.sentAt || 0) < r.timeoutMs);
} };

// The game's numbers (Ricardo): 50 sips a unit, at most 20 units a brew.
RM.sipsPerUnit = 50;
RM.maxUnits = 20;
RM.timeoutMs = 8000;      // an answer that never comes stops the run
// Default targets: health and mana 2,000, everything else 1,000.
RM.defaults = { health: 2000, mana: 2000 };
RM.defaultTarget = 1000;

// Saved state. A variable that isn't a readable table starts afresh (#135).
RM.readTable = function (name) {
  var v = get_variable(name);
  if (typeof v == "string") { try { v = JSON.parse(v); } catch (e) { v = null; } }
  return (v && typeof v == "object" && !Array.isArray(v)) ? v : {};
};
//   remedies_targets  { name: n }  your own targets (defaults otherwise)
//   remedies_stock    { name: { n, kind: "elixir"|"salve" } }  the rift, as last read
//   remedies_caps     { name: n }  the most the rift takes of one, learnt when a pour came up short
//   remedies_pot      the pot you brew in, as you named it (pot123456)
RM.targets = RM.readTable("remedies_targets");
RM.stock = RM.readTable("remedies_stock");
RM.caps = RM.readTable("remedies_caps");
RM.pot = String(get_variable("remedies_pot") || "");
RM.saveTable = function (name, t) {
  var any = false;
  for (var k in t) if (t.hasOwnProperty(k)) { any = true; break; }
  try { if (any) set_variable(name, JSON.stringify(t)); else delete_variable(name); } catch (e) {}
};
RM.save = function () {
  RM.saveTable("remedies_targets", RM.targets);
  RM.saveTable("remedies_stock", RM.stock);
  RM.saveTable("remedies_caps", RM.caps);
  if (client.loom.notify) client.loom.notify("remedies");
};

// Runtime (never remembered: a reload ends a run).
if (RM.run === undefined) RM.run = null;
RM.bal = true;
RM.eq = true;
RM.reading = null;        // the IR listing being read: { kind, rule }
RM.say = function (t, c) { display_notice("[remedies] " + t, c || "cyan"); };
RM.paused = function () { return get_variable("pauseTriggers") == "on"; };
RM.n = function (x) { return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };

// The level a remedy is topped up to: your target, never above the rift's cap.
RM.targetOf = function (name) {
  var t = RM.targets[name] != null ? RM.targets[name] : (RM.defaults[name] != null ? RM.defaults[name] : RM.defaultTarget);
  if (RM.caps[name] != null && RM.caps[name] < t) t = RM.caps[name];
  return t;
};
// Units to brew for one remedy, never overshooting its target.
RM.unitsFor = function (name) {
  var s = RM.stock[name];
  if (!s) return 0;
  var short = RM.targetOf(name) - s.n;
  return short > 0 ? Math.floor(short / RM.sipsPerUnit) : 0;
};
// The plan from the stock as last read: [{ name, kind, units }].
RM.plan = function () {
  var out = [], kinds = ["elixir", "salve"];
  for (var k = 0; k < kinds.length; k++) {
    var names = [];
    for (var nm in RM.stock) if (RM.stock.hasOwnProperty(nm) && RM.stock[nm].kind == kinds[k]) names.push(nm);
    names.sort();
    for (var i = 0; i < names.length; i++) {
      var u = RM.unitsFor(names[i]);
      if (u > 0) out.push({ name: names[i], kind: kinds[k], units: u });
    }
  }
  return out;
};
// Is any other package waiting for an answer to something it sent (#318)?
RM.othersBusy = function () {
  var r = client.loom.registry || {};
  for (var k in r) {
    if (!r.hasOwnProperty(k) || k == "remedies" || !r[k] || typeof r[k].busy != "function") continue;
    try { if (r[k].busy()) return k; } catch (e) {}
  }
  return "";
};

// ---- A run ---------------------------------------------------------------
// RM.run = { dry, steps: ["read elixir", "read salve", then per remedy
// "brew"/"pour"], plan, i (remedy), left (units still to brew for it),
// out (what's waiting for an answer: "read"|"brew"|"pour"|""), brewed
// (units in the pot now), done: [{ name, units, sips }], skipped: [...],
// sentAt, readQ ["elixir","salve"] }.
RM.start = function (dry) {
  if (RM.run) { RM.say("a run is already under way. REMEDIES STOP ends it.", "orange"); return; }
  if (!dry && !RM.pot) { RM.say("set your pot first: REMEDIES POT <pot>, e.g. REMEDIES POT pot123456.", "orange"); return; }
  RM.run = { dry: !!dry, readQ: ["elixir", "salve"], plan: null, i: 0, left: 0, out: "", brewed: 0, done: [], skipped: [], full: [], sentAt: 0, potRetry: false };
  RM.say(dry ? "reading your rift to see what's short…" : "reading your rift, then brewing in " + RM.pot + "… REMEDIES STOP ends it.", "lime");
  RM.pump();
};
RM.stop = function (why, colour) {
  if (!RM.run) return;
  var r = RM.run;
  RM.run = null;
  RM.reading = null;
  if (why) RM.say(why, colour || "orange");
  RM.summary(r);
};
RM.summary = function (r) {
  if (r.dry || !r.plan) return;
  var parts = [];
  for (var i = 0; i < r.done.length; i++) parts.push(r.done[i].name + " " + RM.n(r.done[i].sips) + " sips");
  var msg = parts.length ? "brewed " + parts.join(", ") : "nothing brewed";
  if (r.skipped.length) msg += "; skipped " + r.skipped.join(", ");
  if (r.full.length) msg += "; rift full for " + r.full.join(", ");
  RM.say(msg + ".", parts.length ? "lime" : "cyan");
};
// Send the next command when nothing is waiting, at a prompt, with balance
// and equilibrium, and no other package's answer still coming.
RM.pump = function () {
  var r = RM.run;
  if (!r || r.out) return;
  if (RM.paused() || !RM.bal || !RM.eq || RM.othersBusy()) return;
  if (r.readQ.length) {
    var kind = r.readQ.shift();
    RM.reading = { kind: kind, rule: 0, own: true };
    RM.send("read", "ir " + kind);
    return;
  }
  if (!r.plan) {
    r.plan = RM.plan();
    if (r.dry) {
      var lines = [];
      for (var p = 0; p < r.plan.length; p++) lines.push(r.plan[p].name + " " + r.plan[p].units + " unit" + (r.plan[p].units == 1 ? "" : "s"));
      RM.run = null;
      RM.say(lines.length ? "to brew: " + lines.join(", ") + ". REMEDIES BREW to do it." : "everything is at its target (or within 50 sips of it).");
      return;
    }
    if (!r.plan.length) { RM.run = null; RM.say("everything is at its target (or within 50 sips of it): nothing to brew."); return; }
    r.i = 0; r.left = r.plan[0].units;
  }
  if (r.brewed > 0) { RM.send("pour", "pour " + RM.pot + " in rift"); return; }
  while (r.i < r.plan.length && r.left <= 0) { r.i++; if (r.i < r.plan.length) r.left = r.plan[r.i].units; }
  if (r.i >= r.plan.length) { RM.stop("", ""); return; }
  var it = r.plan[r.i];
  r.n = Math.min(RM.maxUnits, r.left);
  RM.send("brew", "brew " + r.n + " " + it.name + " in " + RM.pot);
};
RM.send = function (what, cmd) {
  RM.run.out = what;
  RM.run.sentAt = Date.now();
  send_command(cmd);
};
// From onGMCP at each prompt (after its packet's lines).
RM.prompt = function () {
  var r = RM.run;
  if (!r) return;
  // A category with nothing in it may not list at all: stop waiting after 3 s.
  if (r.out == "read" && Date.now() - r.sentAt > 3000) RM.listed();
  if (r.out && Date.now() - r.sentAt > RM.timeoutMs) {
    RM.reading = null;
    RM.stop("no answer to " + (r.out == "read" ? "IR" : r.out.toUpperCase()) + " after " + (RM.timeoutMs / 1000) + " s: stopped.");
    return;
  }
  RM.pump();
};
RM.cur = function () { var r = RM.run; return r && r.plan ? r.plan[r.i] : null; };

// ---- Answers -------------------------------------------------------------
// The rift listing: "[ 947] frost [ 1443] health [ 958] immunity".
RM.row = function (text) {
  var R = RM.reading;
  if (!R) return false;
  var re = /\[\s*([\d,]+)\]\s+(.+?)(?=\s+\[|\s*$)/g, m, any = false;
  while ((m = re.exec(text)) !== null) {
    RM.stock[m[2].toLowerCase()] = { n: parseInt(m[1].replace(/,/g, ""), 10), kind: R.kind };
    any = true;
  }
  return any;
};
RM.rule = function () {
  var R = RM.reading;
  if (!R) return;
  R.rule++;
  if (R.rule >= 2) RM.listed();
};
// A listing ended (its second rule), or the game said the rift has none.
RM.listed = function () {
  RM.reading = null;
  if (RM.run && RM.run.out == "read") { RM.run.out = ""; RM.save(); }
};
// "You place your ingredients into …, leaving you with …."
RM.brewed = function () {
  var r = RM.run;
  if (!r || r.out != "brew") return false;
  r.out = "";
  r.brewed = r.n;
  r.left -= r.n;
  r.potRetry = false;
  return true;
};
// "You carefully pour N sips of X from … into your rift, bringing the total
// stored sips to M."
RM.poured = function (sips, total) {
  var r = RM.run, it = RM.cur();
  if (!r || r.out != "pour" || !it) return false;
  r.out = "";
  var want = r.brewed * RM.sipsPerUnit;
  r.brewed = 0;
  RM.stock[it.name] = { n: total, kind: it.kind };
  var d = null;
  for (var i = 0; i < r.done.length; i++) if (r.done[i].name == it.name) d = r.done[i];
  if (!d) { d = { name: it.name, sips: 0 }; r.done.push(d); }
  d.sips += sips;
  if (sips < want) {
    // The rift took less than the pot held: that's its cap for this one.
    RM.caps[it.name] = total;
    RM.save();
    RM.stop("the rift took only " + sips + " of " + want + " sips of " + it.name + " (its limit is " + RM.n(total) + "; your target now stops there). " + (want - sips) + " sips are still in " + RM.pot + ": use or empty them before brewing again.");
    return true;
  }
  RM.save();
  return true;
};
// "Your rift is already full."
RM.full = function () {
  var r = RM.run, it = RM.cur();
  if (!r || r.out != "pour" || !it) return false;
  r.out = "";
  RM.caps[it.name] = RM.stock[it.name] ? RM.stock[it.name].n : 0;
  RM.save();
  RM.stop("your rift is already full of " + it.name + " (" + RM.n(RM.caps[it.name]) + "; your target now stops there). " + (r.brewed * RM.sipsPerUnit) + " sips are still in " + RM.pot + ".");
  return true;
};
// "<pot> is empty." in answer to our pour: nothing was in it.
RM.empty = function () {
  var r = RM.run;
  if (!r || r.out != "pour") return false;
  r.out = "";
  r.brewed = 0;
  return true;
};
// "That pot already contains X!": pour it into the rift first, then brew again.
RM.potFull = function (what) {
  var r = RM.run;
  if (!r || r.out != "brew") return false;
  r.out = "";
  if (r.potRetry) { RM.stop(RM.pot + " still holds " + what + ": empty it, then REMEDIES BREW again."); return true; }
  r.potRetry = true;
  // Pour whatever it is; the pour line says what and how much.
  r.brewed = 0;
  r.out = "pourOld";
  r.sentAt = Date.now();
  RM.say(RM.pot + " already holds " + what + ": pouring it into your rift first.");
  send_command("pour " + RM.pot + " in rift");
  return true;
};
// Which remedy a pour line's "an elixir of mana" is: the known name in it.
RM.whichIs = function (what) {
  var t = " " + String(what || "").toLowerCase().replace(/[^a-z]+/g, " ") + " ";
  for (var k in RM.stock) if (RM.stock.hasOwnProperty(k) && t.indexOf(" " + k + " ") >= 0) return k;
  return "";
};
// The answer to that first pour (any pour line, rift full, or empty). What
// went in counts towards its remedy: the plan for it shrinks.
RM.oldPoured = function (ok, total, what) {
  var r = RM.run;
  if (!r || r.out != "pourOld") return false;
  r.out = "";
  var k = ok && total !== undefined ? RM.whichIs(what) : "";
  if (k) {
    RM.stock[k].n = total;
    RM.save();
    for (var i = r.i; r.plan && i < r.plan.length; i++) {
      if (r.plan[i].name != k) continue;
      var u = RM.unitsFor(k);
      if (i == r.i) r.left = Math.min(r.left, u); else r.plan[i].units = u;
    }
  }
  if (!ok) { RM.stop(RM.pot + " still holds something the rift won't take: empty it, then REMEDIES BREW again."); }
  return true;
};
// "You lack the required ingredients to brew that.": skip it, go on.
RM.noIngredients = function () {
  var r = RM.run, it = RM.cur();
  if (!r || r.out != "brew" || !it) return false;
  r.out = "";
  r.skipped.push(it.name + " (no ingredients)");
  r.left = 0;
  return true;
};
// "That is not a pot."
RM.notPot = function () {
  var r = RM.run;
  if (!r || (r.out != "brew" && r.out != "pour" && r.out != "pourOld")) return false;
  r.out = "";
  RM.stop(RM.pot + " is not a pot: set yours with REMEDIES POT <pot>.");
  return true;
};
