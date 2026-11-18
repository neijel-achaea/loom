// hunting_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, one-time migration, defaults.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.hunting) client.loom.hunting = {};
client.loom.registry.hunting = { version: "1.4.1", keyword: "HUNTING", desc: "{{description}}" };

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
// Auto-parry (#484, HUNTING PARRY ON): the game's limb-damage line names the
// limb a blow hurt ("...you perceive that he has dealt 30.0% damage to your
// left leg."); the class's parry command (e.g. CLAWPARRY) guards the limb
// that has taken the most damage lately. Ricardo's wade log (2026-11-15): 15
// of 16 blows on the parried leg were parried ("You parry the assault to your
// right leg with a deft manoeuvre."); instant breaks ("...breaks with a loud
// crack.") and skull fractures went through, so only the damage line counts.
// The limb being parried is tracked from the game's confirmation, not from the
// defence list (#486: switching leaves the old one in GMCP).
HU.LIMBS = { "head": "head", "torso": "torso", "left arm": "leftarm", "right arm": "rightarm", "left leg": "leftleg", "right leg": "rightleg" };
if (HU.parryLimb === undefined) HU.parryLimb = "";  // the limb the game says you parry ("left leg"), "" none known
if (!HU.parryDmg) HU.parryDmg = {};                // { "left leg": [[pct, at], ...] }
HU.parrySent = HU.parrySent || null;               // { limb, at }: a parry sent, not yet confirmed
HU.parryWindowMs = 60000;  // damage older than this no longer counts
HU.parryWaitMs = 2000;     // a parry sent and not confirmed by then may be sent again
// The class's parry command, with @limb for the game's limb word, or "".
HU.parryCmd = function () { var e = HU.classes && HU.classes[HU.cls]; return (e && e.parry) || ""; };
// Damage a limb has taken in the window, in percent.
HU.parryHurt = function (limb) {
  var l = HU.parryDmg[limb] || [], now = new Date().getTime(), sum = 0, keep = [];
  for (var i = 0; i < l.length; i++) if (now - l[i][1] < HU.parryWindowMs) { sum += l[i][0]; keep.push(l[i]); }
  HU.parryDmg[limb] = keep;
  return sum;
};
// After a blow (pct on limb): parry the most-hurt limb, switching only when it
// leads the one parried by at least a blow's worth, so a mob splitting its
// blows between two limbs can't flip the parry on every hit.
HU.parryPick = function (pct) {
  var cmd = HU.parryCmd();
  if (get_variable("hunting_parry") != "on" || !cmd || get_variable("pauseTriggers") == "on") return;
  var best = "", bestD = 0;
  for (var limb in HU.LIMBS) {
    if (!HU.LIMBS.hasOwnProperty(limb)) continue;
    var d = HU.parryHurt(limb);
    if (d > bestD) { best = limb; bestD = d; }
  }
  if (!best || best === HU.parryLimb) return;
  if (HU.parryLimb && bestD - HU.parryHurt(HU.parryLimb) < pct) return;
  var now = new Date().getTime();
  if (HU.parrySent && now - HU.parrySent.at < HU.parryWaitMs) return;
  send_command(cmd.replace(/@limb\b/g, HU.LIMBS[best]), 1);
  HU.parrySent = { limb: best, at: now };
  if (get_variable("debug") == "on") display_notice("[debug][hunting] parry " + best + " (" + bestD + "% lately)", "cyan");
};
// The lines (one trigger): damage, the game's confirmation, a parried blow, a
// limb restored.
HU.parryLine = function (line) {
  var L = "(head|torso|left arm|right arm|left leg|right leg)";
  var m = new RegExp("you perceive that .+ dealt ([\\d.]+)% damage to your " + L + "\\.$").exec(line);
  if (m) {
    var pct = parseFloat(m[1]) || 0;
    if (!HU.parryDmg[m[2]]) HU.parryDmg[m[2]] = [];
    HU.parryDmg[m[2]].push([pct, new Date().getTime()]);
    HU.parryPick(pct);
    return;
  }
  m = new RegExp("^(?:You will now attempt to parry attacks to your " + L + "|You parry the assault to your " + L + " with a deft manoeuvre)\\.$").exec(line);
  if (m) { HU.parryLimb = m[1] || m[2]; HU.parrySent = null; return; }
  m = new RegExp("^Your " + L + " feels stronger and healthier\\.$").exec(line);
  if (m) HU.parryDmg[m[1]] = [];
};

// Autogold's pickup (hunting_gold): { at, sent, tries, retry } while gold is
// waiting for you, null once picked up or gone.
if (HU.gold === undefined) HU.gold = null;
HU.otherKillMs = 3000; // after someone else's kill, experience doesn't arm autogold
HU.goldWaitMs = 100;   // the pickup waits this long for a ripple's end
HU.goldMs = 20000;     // gold not picked up by then is given up
HU.goldTries = 3;      // pickups sent at most, retries included
HU.goldSend = function () {
  var g = HU.gold;
  if (!g || get_variable("pauseTriggers") == "on") return;
  if (new Date().getTime() - g.at > HU.goldMs || g.tries >= HU.goldTries) { HU.gold = null; return; }
  g.tries++; g.sent = new Date().getTime(); g.retry = false;
  send_command("queue add be get gold", 1);
  var pack = (client.loom.security && client.loom.security.backpack) || get_variable("backpack");
  if (pack) send_command("queue add be put gold in " + pack, 1);
};
// The lines around a pickup (one trigger, hunting's autogold group).
HU.goldLine = function (line) {
  var g = HU.gold;
  if (/^You have gained \d+ experience\.$/.test(line)) {
    // Your kill's experience arms autogold (a kill line can go unseen, e.g.
    // devoid of senses), but not experience shared from another's kill.
    var now = new Date().getTime();
    if (!HU.otherKill || now - HU.otherKill > HU.otherKillMs) HU.kill = now;
    return;
  }
  if (!g) return;
  if (line === "Wading the Mnemosyne.") {
    // The ripple ended with the kill: the gold stayed behind.
    if (!g.sent) HU.gold = null;
  } else if (/^(?:You pick up \d+ gold sovereigns?|I see no "gold" to take)\.$/.test(line)) {
    HU.gold = null;
  } else if (/^(?:You are too stunned to be able to do anything|Paralysed as you are, your body is not able to pick up anything)\.$/.test(line)) {
    if (g.sent) g.retry = true;
  } else if (/^(?:You are no longer stunned|Your muscles unlock; you are no longer paralysed)\.$/.test(line)) {
    if (g.retry) HU.goldSend();
  }
};

HU.pkSave = function () {
  var any = false;
  for (var c in HU.pkKeys) { if (HU.pkKeys.hasOwnProperty(c)) { var n = 0; for (var k in HU.pkKeys[c]) if (HU.pkKeys[c].hasOwnProperty(k)) n++; if (n) any = true; else delete HU.pkKeys[c]; } }
  try { if (any) set_variable("hunting_pk", JSON.stringify(HU.pkKeys)); else delete_variable("hunting_pk"); } catch (e) {}
};
// PK MODE's numpad (Ricardo, 2026-11-08): Ctrl+numpad <n> (the package's
// keybinds) sends the class's pkPad command for n, only in PK MODE; @tar is
// your target. Classes with no pkPad (lesserform too) do nothing.
HU.pkPad = function (n) {
  var e = HU.classes[HU.cls] || {};
  var c = e.pkPad && e.pkPad[String(n)];
  if (!c) return;
  if (!HU.pk) { display_notice("[hunting] Ctrl+numpad " + n + " is a PK key: PK MODE is off (Ctrl+F12 or HUNTING PK).", "orange"); return; }
  var tar = String(get_variable("tar") || "").trim();
  if (!tar) { display_notice("[hunting] no target for Ctrl+numpad " + n + " (ST <name>).", "orange"); return; }
  send_command(String(c).replace(/@tar\b/gi, tar));
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
if (!get_variable("hunting_parry")) set_variable("hunting_parry", "off");
var huPt = get_variable("hunting_party_target");
if (huPt === null || huPt === undefined) set_variable("hunting_party_target", "");
