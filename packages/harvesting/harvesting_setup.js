// harvesting_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, migration, saved state.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.harvesting) client.loom.harvesting = {};
client.loom.registry.harvesting = { version: "0.2.2", keyword: "HARVESTING", desc: "{{description}}" };
var H = client.loom.harvesting;

// Plants that grow in each environment (GMCP Room.Info environment, lower case).
H.plants = {
  forest:                ["ginseng", "echinacea", "ginger", "burdock", "myrrh", "lobelia", "elm"],
  swamp:                 ["ash", "bellwort", "cohosh"],
  "natural underground": ["bloodroot", "irid"],
  hills:                 ["hawthorn", "bayberry"],
  jungle:                ["kuzu", "skullcap", "kola"],
  grasslands:            ["slipper", "goldenseal"],
  mountain:              ["valerian"],
  mountains:             ["valerian"],
  desert:                ["pear", "weed"],
  valley:                ["sileris"],
  freshwater:            ["kelp"],
  river:                 ["kelp"]
};

// One-time migration from the hv_* variables of harvesting 2.0, then cleared.
var hvOld = ["hv_on", "hv_min", "hv_map", "hv_stock"];
var hvNew = ["harvesting_on", "harvesting_min", "harvesting_map", "harvesting_stock"];
for (var hvI = 0; hvI < hvOld.length; hvI++) {
  var hvOv = get_variable(hvOld[hvI]);
  if (hvOv === null || hvOv === undefined) continue;
  var hvNv = get_variable(hvNew[hvI]);
  if (hvNv === null || hvNv === undefined) set_variable(hvNew[hvI], hvOv);
  delete_variable(hvOld[hvI]);
}

// Saved state. Older saves hold JSON strings; newer ones objects.
var hvMin = get_variable("harvesting_min");
var hvMap = get_variable("harvesting_map");
var hvStock = get_variable("harvesting_stock");
H.min = (typeof hvMin == "string" ? JSON.parse(hvMin) : hvMin) || {};
// Plant name -> name in the rift, where they differ. Learnt from INR lines too.
H.map = (typeof hvMap == "string" ? JSON.parse(hvMap) : hvMap) || { myrrh: "myrrh gum" };
H.stock = (typeof hvStock == "string" ? JSON.parse(hvStock) : hvStock) || {};

if (!get_variable("harvesting_on")) set_variable("harvesting_on", "off");
if (!to_number(get_variable("harvesting_default_min"))) set_variable("harvesting_default_min", 2000);
H.defMin = to_number(get_variable("harvesting_default_min"));

if (!H.queue) H.queue = [];
if (H.current === undefined) H.current = null;
if (H.here === undefined) H.here = "";
H.waitBal = false;
H.inrFor = null;
H.inRift = false;
H.dashes = 0;
if (H.quiet === undefined) H.quiet = false;
