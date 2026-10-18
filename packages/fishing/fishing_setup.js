// fishing_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.fishing) client.loom.fishing = {};
client.loom.registry.fishing = { version: "0.2.3", keyword: "FISHING", desc: "{{description}}" };

// One-time migration: bait -> fishing_bait.
var fiOld = get_variable("bait");
if (fiOld !== null && fiOld !== undefined) {
  if (!get_variable("fishing_bait")) set_variable("fishing_bait", fiOld);
  delete_variable("bait");
}
if (get_variable("fishing_bait") === null || get_variable("fishing_bait") === undefined) set_variable("fishing_bait", "");
// Tell the party "Ding fish!" on a new yearly record.
if (!get_variable("fishing_ding")) set_variable("fishing_ding", "on");
// Bait the hook again after landing a fish (FISHING REBAIT); off unless chosen.
if (!get_variable("fishing_rebait")) set_variable("fishing_rebait", "off");
