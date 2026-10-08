// defcon_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, class tables, defaults.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.defcon) client.loom.defcon = {};
client.loom.registry.defcon = { version: "0.2.0", keyword: "DEFCON" };

var D = client.loom.defcon;

// Per class:
//   up   -- commands DEFCON UP sends for this class, before the common ones
//   defs -- [defence, tier, curing priority, relax?]. A defence is kept up at
//           DEFCON n when its tier >= n. "relax" defences are also dropped
//           (RELAX <def>) when the level no longer wants them.
// A class missing here gets D.generic for its defences and only D.common
// for DEFCON UP.
D.classes = {
  "Druid": {
    up: ["morph wyvern", "queue add eq embrace spirit", "queue add equilibrium summon fire", "flail staff"],
    defs: [["alertness", 1, 10, true], ["vigilance", 1, 10, true], ["hypersight", 1, 9, true], ["telesense", 1, 10, true], ["metawake", 1, 9, true], ["mass", 2, 8], ["rebounding", 2, 2], ["heldbreath", 2, 20], ["fangbarrier", 3, 8], ["deafness", 3, 4], ["blindness", 3, 4], ["temperance", 3, 12], ["vitality", 3, 7], ["curseward", 2, 9], ["kola", 3, 3], ["levitating", 3, 15], ["speed", 3, 5], ["harmony", 3, 11], ["poisonresist", 3, 8], ["nightsight", 4, 13], ["deathsight", 4, 18], ["thirdeye", 4, 5], ["insomnia", 2, 6], ["selfishness", 2, 17], ["mindseye", 5, 1]]
  },
  "Magi": {
    up: ["queue add eq simultaneity", "wield staff"],
    defs: [["alertness", 1, 10, true], ["vigilance", 1, 10, true], ["hypersight", 1, 9, true], ["telesense", 1, 10, true], ["metawake", 1, 9, true], ["mass", 2, 8], ["rebounding", 2, 2], ["heldbreath", 2, 20], ["fangbarrier", 3, 8], ["deafness", 3, 4], ["blindness", 3, 4], ["curseward", 2, 9], ["kola", 3, 3], ["levitating", 3, 15], ["speed", 3, 5], ["poisonresist", 3, 8], ["insulation", 3, 8], ["nightsight", 4, 13], ["deathsight", 4, 18], ["thirdeye", 4, 5], ["insomnia", 2, 6], ["selfishness", 2, 17], ["mindseye", 5, 1], ["stoneskin", 4, 10], ["diamondskin", 4, 10], ["stonefist", 3, 11, true], ["chargeshield", 3, 15], ["temperance", 3, 8]]
  },
  "Sylvan": {
    up: [],
    defs: [["alertness", 1, 10, true], ["vigilance", 1, 10, true], ["hypersight", 1, 9, true], ["telesense", 1, 10, true], ["metawake", 1, 9, true], ["mass", 2, 8], ["rebounding", 2, 2], ["heldbreath", 2, 20], ["fangbarrier", 3, 8], ["deafness", 3, 4], ["blindness", 3, 4], ["curseward", 2, 9], ["kola", 3, 3], ["levitating", 3, 15], ["speed", 3, 5], ["poisonresist", 3, 8], ["nightsight", 4, 13], ["deathsight", 4, 18], ["thirdeye", 4, 5], ["insomnia", 2, 6], ["selfishness", 2, 17], ["mindseye", 5, 1], ["barkskin", 3, 10], ["temperance", 3, 8]]
  },
  "Dragon": {
    up: ["dragonarmour"],
    defs: [["alertness", 1, 10, true], ["vigilance", 1, 10, true], ["hypersight", 1, 9, true], ["telesense", 1, 10, true], ["metawake", 1, 9, true], ["mass", 2, 8], ["rebounding", 1, 2], ["heldbreath", 2, 20], ["fangbarrier", 4, 8], ["deafness", 4, 4], ["blindness", 4, 4], ["curseward", 1, 9], ["kola", 4, 3], ["levitating", 4, 15], ["speed", 4, 5], ["poisonresist", 4, 8], ["insulation", 3, 8], ["nightsight", 5, 13], ["deathsight", 5, 18], ["thirdeye", 5, 5], ["insomnia", 2, 6], ["selfishness", 2, 17], ["mindseye", 5, 1], ["dragonbreath", 4, 10], ["dragonarmour", 3, 5, true], ["temperance", 3, 8]]
  }
};
// Every dragon colour shares the dragonform table.
D.alias = { "Black Dragon": "Dragon", "Blue Dragon": "Dragon", "Red Dragon": "Dragon", "Green Dragon": "Dragon", "Silver Dragon": "Dragon", "Gold Dragon": "Dragon" };

// Sent by DEFCON UP for every class, after the class's own commands.
D.common = ["selfishness", "avoid physical", "insomnia"];

// Defences for a class with no table yet: the general ones every class above shares.
D.generic = [["alertness", 1, 10, true], ["vigilance", 1, 10, true], ["hypersight", 1, 9, true], ["telesense", 1, 10, true], ["metawake", 1, 9, true], ["mass", 2, 8], ["rebounding", 2, 2], ["heldbreath", 2, 20], ["fangbarrier", 3, 8], ["deafness", 3, 4], ["blindness", 3, 4], ["curseward", 2, 9], ["kola", 3, 3], ["levitating", 3, 15], ["speed", 3, 5], ["poisonresist", 3, 8], ["nightsight", 4, 13], ["deathsight", 4, 18], ["thirdeye", 4, 5], ["insomnia", 2, 6], ["selfishness", 2, 17], ["mindseye", 5, 1], ["temperance", 3, 8]];

if (!D.queue) D.queue = [];

// Class: followed from GMCP in onGMCP. Until the first Char.Status of the
// session arrives, borrow the legacy shared variable if a package still sets it.
if (!D.cls && get_variable("activeClass")) D.cls = get_variable("activeClass");

// DEFCON UP on the first class message of each session (the old package sent
// INITDEF on every load). On unless switched off.
if (!get_variable("defcon_autoup")) set_variable("defcon_autoup", "on");
