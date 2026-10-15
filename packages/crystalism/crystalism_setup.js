// crystalism_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, defaults.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.crystalism) client.loom.crystalism = {};
client.loom.registry.crystalism = { version: "0.3.0", keyword: "CRYSTALISM", desc: "{{description}}" };
var CR = client.loom.crystalism;

CR.shapes = ["cube", "cylinder", "diamond", "disc", "egg", "pentagon", "polyhedron", "pyramid", "sphere", "spiral", "torus"];
CR.hardCap = 200;         // most crystals refined in one run
CR.maxPerCommand = 10;    // REFINE takes at most this many at once
CR.facetsPerCrystal = 1;
if (!CR.state) CR.state = "idle";
if (!CR.queue) CR.queue = [];
// Crystals in the rift per shape, as last read by CRYSTALISM REFINE's IR
// CRYSTAL; saved (crystalism_rift), so a reload doesn't forget them.
if (!CR.rift || !Object.keys(CR.rift).length) {
  try { CR.rift = JSON.parse(get_variable("crystalism_rift") || "{}") || {}; } catch (e) { CR.rift = {}; }
}
// Minimum stock per shape (#44, Ricardo: as harvesting's): crystalism_min =
// { torus: 80 }, any other shape at crystalism_default_min.
try { CR.min = JSON.parse(get_variable("crystalism_min") || "{}") || {}; } catch (e) { CR.min = {}; }
if (!to_number(get_variable("crystalism_default_min"))) set_variable("crystalism_default_min", 50);
CR.defMin = to_number(get_variable("crystalism_default_min"));
CR.facetsPerPearl = 9;
// The read-only look other packages see through loom (#159, #44).
//   look.levels() -> [{ shape, have, min }] for every shape with a count
//     read from the rift; empty when none has been read yet.
CR.look = {
  levels: function () {
    var out = [];
    for (var i = 0; i < CR.shapes.length; i++) {
      var s = CR.shapes[i];
      if (CR.rift[s] === undefined || CR.rift[s] === null) continue;
      out.push({ shape: s, have: CR.rift[s], min: (CR.min[s] != null ? CR.min[s] : CR.defMin) });
    }
    return out;
  }
};

// The pre-0.2 autorefine kept its state on window.nj.ar.
if (window.nj && window.nj.ar) window.nj.ar = null;

if (!get_variable("crystalism_pearls")) set_variable("crystalism_pearls", "on");
if (!get_variable("crystalism_portal")) set_variable("crystalism_portal", "off");
