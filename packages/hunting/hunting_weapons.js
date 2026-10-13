// hunting_weapons -- the knights' weapon specialisations (Weaponmastery), shared
// by every class that has them: Infernal, Paladin, Runewarden, Unnamable.
// Joined after the class files by tools/build.py. A spec's attacks and lines
// are the same whichever of those classes uses it, so each is captured once
// (#31): Two Handed on the Infernal, Sword and Shield on the Runewarden, Dual
// Cutting on the Paladin, Dual Blunt on the Unnamable.
// Spec names as charstats gives them ("Spec: Two Handed").
HU.weapons = {
  "Two Handed": {
    main: "slaughter",
    mains: { slaughter: ["Slaughter", "queue add b!wu!t!p slaughter @tar"] },
    lines: [
      [/^Drawing back (.*), you unleash a flesh-mincing blow at (.*)\.$/, "SLAUGHTER"],
      [/^Lunging forward, you bring (.*) down in a savage diagonal blow, carving through (.*)'s magical shield\.$/, "CARVE"]
    ]
  },
  "Sword and Shield": {
    main: "combination",
    mains: { combination: ["Combo", "queue add b!wu!t!p combination @tar rend smash"] },
    // The combination's two hits, and Raze (the balance shieldbreak), from
    // the Runewarden.
    lines: [
      [/^You carve into (.*)'s flesh with a vicious strike, opening a bleeding wound\.$/, "REND"],
      [/^You brutally smash your shield into (.*)\.$/, "SMASH"],
      [/^You raze (.*)'s magical shield with (.*)\.$/, "RAZE"]
    ]
  },
  "Dual Cutting": {
    main: "doubleslash",
    mains: { doubleslash: ["Doubleslash", "queue add b!wu!t!p dsl @tar"] },
    // Two hits per Doubleslash, each worded one of these ways (from the
    // Paladin). They're the game's plain weapon hits, so JAB, SLASH and SWING
    // print them too: each is tagged by its wording, not as DOUBLESLASH.
    lines: [
      [/^Lightning-quick, you jab (.*) with (.*)\.$/, "JAB"],
      [/^You slash into (.*) with (.*)\.$/, "SLASH"],
      [/^You swing (.*) at (.*) with all your might\.$/, "SWING"]
    ]
  },
  "Dual Blunt": {
    main: "doublewhirl",
    mains: { doublewhirl: ["Doublewhirl", "queue add b!wu!t!p doublewhirl @tar"] },
    lines: []
  }
};
// Every class with "weapons: true" gets every spec's main attacks (after its
// own, so its own first one stays the default with no spec), the spec's
// default for F1, and every spec's lines (after its own; mostly only the
// spec you use will show, but Dual Cutting's are the plain weapon hits).
for (var hwC in HU.classes) {
  var hwE = HU.classes[hwC];
  if (!hwE.weapons) continue;
  if (!hwE.mains) hwE.mains = {};
  if (!hwE.specMain) hwE.specMain = {};
  if (!hwE.lines) hwE.lines = [];
  for (var hwS in HU.weapons) {
    var hwW = HU.weapons[hwS];
    for (var hwM in hwW.mains) { if (!hwE.mains[hwM]) hwE.mains[hwM] = hwW.mains[hwM]; }
    if (!hwE.specMain[hwS]) hwE.specMain[hwS] = hwW.main;
    hwE.lines = hwE.lines.concat(hwW.lines);
  }
}
