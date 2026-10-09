// hunting_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, one-time migration, defaults.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.hunting) client.loom.hunting = {};
client.loom.registry.hunting = { version: "0.2.5", keyword: "HUNTING" };

var HU = client.loom.hunting;

// Battlerage costs for every class configured so far. Session data, not a
// variable: rebuilt here on every load.
HU.costs = {
  // Druid
  Strangle: 14, Redeem: 22, Vinecrack: 17, Ravage: 36, Sear: 25, Glare: 14,
  // Magi
  Windlash: 14, Dilation: 35, Disintegrate: 17, Squeeze: 36, Firefall: 25, Stormbolt: 25,
  // Sylvan
  Torrent: 14, Sandstorm: 29, Thornpierce: 17, Stonevine: 36, Leechroot: 25, Rockshot: 28,
  // Black Dragon
  Dragonspit: 14, Dragonsting: 25, Dissolve: 17, Override: 36, Corrode: 25, Dragonfear: 29, Provoke: 32,
  // Blue Dragon
  Dragonchill: 14, Glaciate: 26, Frostrive: 17, Frostwave: 25, Ague: 14
};
// Rage state: cooldowns per ability, F-key slot per ability, the global
// battlerage cooldown, current rage.
if (!HU.cd) HU.cd = {};
if (!HU.slots) HU.slots = {};
if (HU.glob === undefined) HU.glob = true;
if (HU.rage === undefined) HU.rage = 0;

// Class: followed from GMCP in onGMCP, and kept in hunting_class because the
// game sends Char.Status only at login and on a change. The first time,
// loom's old activeClass seeds it (read only).
if (!HU.cls) HU.cls = get_variable("hunting_class") || get_variable("activeClass") || "";
if (HU.cls && !get_variable("hunting_class")) set_variable("hunting_class", HU.cls);

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
