// patrolling_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, migration, tables.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.patrolling) client.loom.patrolling = {};
client.loom.registry.patrolling = { version: "0.3.0", keyword: "PATROLLING", desc: "{{description}}" };
var P = client.loom.patrolling;

// One-time migration: patrol_last -> patrolling_last; the old session object
// on client.patrol is dropped (its ON state carries over).
var paOld = get_variable("patrol_last");
if (paOld !== null && paOld !== undefined) {
  if (!get_variable("patrolling_last")) set_variable("patrolling_last", paOld);
  delete_variable("patrol_last");
}
if (client.patrol) {
  if (client.patrol.on && !get_variable("patrolling_on")) set_variable("patrolling_on", "on");
  client.patrol = null;
}
if (!get_variable("patrolling_on")) set_variable("patrolling_on", "off");
// Clan for fire alerts, lightning reports and replanting logs; empty = none.
if (get_variable("patrolling_clan") === null || get_variable("patrolling_clan") === undefined) set_variable("patrolling_clan", "");
// Gods by stance (#164, Ricardo): patrolling_gods = { sartan: "hostile",
// gaia: "friendly" }; any god not listed is neutral. Shrines and totems of
// friendly gods aren't reported on patrol; the Here tab marks friendly and
// hostile ones. One-time migration: the old single patrolling_god becomes a
// friendly god (it only ever meant "don't flag these").
P.gods = {};
try { P.gods = JSON.parse(get_variable("patrolling_gods") || "{}") || {}; } catch (e) { P.gods = {}; }
var paOldGod = get_variable("patrolling_god");
if (paOldGod !== null && paOldGod !== undefined) {
  if (String(paOldGod).trim()) P.gods[String(paOldGod).trim().toLowerCase()] = "friendly";
  delete_variable("patrolling_god");
  set_variable("patrolling_gods", JSON.stringify(P.gods));
}
P.saveGods = function () {
  set_variable("patrolling_gods", JSON.stringify(P.gods));
  if (client.loom.notify) client.loom.notify("patrolling");
};
// The read-only look other tabs see through loom's display entry point
// (#159): what patrolling makes of an item, never its variables.
//   look.item(name) -> { kind: "shrine"|"totem", god, stance } for a shrine
//     or totem ("friendly", "hostile" or "neutral"), undefined otherwise.
//     A listed god is found as a word anywhere in the name ("a shrine of
//     Sartan", "a totem to Sartan"); god is "" when none is listed.
P.look = {
  item: function (name) {
    var n = String(name || "");
    var km = n.match(/\b(shrine|totem)\b/i);
    if (!km) return undefined;
    for (var g in P.gods) {
      if (P.gods.hasOwnProperty(g) && new RegExp("\\b" + g.replace(/[^a-z' -]/g, "") + "\\b", "i").test(n)) return { kind: km[1].toLowerCase(), god: g, stance: P.gods[g] };
    }
    return { kind: km[1].toLowerCase(), god: "", stance: "neutral" };
  }
};
if (!get_variable("patrolling_last")) set_variable("patrolling_last", {});

P.active = false;
P.gag = false;
P.present = [];
P.shrines = [];
if (!P.room) P.room = { id: "", name: "", area: "", env: "" };
P.months = ["Sarapin", "Daedalan", "Aeguary", "Miraman", "Scarlatan", "Ero", "Valnuary", "Lupar", "Phaestian", "Chronos", "Glacian", "Mayan"];

// Plants each environment should hold (GMCP environment name).
P.expected = {
  "Deep Ocean": [],
  "Reef": [],
  "Shadowscape": [],
  "Wastelands": [],
  "Water": [],
  "Ocean": ["kelp"],
  "Trees": [],
  "Ruins": [],
  "Road": [],
  "Constructed underground": [],
  "Blighted": [],
  "Hills": ["hawthorn","bayberry"],
  "Desert": ["pear","weed"],
  "Jungle": ["kola","skullcap","kuzu","fruit","cacao"],
  "Valley": ["sileris","olive"],
  "Mountains": ["valerian"],
  "Beach": [],
  "Path": [],
  "Urban": [],
  "Natural underground": ["moss","lumic","bloodroot"],
  "Garden": ["echinacea","ginger","lobelia","myrrh","ginseng","elm","fruit","vegetable"],
  "River": ["kelp"],
  "Swamp": ["cohosh","bellwort","ash"],
  "Freshwater": ["kelp"],
  "Grasslands": ["slipper","sugarcane","grain","goldenseal"],
  "Forest": ["burdock","ginseng","ginger","myrrh","echinacea","lobelia","elm","nut"]
};

// How much each area is worth patrolling (PATROLLING SUGGEST weighs by this
// and by hours since the last patrol); 0 = never suggest.
P.areas = {
  "Aalen": 10,
  "Actar Valley": 3,
  "Adryn's Keep": 3,
  "Aerinewild": 10,
  "Ageiro": 3,
  "Annwyn": 1,
  "Aran'riod": 1,
  "Arcadia": 1,
  "Asterian Peninsula": 1,
  "Aster Keep": 1,
  "Atrousian Jungle": 1,
  "Aureliana": 10,
  "Aurick Manor": 3,
  "Azdun": 3,
  "Bagwar's Copse": 3,
  "Bataoac": 1,
  "Battlesite of Mourning Pass": 1,
  "Belladona's Keep": 3,
  "Bitterfork": 3,
  "Black Forest": 10,
  "Blackrock": 3,
  "Bog": 3,
  "Boldarihm": 3,
  "Bopalopia": 1,
  "Brass Lantern Inn": 3,
  "Chaghut Encampment": 1,
  "Chapel of All Gods": 3,
  "Clockwork Isle": 3,
  "Colchis": 3,
  "Cormorant Rock": 3,
  "Creville Asylum": 3,
  "Crystal Leaf Inn": 3,
  "Dakhota Hills": 3,
  "Daoric Plains": 1,
  "Dardanic Plains": 3,
  "Darkenwood": 10,
  "Delos": 3,
  "Digsite of Blood": 3,
  "Digsite of Discord": 1,
  "Digsite of Equilibrium": 3,
  "Digsite of Husks": 3,
  "Digsite of Luck": 3,
  "Digsite of Pain": 3,
  "Digsite of Rage": 3,
  "Digsite of the Mind": 3,
  "Digsite of the Soul": 1,
  "Digsite of War": 3,
  "Digsite of Waves": 3,
  "Digsite of Wealth": 3,
  "Dreamspear": 1,
  "Dryad Gardens": 10,
  "Dun": 3,
  "Dwarven Camp": 3,
  "Eastern Ithmia": 10,
  "Eastern Reaches": 3,
  "Eastern Road": 3,
  "Eastern Shore": 3,
  "Eirenwaar": 3,
  "Enverren Marsh": 3,
  "Erymanthus": 1,
  "Fissure of Echoes": 1,
  "Fluvadha River": 1,
  "Forest Watch": 3,
  "Frozen Tundra": 1,
  "Genji": 3,
  "Ghezavat Commune": 3,
  "Goblin Village": 3,
  "Granite Hills": 3,
  "Great Rock": 3,
  "Green Lake": 3,
  "Grukai Swamp": 1,
  "Gulf of Nilakantha": 1,
  "Hriddan": 1,
  "Hthrak": 1,
  "Ilyrean Tundra": 3,
  "Inbhir Ness": 1,
  "Isaia": 1,
  "Ishana Steppes": 1,
  "Isle of Harae": 3,
  "Isolation": 1,
  "Istar Jungle": 1,
  "Istarion": 1,
  "Jaru": 3,
  "Judgement Mountain": 1,
  "Ka'doloki": 3,
  "Kamleikan": 1,
  "Karbaz": 3,
  "Lake Dakhota": 3,
  "Lake Narcisse": 3,
  "Lake Vundamere": 3,
  "Lake Xulighae": 1,
  "Luman Village": 1,
  "Mannaseh Swamp": 3,
  "Manticore Caves": 3,
  "Manusha": 3,
  "Mesmerium": 3,
  "Mhaldor Isle": 3,
  "Mhojave": 3,
  "Mines of Iskadar": 1,
  "Minos": 3,
  "Mirror Caves": 1,
  "Mnemosyne Delta": 1,
  "Mnemosyne River": 1,
  "Morindar": 1,
  "Mount Piraeus": 3,
  "Muurn Jungle/Lake": 3,
  "Mysia": 3,
  "New Hope": 3,
  "New Thera": 3,
  "Nilakantha": 1,
  "Nimick": 3,
  "Northern Ithmia": 10,
  "Northern Plains": 3,
  "Northern Scrublands": 1,
  "Northern Vashnars": 3,
  "Northreach": 10,
  "Northreach Barrows": 3,
  "Orcish Outpost": 3,
  "Pachacacha": 3,
  "Pash Valley": 3,
  "Peshwar Delta": 3,
  "Petra": 3,
  "Pherklos Ruins": 3,
  "Polyargos": 3,
  "Prin": 0,
  "Prison": 1,
  "Quartz Peak": 3,
  "Qurnok": 3,
  "Rheodad": 1,
  "Rhodestrian": 3,
  "Riagath": 1,
  "Riparium": 3,
  "Saiha'balan Grotto": 3,
  "Salt mines of Ulsyndar": 1,
  "Saoghal Valley": 1,
  "Sangre Plains": 3,
  "Sarave Foothills": 1,
  "Savannah": 3,
  "Scorpion Pit": 3,
  "Sea Lion Cove": 3,
  "Seat of Vastar": 1,
  "Shala-Khulia": 3,
  "Shala'jen-Past": 1,
  "Shala'jen-Present": 3,
  "Shamtota Hills": 3,
  "Shipwrecks Isle": 3,
  "Silverveil River": 3,
  "Siroccian Mountains": 3,
  "Sirocco Fortress": 1,
  "Southern Vashnars": 3,
  "Squall Cleft": 1,
  "Suliel": 3,
  "Sunderlands": 0, // Nothing to patrol there
  "Tapoa": 3,
  "Tasur'ke": 3,
  "Temple of the Sky": 0,
  "Thraasi Foothills": 3,
  "Tir Murann": 3,
  "Tomacula Village": 3,
  "Tower of Falaq'tor": 1,
  "Tuar": 3,
  "Ulangi": 3,
  "Umbrin": 3,
  "Urubamba": 3,
  "Valho Coast": 1,
  "Vashnars": 3,
  "Vasnari Mountains": 1,
  "Wevaga Valley": 1,
  "Western Ithmia": 10,
  "Western Vashnars": 3,
  "Xhaiden Dale": 3,
  "Zanzibaar": 3,
  "Zaphar Isle": 3,
  "Zaphar River": 3,
};
