// Bard: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
// Cooldowns (for reference; the game's messages drive them): Moulinet 16s,
// Howlslash 23s, Cyclone 23s, Trill 41s, Charm 43s, Provoke 20s.
// Class condition (charstats, for self): Voice (Yes/No).
HU.classes["Bard"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    jab: ["Jab", "queue add b!wu!t!p blade jab @tar torso"]
  },
  keys: [
    ["{main}", ""],
    ["Moulinet", huQ + "moulinet @tar"],
    ["Howlslash", huQ + "howlslash @tar"],
    ["Resonance", huQ + "play resonance at @tar"],
    ["Cyclone", huQ + "cyclone @tar"],
    ["Trill", huQ + "play trill at @tar"],
    ["Charm", huQ + "play charm at @tar"],
    ["", ""],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["", ""],
    ["Shield", "touch shield"]
  ],
  rage: { Moulinet: 14, Howlslash: 36, Resonance: 17, Cyclone: 25, Trill: 28, Charm: 32, Provoke: 32 },
  // Past level 35 (#149): Cyclone, plain and CYCLONE++ (target clumsy or
  // stunned), Charm, Provoke.
  lines: [
    [/^You dart out (.*) in a lightning-fast jab to the (\w+) of (.*)\.$/, "JAB"],
    [/^You twist your wrist swiftly, slicing (.*) with a long slash of your sweeping blade\.$/, "MOULINET", "Moulinet"],
    [/^You use your powerful voice to distract (.*) with a ululating howl before stepping in with a vicious slash\.$/, "HOWLSLASH", "Howlslash"],
    [/^You hum a low note at (.*), causing (\w+) translucent shield to shatter as it resonates with the power of your voice\.$/, "RESONANCE", "Resonance"],
    [/^You direct your voice in a high-pitched trill at (.*), dazing (\w+)\.$/, "TRILL", "Trill"]
  ]
};
