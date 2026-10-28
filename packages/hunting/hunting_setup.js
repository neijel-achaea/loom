// hunting_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, one-time migration, defaults.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.hunting) client.loom.hunting = {};
client.loom.registry.hunting = { version: "1.2.1", keyword: "HUNTING", desc: "{{description}}" };

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
// Class toggles' state (sneak, weave...): { name: "on" | "off" }, kept
// across HUNTING BUTTONS and RESET; onLoad sets them all OFF.
// PK MODE (#342, early: Ricardo 2026-10-28). Your own PvP keys per class,
// saved as hunting_pk {Class: {"1".."12": [label, command]}}; HUNTING PK SET
// fills them. HU.pk (on/off) is never remembered: every load starts in the
// hunting layout. Keys you didn't set keep their hunting key. Ctrl+F12 (the
// package's keybind) and HUNTING PK switch. PK keys are never lit.
HU.pk = false;
if (client.loom.loom && client.loom.loom.themeSetPk) client.loom.loom.themeSetPk(false);
HU.pkKeys = {};
try { HU.pkKeys = JSON.parse(get_variable("hunting_pk") || "{}") || {}; } catch (e) { HU.pkKeys = {}; }
if (typeof HU.pkKeys != "object" || Array.isArray(HU.pkKeys)) HU.pkKeys = {};
HU.pkSave = function () {
  var any = false;
  for (var c in HU.pkKeys) { if (HU.pkKeys.hasOwnProperty(c)) { var n = 0; for (var k in HU.pkKeys[c]) if (HU.pkKeys[c].hasOwnProperty(k)) n++; if (n) any = true; else delete HU.pkKeys[c]; } }
  try { if (any) set_variable("hunting_pk", JSON.stringify(HU.pkKeys)); else delete_variable("hunting_pk"); } catch (e) {}
};
HU.pkFor = function (cls) { var t = HU.pkKeys[cls || HU.cls]; return (t && typeof t == "object") ? t : {}; };
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

// Command sent when dragonform rises or falls: nothing until HUNTING AFTERFORM
// sets one. Profiles from before 0.2 were given INITDEF here, the old
// defences package's alias; it no longer exists (DEFCON needs nothing on a
// class change), so a stored INITDEF is cleared, once, with a notice.
var huAf = get_variable("hunting_after_form");
if (huAf === null || huAf === undefined) set_variable("hunting_after_form", "");
else if (String(huAf).trim().toLowerCase() === "initdef") {
  set_variable("hunting_after_form", "");
  display_notice("[hunting] the after-dragonform command was INITDEF, from the old defences package: cleared. HUNTING AFTERFORM <command> sets another.", "cyan");
}
// DEFCON UP and AUTOUP were removed before 1.0 (#137): a stored DEFCON UP
// would now be an unknown command, so it becomes DEFCON INIT, once (#385).
else if (/^\s*defcon\s+up\s*$/i.test(String(huAf))) {
  set_variable("hunting_after_form", "DEFCON INIT");
  display_notice("[hunting] the after-dragonform command was DEFCON UP, now called DEFCON INIT: changed.", "cyan");
}

if (!get_variable("hunting_dragon_mode")) set_variable("hunting_dragon_mode", "auto");
if (!get_variable("hunting_dragon_attack")) set_variable("hunting_dragon_attack", "gut");
if (!get_variable("hunting_autogold")) set_variable("hunting_autogold", "off");
var huPt = get_variable("hunting_party_target");
if (huPt === null || huPt === undefined) set_variable("hunting_party_target", "");
