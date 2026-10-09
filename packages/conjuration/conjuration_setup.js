// conjuration_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, the recipes and the
// ouroboros setting.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.conjuration) client.loom.conjuration = {};
client.loom.registry.conjuration = { version: "0.2.0", keyword: "CONJURATION" };
var CJ = client.loom.conjuration;

// Every sigil and conjured item, by the word typed. Those with a recipe can
// be made: reagents taken out of the rift ([count, reagent]) and put in the
// ouroboros, then the chant, three times. Add a recipe as you learn one.
CJ.sigils = {
  bauble: { name: "a scented bauble" },
  brooch: { name: "a brooch of Thoth" },
  comprehension: { name: "a necklace of comprehension" },
  concealment: { name: "an orb of concealment" },
  cube: { name: "a vibration-dampening cube" },
  dreamcatcher: { name: "a dreamcatcher" },
  eye: { name: "an eye sigil" },
  fist: { name: "a fist sigil", reagents: [[1, "silver"], [2, "horn"]], chant: "fartak ishla spooz tran" },
  flame: { name: "a flame sigil", reagents: [[1, "silver"]], chant: "flet lhar abe minlo eec" },
  key: { name: "a key sigil" },
  monolith: { name: "a monolith sigil" },
  mushroom: { name: "a mushroom sigil" },
  negation: { name: "a gem of negation" },
  orb: { name: "a chaos-destroying orb" },
  pestilence: { name: "a ring of pestilence" },
  star: { name: "a star sigil" },
  stasis: { name: "a bag of stasis" },
  whirlwind: { name: "a whirlwind of Vastar" }
};

// The ouroboros the ritual is performed in, by its number (conjuration_ouroboros).
if (CJ.ouroboros === undefined) {
  var cjO;
  try { cjO = get_variable("conjuration_ouroboros"); } catch (e) { cjO = undefined; }
  CJ.ouroboros = (cjO && ("" + cjO) !== "undefined") ? ("" + cjO) : "";
}
