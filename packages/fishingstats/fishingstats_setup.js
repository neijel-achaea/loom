// fishingstats_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration of the
// fsh_* variables, then each piece built from stored variables if missing.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.fishingstats) client.loom.fishingstats = {};
client.loom.registry.fishingstats = { version: "0.2.1", keyword: "FISHINGSTATS", desc: "{{description}}" };
var FS = client.loom.fishingstats;

function fsGet(name) {
  var v;
  try { v = get_variable(name); } catch (e) { v = undefined; }
  return (v === null || v === "undefined") ? undefined : v;
}

// One-time migration: fsh_* -> fishingstats_*. A new variable that already
// holds data wins; the old one is deleted either way.
var fsMoves = ["session", "log", "records", "me", "colours", "area", "gap"];
for (var fsI = 0; fsI < fsMoves.length; fsI++) {
  var fsOld = fsGet("fsh_" + fsMoves[fsI]);
  if (fsOld !== undefined) {
    var fsNew = fsGet("fishingstats_" + fsMoves[fsI]);
    if (fsNew === undefined || fsNew === "") set_variable("fishingstats_" + fsMoves[fsI], fsOld);
    delete_variable("fsh_" + fsMoves[fsI]);
  }
}
// The old package kept its state in 18 loose client.fsh* keys; drop them so a
// reimport without a page reload doesn't leave two copies around. The open
// session in memory carries over.
var fsOldKeys = ["fsh", "fshAreaManual", "fshAreaNow", "fshAreaSrc", "fshBuf", "fshCol", "fshEvt", "fshGap", "fshIn", "fshLearn", "fshLog", "fshLogCap", "fshMe", "fshPalette", "fshRank", "fshRankMode", "fshRec", "fshRecentCap"];
if (client.fsh && client.fsh.anglers && !FS.session) FS.session = client.fsh;
for (var fsJ = 0; fsJ < fsOldKeys.length; fsJ++) {
  if (client[fsOldKeys[fsJ]] !== undefined) delete client[fsOldKeys[fsJ]];
}

// Weights are stored as whole ounces. Achaea reports pounds and ounces, so an
// integer count avoids float drift and formats back exactly.
FS.blank = function () {
  var now = Math.floor(new Date().getTime() / 1000);
  return {
    start: now, last: now,
    anglers: {}, species: {}, recent: [], n: 0,
    areas: {}, year: (client.loom.fishingstats.rec && client.loom.fishingstats.rec.year) || 0, rec: 0, castFt: 0, castN: 0
  };
};
if (!FS.rec) {
  var r = null;
  try { r = JSON.parse(fsGet("fishingstats_records")); } catch (e) { r = null; }
  if (!r || typeof r !== "object") { r = { year: 0, f: {}, a: {} }; }
  if (!r.f) { r.f = {}; }
  if (!r.a) { r.a = {}; }
  FS.rec = r;
}
if (!FS.session) {
  var s = null;
  try { s = JSON.parse(fsGet("fishingstats_session")); } catch (e) { s = null; }
  if (!s || typeof s !== "object" || !s.anglers) { s = FS.blank(); }
  FS.session = s;
}
var fsS = FS.session;
if (!fsS.species) { fsS.species = {}; }
if (!fsS.recent) { fsS.recent = []; }
if (!fsS.areas) { fsS.areas = {}; }
if (!fsS.n) { fsS.n = 0; }
if (!fsS.rec) { fsS.rec = 0; }
if (!fsS.castFt) { fsS.castFt = 0; }
if (!fsS.castN) { fsS.castN = 0; }
if (!fsS.last) { fsS.last = fsS.start || Math.floor(new Date().getTime() / 1000); }
if (!FS.log) {
  var lg = [];
  try { lg = JSON.parse(fsGet("fishingstats_log")) || []; } catch (e) { lg = []; }
  if (Object.prototype.toString.call(lg) !== "[object Array]") { lg = []; }
  FS.log = lg;
}
if (!FS.col) {
  var c = null;
  try { c = JSON.parse(fsGet("fishingstats_colours")); } catch (e) { c = null; }
  if (!c || typeof c !== "object") { c = {}; }
  FS.col = c;
}
// Your angler name: FISHINGSTATS ME sets it; otherwise the name GMCP gives
// (Char.Name), and "You" until that arrives.
FS.meSet = String(fsGet("fishingstats_me") || "");
if (!FS.gmcpName) FS.gmcpName = "";
FS.me = FS.meSet || FS.gmcpName || "You";
var fsG = parseInt(fsGet("fishingstats_gap"), 10);
if (!fsG || isNaN(fsG) || fsG < 5) { fsG = 90; }
if (fsG > 1440) { fsG = 1440; }
FS.gap = fsG;
if (FS.learn === undefined) { FS.learn = false; }
FS.recentCap = 10;
FS.logCap = 30;
// Ordered so consecutive anglers differ in hue AND lightness, not hue alone.
FS.palette = ["#7fe0b4", "#e8a13f", "#a88fe0", "#5fb0e0", "#e0708f", "#c8d84a", "#d8845f", "#7fd8d8"];

// Area: a manual pin (FISHINGSTATS AREA <name>) wins; otherwise the area
// GMCP's Room.Info gave last (kept by this package's onGMCP).
FS.areaManual = String(fsGet("fishingstats_area") || "");
if (!FS.areaGmcp) FS.areaGmcp = "";
FS.areaNow = FS.areaManual || FS.areaGmcp;
FS.areaSrc = FS.areaManual ? "manual" : (FS.areaGmcp ? "GMCP" : "");
