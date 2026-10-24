// fishing_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.fishing) client.loom.fishing = {};
client.loom.registry.fishing = { version: "1.0.0", keyword: "FISHING", desc: "{{description}}" };

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
// The hook is bare (a fish landed, or the line snapped): drop anything still
// waiting, and with FISHING REBAIT ON bait it again on balance, so the next CL
// only casts; the game's "You carefully thread …" line then marks it baited.
// Always says which, so the rebait can be followed. Never casts.
FI.bare = function (why) {
  FI.cancel();
  FI.baited = false;
  FI.rebaiting = false;
  var bait = get_variable("fishing_bait");
  if (get_variable("fishing_rebait") !== "on") {
    display_notice("[fishing] hook bare (" + why + "); REBAIT is off, so CL will bait it.", "cyan");
  } else if (!bait) {
    display_notice("[fishing] hook bare (" + why + "); not re-baiting: no bait set (FISHING BAIT <bait>).", "orange");
  } else if (get_variable("pauseTriggers") === "on") {
    display_notice("[fishing] hook bare (" + why + "); paused (LOOM PAUSE): not re-baiting.", "orange");
  } else {
    send_command("queue add bal bait hook with " + bait);
    FI.rebaiting = true;
    display_notice("[fishing] hook bare (" + why + "); re-baiting with " + bait + " on balance.", "lime");
  }
};
// Bait the hook again after landing a fish (FISHING REBAIT); off unless chosen.
if (!get_variable("fishing_rebait")) set_variable("fishing_rebait", "off");
