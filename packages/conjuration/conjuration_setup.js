// conjuration_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, the recipes and the
// ouroboros setting. A ritual under way is client.loom.conjuration.run (see
// conjuration_step).
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.conjuration) client.loom.conjuration = {};
client.loom.registry.conjuration = { version: "1.1.0", keyword: "CONJURATION", desc: "{{description}}" };
var CJ = client.loom.conjuration;

// Every sigil and conjured item, by the word typed. Those with a recipe can
// be made: reagents taken out of the rift ([count, reagent]) and put in the
// ouroboros, then the actions as the AB scroll gives them (CJ.parseActions).
// begin: what follows BEGIN CREATION OF (default "<word> sigil"); take: what
// is taken from the ouroboros at the end (default "sigil"). chant: the phrase
// for a bare action 2. Add a recipe as you learn one.
CJ.sigils = {
  bauble: { name: "a scented bauble" },
  brooch: { name: "a brooch of Thoth", begin: "brooch of thoth", take: "brooch", reagents: [[1, "ice"], [2, "dust"], [1, "horn"], [2, "silver"]], actions: 'chant "mortis troy tenkla", chant "mortis troy tenklu", chant "mortis troy tenkli", 3x6' },
  comprehension: { name: "a necklace of comprehension", begin: "necklace of comprehension", take: "necklace", reagents: [[2, "ice"], [3, "gold"], [4, "silver"], [3, "horn"]], actions: "3x10, 9, 16, 1, 2x13, 4, 9, 15" },
  concealment: { name: "an orb of concealment" },
  cube: { name: "a vibration-dampening cube" },
  dreamcatcher: { name: "a dreamcatcher" },
  eye: { name: "an eye sigil", reagents: [[1, "obsidian"]], actions: "17, 1" },
  fist: { name: "a fist sigil", reagents: [[1, "silver"], [2, "horn"]], chant: "fartak ishla spooz tran", actions: "3x2,1" },
  flame: { name: "a flame sigil", reagents: [[1, "silver"]], chant: "flet lhar abe minlo eec", actions: "3x2,1" },
  key: { name: "a key sigil", reagents: [[1, "gold"]], actions: '3xchant "krolop escit yall", 1' },
  monolith: { name: "a monolith sigil" },
  mushroom: { name: "a mushroom sigil" },
  negation: { name: "a gem of negation" },
  orb: { name: "a chaos-destroying orb" },
  pestilence: { name: "a ring of pestilence" },
  star: { name: "a star sigil" },
  stasis: { name: "a bag of stasis" },
  whirlwind: { name: "a whirlwind of Vastar" }
};

// The ritual actions by number (HELP CONJURATION): the command, and the
// game's line confirming it (a regular expression; null until someone sends
// it in, and a recipe needing it can't be run yet). Every action takes
// balance. A new line also goes into the "conjuration ritual" trigger.
CJ.acts = {
  1: { cmd: "ring bell", expect: "as you ring a small silver bell" },
  2: { cmd: "chant", expect: "^You chant, \"" },
  3: { cmd: "bang drum", expect: null },
  4: { cmd: "spin around thrice", expect: null },
  5: { cmd: "light candle", expect: null },
  6: { cmd: "clap hands", expect: "^You clap your hands quickly and suddenly\\." },
  7: { cmd: "burn the polygon", expect: null },
  8: { cmd: "point sword", expect: null },
  9: { cmd: "burn incense", expect: null },
  10: { cmd: "play horn", expect: null },
  11: { cmd: "strum lute", expect: null },
  12: { cmd: "flipcoin", expect: null },
  13: { cmd: "roll dice", expect: null },
  14: { cmd: "wave arms", expect: null },
  15: { cmd: "crush kola", expect: null },
  16: { cmd: "wave feather", expect: null },
  17: { cmd: "square the circle", expect: "^You trace a circle in the air, leaving a trail of fire behind you" }
};

// The AB scroll's actions field as steps: comma-separated; "3x6" = action 6
// three times, "9" = once, chant "words" = chant those words, 3xchant
// "words" = three times. A bare 2 chants
// the recipe's chant. {steps: [{cmd, expect, bal}]} or {err: "why"}.
CJ.parseActions = function (text, chant) {
  var out = [];
  var parts = String(text || "").match(/(?:[^,"]|"[^"]*")+/g) || [];
  if (!parts.length) return { err: "no actions" };
  for (var i = 0; i < parts.length; i++) {
    var p = parts[i].replace(/^\s+|\s+$/g, "");
    var m;
    if ((m = /^(?:(\d+)\s*x\s*)?chant\s+"([^"]+)"$/i.exec(p))) {
      var nc = m[1] ? +m[1] : 1;
      if (nc < 1 || nc > 30) return { err: "action '" + p + "' not understood" };
      for (var c = 0; c < nc; c++) out.push({ cmd: "chant " + m[2].toLowerCase(), expect: CJ.acts[2].expect, bal: true });
    } else if ((m = /^(?:(\d+)\s*x\s*)?(\d+)$/i.exec(p))) {
      var n = m[1] ? +m[1] : 1;
      var a = CJ.acts[+m[2]];
      if (!a || n < 1 || n > 30) return { err: "action '" + p + "' not understood" };
      if (!a.expect) return { err: "the game's line for " + a.cmd.toUpperCase() + " isn't known yet" };
      if (+m[2] === 2 && !chant) return { err: "action 2 needs the recipe's chant" };
      for (var k = 0; k < n; k++) out.push({ cmd: +m[2] === 2 ? "chant " + chant : a.cmd, expect: a.expect, bal: true });
    } else {
      return { err: "action '" + p + "' not understood" };
    }
  }
  return { steps: out };
};

// Selfishness, from Char.Defences (true/false; null until the game says).
// Reagents can't go into the ouroboros while it's up, so the ritual sends
// GENEROSITY first and SELFISHNESS again once they're in.
if (CJ.selfish === undefined) CJ.selfish = (client.loom.security && typeof client.loom.security.selfish == "boolean") ? client.loom.security.selfish : null;

// Have the rift (from IR COMMODITIES, {word: count}) cover the reagents?
// A reagent matches a rift entry carrying it as a whole word ("silver" is
// "silver bar", "horn" is "piece of stag's horn"). "" when it does, else why.
CJ.riftShort = function (reagents, have) {
  var miss = [];
  for (var i = 0; i < reagents.length; i++) {
    var want = reagents[i][0], word = reagents[i][1].toLowerCase(), got = 0;
    for (var k in have) {
      if (have.hasOwnProperty(k) && new RegExp("(^|\\s)" + word.replace(/[^a-z' ]/g, "") + "(\\s|$)").test(k)) got += have[k];
    }
    if (got < want) miss.push(word + " (" + got + " of " + want + ")");
  }
  return miss.length ? "not enough in the rift: " + miss.join(", ") : "";
};

// The ouroboros the reagents go into (conjuration_ouroboros), and the one
// the finished sigil is taken from (conjuration_sigil_from), by number. With
// no second number, the sigil is taken from the first.
if (CJ.ouroboros === undefined) {
  var cjO, cjF;
  try { cjO = get_variable("conjuration_ouroboros"); } catch (e) { cjO = undefined; }
  try { cjF = get_variable("conjuration_sigil_from"); } catch (e) { cjF = undefined; }
  CJ.ouroboros = (cjO && ("" + cjO) !== "undefined") ? ("" + cjO) : "";
  CJ.sigilFrom = (cjF && ("" + cjF) !== "undefined") ? ("" + cjF) : "";
}
