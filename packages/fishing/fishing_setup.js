// fishing_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.fishing) client.loom.fishing = {};
client.loom.registry.fishing = { version: "0.2.4", keyword: "FISHING", desc: "{{description}}" };

// One-time migration: bait -> fishing_bait.
var fiOld = get_variable("bait");
if (fiOld !== null && fiOld !== undefined) {
  if (!get_variable("fishing_bait")) set_variable("fishing_bait", fiOld);
  delete_variable("bait");
}
if (get_variable("fishing_bait") === null || get_variable("fishing_bait") === undefined) set_variable("fishing_bait", "");
// Tell the party "Ding fish!" on a new yearly record.
if (!get_variable("fishing_ding")) set_variable("fishing_ding", "on");
// Delayed sends (tease, jerk, reel) go through FI.later, so FI.cancel can drop
// the ones still waiting when the line comes in by hand. Helpers are rebuilt
// every run; only the timers' list is kept.
var FI = client.loom.fishing;
FI.timers = FI.timers || [];
FI.later = function (cmd, ms) {
  var t = setTimeout(function () {
    FI.timers = FI.timers.filter(function (x) { return x !== t; });
    send_command(cmd);
  }, ms);
  FI.timers.push(t);
};
FI.cancel = function () {
  for (var i = 0; i < FI.timers.length; i++) clearTimeout(FI.timers[i]);
  FI.timers = [];
};
// Bait the hook again after landing a fish (FISHING REBAIT); off unless chosen.
if (!get_variable("fishing_rebait")) set_variable("fishing_rebait", "off");
