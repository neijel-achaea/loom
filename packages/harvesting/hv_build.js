// harvesting 2.0 - builds client.hv from saved variables.
var minRaw = get_variable("hv_min");
var mapRaw = get_variable("hv_map");
var stockRaw = get_variable("hv_stock");
client.hv = {
  env: {
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
  },
  defMin: 2000,
  min:   typeof minRaw == "string" ? JSON.parse(minRaw) : (minRaw || {}),
  map:   typeof mapRaw == "string" ? JSON.parse(mapRaw) : (mapRaw || { myrrh: "myrrh gum" }),
  stock: typeof stockRaw == "string" ? JSON.parse(stockRaw) : (stockRaw || {}),
  queue: [],
  current: null,
  waitBal: false,
  inrFor: null,
  inRift: false,
  quiet: false,
  dashes: 0
};