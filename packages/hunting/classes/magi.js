// Magi: F-keys, battlerage costs and attack lines for hunting.
// See classes/README.md for the format. Only this file changes when the
// game rewords an attack or a key needs moving.
HU.classes["Magi"] = {
  // Main attacks for F1: HUNTING MAIN picks one, and adds more in game.
  mains: {
    staff: ["Staff", "queue add e!wu!t!p staff cast {staff} at @tar"]
  },
  keys: [
    ["{main}", ""],
    ["Windlash", huQ + "cast windlash at @tar"],
    ["Squeeze", huQ + "cast squeeze @tar"],
    ["Disintegrate", huQ + "cast disintegrate at @tar"],
    ["Firefall", huQ + "cast firefall at @tar"],
    ["Stormbolt", huQ + "cast stormbolt at @tar"],
    ["Dilation", huQ + "cast dilation at @tar"],
    ["Flood", "queue add e cast flood"],
    ["{stats}", ""],
    ["Diag", "diagnose"],
    ["Reflection", "queue add e!wu!t!p cast reflection at me"],
    ["Shield", "touch shield"]
  ],
  rage: { Windlash: 14, Dilation: 35, Disintegrate: 17, Squeeze: 36, Firefall: 25, Stormbolt: 25 },
  lines: [
    [/^As you point an elemental staff at (.*), a scintilla of bright, burning light shoots out, striking (\w+) with focused elemental power\.$/, "STAFF"],
    [/^You draw upon the power of air to summon sharp gusts of wind which begin to whip across (.*)'s exposed flesh\.$/, "WINDLASH", "Windlash"],
    [/^You raise a clenched fist and in obedience the earth rises in turn, a great hand of stone unfurling to clamp about (.*) in a vice-like squeeze\.$/, "SQUEEZE", "Squeeze"],
    [/^You raise your hands dramatically and summon a mighty flaming rock from the sky down at (.*), but (\w+) dodges aside and is only dealt a glancing blow\.$/, "FIREFALL", "Firefall"],
    [/^You summon a whirlwind of flame around (.*) which consumes (\w+) translucent shield\.$/, "DISINTEGRATE", "Disintegrate"],
    [/^A bolt of lightning roars out from your hands as you cast a powerful spell at (.*), inciting sensitive nerves across (\w+) skin\.$/, "STORMBOLT", "Stormbolt"],
    [/^You raise your hands dramatically and summon a mighty flaming rock from the sky that slams into the clumsy form of (.*)\.$/, "FIREFALL++", "Firefall"],
    [/^You point an elemental staff at (.*) and (\w+) screams in pain as (\w+) skin begins to freeze and crack\.$/, "STAFF"]
  ]
};
