// sigils_setup -- run from onLoad and onInstall. Namespace, registry,
// one-time migration from the old eleusis variables, defaults.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.sigils) client.loom.sigils = {};
// busy (#318): true while a monolith probe sigils sent has had no answer
// yet, so Here's loyal probe waits its turn instead of gagging the answer.
// An answer lost for 5 s no longer counts (sigils_take drops it at 15 s).
client.loom.registry.sigils = { version: "0.2.8", keyword: "SIGILS", desc: "{{description}}", busy: function () {
  var Sb = client.loom.sigils, q = (Sb && Sb.queue) || [], now = Date.now();
  for (var i = 0; i < q.length; i++) if (now - q[i].t < 5000) return true;
  return false;
} };

var S = client.loom.sigils;
S.queue = [];
S.await = null;

// Migration: copy the eleusis-era mono_* variables once. The old ones are
// left in place so an older package still finds its data.
var moves = [["mono_on", "sigils_on"], ["mono_threshold", "sigils_threshold"],
  ["mono_bad", "sigils_flagged"], ["mono_ignore", "sigils_ignored"],
  ["mono_cost_monolith", "sigils_cost_monolith"], ["mono_cost_flame", "sigils_cost_flame"]];
for (var i = 0; i < moves.length; i++) {
  var oldv = get_variable(moves[i][0]);
  var newv = get_variable(moves[i][1]);
  if ((newv === null || newv === undefined) && oldv !== null && oldv !== undefined) {
    set_variable(moves[i][1], oldv);
  }
}

if (get_variable("sigils_threshold") === null || get_variable("sigils_threshold") === undefined) set_variable("sigils_threshold", 10);
if (get_variable("sigils_cost_monolith") === null || get_variable("sigils_cost_monolith") === undefined) set_variable("sigils_cost_monolith", 1500);
if (get_variable("sigils_cost_flame") === null || get_variable("sigils_cost_flame") === undefined) set_variable("sigils_cost_flame", 500);
if (!get_variable("sigils_flagged")) set_variable("sigils_flagged", {});
if (!get_variable("sigils_ignored")) set_variable("sigils_ignored", {});

// The read-only look other tabs see through loom (#159, #165): what sigils
// makes of a room, never its variables.
//   look.isMonolith(name) -> true for a monolith among a room's items
//   look.ignored(roomId)  -> true for a room on SIGILS IGNORE's list
//   look.expiring()       -> the flagged rooms whose monolith is under the
//     threshold, ignored ones left out (#42): [{ id, name, months, t }],
//     months as read (-1 none, 0 under a month), t the reading's time (ms)
S.look = {
  isMonolith: function (name) { return /\bmonolith\b/i.test(String(name || "")); },
  ignored: function (id) { var ign = get_variable("sigils_ignored") || {}; return !!ign[String(id)]; },
  expiring: function () {
    var bad = get_variable("sigils_flagged") || {}, ign = get_variable("sigils_ignored") || {};
    var thr = get_variable("sigils_threshold");
    if (thr === null || thr === undefined) thr = 10;
    var out = [];
    for (var k in bad) {
      if (!bad.hasOwnProperty(k) || ign[k]) continue;
      var r = bad[k];
      var mo = (r.months === null || r.months === undefined) ? -1 : r.months;
      if (mo < thr) out.push({ id: String(r.id), name: r.name || "?", months: mo, t: r.t || 0 });
    }
    return out;
  }
};
