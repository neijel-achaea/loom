// magi_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, one-time migration of the
// settings of crystalism and artificing (merged into magi in 0.1.0), then
// the class's helpers.
//
// Publishes the staff attack (the ability STAFF CAST uses: scintilla,
// horripilation or lightning) at client.loom.magi.staff and in the
// magi_staff variable; hunting and the basher read it for the staff key.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.magi) client.loom.magi = {};
client.loom.registry.magi = { version: "0.1.0", keyword: "MAGI", desc: "{{description}}" };
var MG = client.loom.magi;

function mgGet(n) { var v; try { v = get_variable(n); } catch (e) { v = undefined; } return (v === undefined || v === null || ("" + v) === "undefined") ? "" : "" + v; }

// crystalism or artificing still installed next to magi: their triggers
// would answer the same lines twice. Read from Nexus's package list when it
// has one, else from the registry (which keeps an uninstalled package until
// the next load).
MG.replaces = ["crystalism", "artificing"];
MG.oldInstalled = function () {
  var out = [], names = null;
  try {
    var pls = client._packages.list();
    names = {};
    for (var i = 0; i < pls.length; i++) names[String(pls[i].name).toLowerCase()] = true;
  } catch (e) { names = null; }
  var reg = client.loom.registry || {};
  for (var j = 0; j < MG.replaces.length; j++) {
    var p = MG.replaces[j];
    if (names ? names[p] : reg[p]) out.push(p);
  }
  return out;
};
// The warning, printed at each load while they are there.
MG.warnOld = function () {
  var o = MG.oldInstalled();
  if (!o.length) return;
  var two = o.length > 1;
  display_notice("[magi] " + o.join(" and ") + (two ? " are" : " is") + " still installed: uninstall " + (two ? "them" : "it") + ", magi replaces " + (two ? "both" : "it") + " (your settings have been copied to it). Until then magi leaves pearls and portals to the old package.", "orange");
};

// One-time migration: the old packages' settings move to magi_*. A value
// already under the new name wins. The old names are deleted once the old
// packages are gone (while installed they still read them).
// (staffAttack is artificing's own pre-0.2 name.)
var mgStill = MG.oldInstalled().length > 0;
var mgMoves = [
  ["crystalism_pearls", "magi_pearls"], ["crystalism_portal", "magi_portal"],
  ["crystalism_min", "magi_min"], ["crystalism_default_min", "magi_default_min"],
  ["crystalism_rift", "magi_rift"], ["artificing_staff", "magi_staff"], ["staffAttack", "magi_staff"]
];
for (var mgI = 0; mgI < mgMoves.length; mgI++) {
  var mgOld = mgGet(mgMoves[mgI][0]);
  if (mgOld === "") continue;
  if (mgGet(mgMoves[mgI][1]) === "") set_variable(mgMoves[mgI][1], mgOld);
  if (!mgStill) delete_variable(mgMoves[mgI][0]);
}

// ---- Crystalism: even refining, pearls, portals ---------------------------
MG.shapes = ["cube", "cylinder", "diamond", "disc", "egg", "pentagon", "polyhedron", "pyramid", "sphere", "spiral", "torus"];
MG.hardCap = 200;         // most crystals refined in one run
MG.maxPerCommand = 10;    // REFINE takes at most this many at once
MG.facetsPerCrystal = 1;
if (!MG.state) MG.state = "idle";
if (!MG.queue) MG.queue = [];
// Crystals in the rift per shape, as last read by MAGI REFINE's IR CRYSTAL;
// saved (magi_rift), so a reload doesn't forget them.
function mgTable(n) {
  var t;
  try { t = JSON.parse(mgGet(n) || "{}"); } catch (e) { t = {}; }
  return (t && typeof t == "object" && !Array.isArray(t)) ? t : {};
}
if (!MG.rift || typeof MG.rift != "object" || !Object.keys(MG.rift).length) MG.rift = mgTable("magi_rift");
// Minimum stock per shape (#44, as harvesting's): magi_min = { torus: 80 },
// any other shape at magi_default_min.
MG.min = mgTable("magi_min");
if (!to_number(mgGet("magi_default_min"))) set_variable("magi_default_min", 50);
MG.defMin = to_number(mgGet("magi_default_min"));
MG.facetsPerPearl = 9;
if (!mgGet("magi_pearls")) set_variable("magi_pearls", "on");
if (!mgGet("magi_portal")) set_variable("magi_portal", "off");

// ---- Artificing: the staff attack and treaties ----------------------------
// Staff attacks by element, and the elementals a treaty can be formed with.
MG.staffs = { fire: "scintilla", frost: "horripilation", lightning: "lightning" };
MG.elementals = ["waterweird", "djinn", "sandling", "efreeti", "stoneback", "breath", "mistfiend", "ashbeast"];
MG.staff = mgGet("magi_staff") || "scintilla";
// The treaty being formed, if any: { elemental, at }.
if (MG.treaty === undefined) MG.treaty = null;

// The read-only look other packages see through loom (#159, #44, #299).
//   look.levels() -> [{ shape, have, min }] for every shape with a count
//     read from the rift; empty when none has been read yet.
//   look.pearlMob(name) -> true for a denizen that drops pearls.
//   look.pearl(name) -> true for a pearl lying in the room.
MG.pearlMobs = [/\bbarnacle[- ]encrusted oysters?\b/i];
MG.pearlItems = [/\bglistening iridescent pearls?\b/i];
MG.look = {
  pearlMob: function (name) {
    var n = String(name || "");
    if (/^the corpse of\b/i.test(n)) return false;
    for (var i = 0; i < MG.pearlMobs.length; i++) { if (MG.pearlMobs[i].test(n)) return true; }
    return false;
  },
  pearl: function (name) {
    var n = String(name || "");
    for (var i = 0; i < MG.pearlItems.length; i++) { if (MG.pearlItems[i].test(n)) return true; }
    return false;
  },
  levels: function () {
    var out = [];
    for (var i = 0; i < MG.shapes.length; i++) {
      var s = MG.shapes[i];
      if (MG.rift[s] === undefined || MG.rift[s] === null) continue;
      out.push({ shape: s, have: MG.rift[s], min: (MG.min[s] != null ? MG.min[s] : MG.defMin) });
    }
    return out;
  }
};

// The pre-0.2 autorefine kept its state on window.nj.ar.
if (window.nj && window.nj.ar) window.nj.ar = null;
