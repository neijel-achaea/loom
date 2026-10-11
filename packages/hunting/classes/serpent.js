// Serpent: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Thrash 16s,
// Throatrip 23s, Snare 23s. Flagellate and Obliviate: not given.
// Class condition (charstats, for self): Venom.
HU.classes["Serpent"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    garrote: ["Garrote", "queue add b!wu!t!p garrote @tar"]
  },
  keys: [
    ["{main}", ""],
    ["Thrash", huQ + "thrash @tar"],
    ["Throatrip", huQ + "throatrip @tar"],
    ["Excoriate", huQ + "excoriate @tar"],
    ["Snare", huQ + "snare @tar"],
    ["Flagellate", huQ + "flagellate @tar"],
    ["Obliviate", huQ + "obliviate @tar"],
    ["{toggle:sneak}", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["{toggle:weave}", ""],
    ["Shield", "touch shield"]
  ],
  // From Ricardo's subterfuge package (Rienest). Sneak hides and cloaks, and
  // re-conjures the cloak when the shroud drops while sneaking.
  toggles: {
    sneak: { label: "Sneak", on: ["hide", "conjure cloak"], off: ["emerge", "dispel self"],
             renew: [/^Your shroud dissipates and you return to the realm of perception\.$/, "conjure cloak"] },
    weave: { label: "Weave", on: ["weaving on"], off: ["weaving off"] }
  },
  // No Provoke listed for Serpent: if the class has it, add its cost to rage
  // (the line itself is shared, in hunting_classes.js).
  rage: { Thrash: 14, Throatrip: 36, Excoriate: 17, Snare: 25, Flagellate: 25, Obliviate: 28 },
  // To capture (#31): Garrote; Thrash; Throatrip; Excoriate (on a shielded
  // target); Snare, plain and SNARE++ (target reckless or inhibited);
  // Flagellate; Obliviate.
  lines: [
  ]
};
