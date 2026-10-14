// sigils_setup -- run from onLoad and onInstall. Namespace, registry,
// one-time migration from the old eleusis variables, defaults.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.sigils) client.loom.sigils = {};
client.loom.registry.sigils = { version: "0.2.3", keyword: "SIGILS", desc: "{{description}}" };

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
