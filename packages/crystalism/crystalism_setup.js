// crystalism_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, defaults.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.crystalism) client.loom.crystalism = {};
client.loom.registry.crystalism = { version: "0.2.1", keyword: "CRYSTALISM", desc: "{{description}}" };
var CR = client.loom.crystalism;

CR.shapes = ["cube", "cylinder", "diamond", "disc", "egg", "pentagon", "polyhedron", "pyramid", "sphere", "spiral", "torus"];
CR.hardCap = 200;         // most crystals refined in one run
CR.maxPerCommand = 10;    // REFINE takes at most this many at once
CR.facetsPerCrystal = 1;
if (!CR.state) CR.state = "idle";
if (!CR.queue) CR.queue = [];
if (!CR.rift) CR.rift = {};

// The pre-0.2 autorefine kept its state on window.nj.ar.
if (window.nj && window.nj.ar) window.nj.ar = null;

if (!get_variable("crystalism_pearls")) set_variable("crystalism_pearls", "on");
if (!get_variable("crystalism_portal")) set_variable("crystalism_portal", "off");
