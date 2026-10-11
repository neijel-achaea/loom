// hunting_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, one-time migration, defaults.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.hunting) client.loom.hunting = {};
client.loom.registry.hunting = { version: "0.4.15", keyword: "HUNTING", desc: "{{description}}" };

var HU = client.loom.hunting;

// Per-class tables (classes/*.js): F-keys, battlerage costs, attack lines.
// Session data, rebuilt on every load. HU.costs is the current class's costs,
// set below and by hunting_buttons on each class change.
run_function("hunting_classes", [], "hunting");
// Colour of tagged attack lines.
HU.lineFg = "#d8f37e";
HU.lineBg = "#000000";
// Rage state: cooldowns per ability (current class only: cleared on every
// class change), F-key slot per ability, the global battlerage cooldown,
// current rage.
if (!HU.cd) HU.cd = {};
if (!HU.slots) HU.slots = {};
if (HU.glob === undefined) HU.glob = true;
// Main attack chosen per class (HUNTING MAIN), and the ones added in game:
// { "Psion": "overhand" }, { "Psion": { "deathblow": "weave deathblow @tar" } }.
if (!HU.mains) {
  HU.mains = {};
  try { HU.mains = JSON.parse(get_variable("hunting_mains") || "{}") || {}; } catch (e) { HU.mains = {}; }
}
if (!HU.mainsAdded) {
  HU.mainsAdded = {};
  try { HU.mainsAdded = JSON.parse(get_variable("hunting_mains_added") || "{}") || {}; } catch (e) { HU.mainsAdded = {}; }
}
// Class toggles' state (sneak, weave...): { name: "on" | "off" }, kept so a
// reload remembers it.
if (!HU.toggles) {
  HU.toggles = {};
  try { HU.toggles = JSON.parse(get_variable("hunting_toggles") || "{}") || {}; } catch (e) { HU.toggles = {}; }
}
if (HU.rage === undefined) HU.rage = 0;

// Class: followed from GMCP in onGMCP, and kept in hunting_class because the
// game sends Char.Status only at login and on a change. The first time,
// loom's old activeClass seeds it (read only).
if (!HU.cls) HU.cls = get_variable("hunting_class") || get_variable("activeClass") || "";
if (HU.cls && !get_variable("hunting_class")) set_variable("hunting_class", HU.cls);
HU.costs = (HU.classes[HU.cls] && HU.classes[HU.cls].rage) || {};

// One-time migration from the pre-0.2 names: copy when the new one is unset,
// then clear the old one.
var huOld = ["dragonMode", "dragonAttack", "autogold"];
var huNew = ["hunting_dragon_mode", "hunting_dragon_attack", "hunting_autogold"];
var huLegacy = false;
for (var huI = 0; huI < huOld.length; huI++) {
  var huOv = get_variable(huOld[huI]);
  if (huOv === null || huOv === undefined || huOv === "") continue;
  huLegacy = true;
  var huNv = get_variable(huNew[huI]);
  if (huNv === null || huNv === undefined || huNv === "") set_variable(huNew[huI], huOv);
  delete_variable(huOld[huI]);
}
var huGone = ["rage_costs", "rage_slots", "rage_cd", "rage_global"];
for (var huJ = 0; huJ < huGone.length; huJ++) {
  var huGv = get_variable(huGone[huJ]);
  if (huGv !== null && huGv !== undefined) { huLegacy = true; delete_variable(huGone[huJ]); }
}

// Command sent when dragonform rises or falls. A profile that used hunting
// before 0.2 always sent INITDEF there, so it keeps doing so; a fresh profile
// sends nothing until HUNTING AFTERFORM sets one.
var huAf = get_variable("hunting_after_form");
if (huAf === null || huAf === undefined) set_variable("hunting_after_form", huLegacy ? "initdef" : "");

if (!get_variable("hunting_dragon_mode")) set_variable("hunting_dragon_mode", "auto");
if (!get_variable("hunting_dragon_attack")) set_variable("hunting_dragon_attack", "gut");
if (!get_variable("hunting_autogold")) set_variable("hunting_autogold", "off");
var huPt = get_variable("hunting_party_target");
if (huPt === null || huPt === undefined) set_variable("hunting_party_target", "");
