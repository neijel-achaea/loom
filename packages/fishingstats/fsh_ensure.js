// Weights are stored as whole ounces. Achaea reports pounds and ounces, so an
// integer count avoids float drift and formats back exactly.
function fshBlank() {
  return {
    start: Math.floor(new Date().getTime() / 1000),
    last: Math.floor(new Date().getTime() / 1000),
    anglers: {}, species: {}, recent: [], n: 0,
    areas: {}, year: 0, rec: 0, castFt: 0, castN: 0
  };
}
if (!client.fsh) {
  var s = null;
  try { s = JSON.parse(get_variable("fsh_session")); } catch (e) { s = null; }
  if (!s || typeof s !== "object" || !s.anglers) { s = fshBlank(); }
  if (!s.anglers) { s.anglers = {}; }
  if (!s.species) { s.species = {}; }
  if (!s.recent) { s.recent = []; }
  if (!s.areas) { s.areas = {}; }
  if (!s.n) { s.n = 0; }
  if (!s.rec) { s.rec = 0; }
  if (!s.castFt) { s.castFt = 0; }
  if (!s.castN) { s.castN = 0; }
  if (!s.last) { s.last = s.start || Math.floor(new Date().getTime() / 1000); }
  client.fsh = s;
}
if (!client.fshLog) {
  var lg = [];
  try { lg = JSON.parse(get_variable("fsh_log")) || []; } catch (e) { lg = []; }
  if (Object.prototype.toString.call(lg) !== "[object Array]") { lg = []; }
  client.fshLog = lg;
}
if (!client.fshRec) {
  var r = null;
  try { r = JSON.parse(get_variable("fsh_records")); } catch (e) { r = null; }
  if (!r || typeof r !== "object") { r = { year: 0, f: {}, a: {} }; }
  if (!r.f) { r.f = {}; }
  if (!r.a) { r.a = {}; }
  client.fshRec = r;
}
if (client.fshMe === undefined) {
  var me = "";
  try { if (get_variable("fsh_me") !== undefined) { me = String(get_variable("fsh_me") || ""); } } catch (e) { me = ""; }
  if (!me) { try { me = String(get_variable("my_name") || ""); } catch (e) { me = ""; } }
  if (!me || me === "undefined") { me = "You"; }
  client.fshMe = me;
}
if (!client.fshCol) {
  var c = null;
  try { c = JSON.parse(get_variable("fsh_colours")); } catch (e) { c = null; }
  if (!c || typeof c !== "object") { c = {}; }
  client.fshCol = c;
}
if (client.fshAreaManual === undefined) {
  var am = "";
  try { if (get_variable("fsh_area") !== undefined) { am = String(get_variable("fsh_area") || ""); } } catch (e) { am = ""; }
  if (am === "undefined") { am = ""; }
  client.fshAreaManual = am;
}
if (client.fshGap === undefined) {
  var g = 90;
  try { if (get_variable("fsh_gap") !== undefined) { g = parseInt(get_variable("fsh_gap"), 10); } } catch (e) { g = 90; }
  if (!g || isNaN(g) || g < 5) { g = 90; }
  if (g > 1440) { g = 1440; }
  client.fshGap = g;
}
if (client.fshLearn === undefined) { client.fshLearn = false; }
client.fshRecentCap = 10;
client.fshLogCap = 30;
// Ordered so consecutive anglers differ in hue AND lightness, not hue alone.
client.fshPalette = ["#7fe0b4", "#e8a13f", "#a88fe0", "#5fb0e0", "#e0708f", "#c8d84a", "#d8845f", "#7fd8d8"];

// Area detection, recomputed on every call since fsh_ensure runs at the head
// of every function. Nexus exposes GMCP room data under a name that varies by
// setup, so several are tried; a manual override always wins and FPWHERE
// reports which source actually answered.
client.fshAreaNow = "";
client.fshAreaSrc = "";
if (client.fshAreaManual) {
  client.fshAreaNow = client.fshAreaManual;
  client.fshAreaSrc = "manual";
} else {
  // currentArea is maintained by the user's own GMCP handler, so it leads.
  // The rest are fallbacks for a setup that does not define it.
  var cand = ["currentArea", "room_area", "my_area", "area", "roomarea", "room_zone"];
  var ci, cv;
  for (ci = 0; ci < cand.length; ci++) {
    cv = undefined;
    try { cv = get_variable(cand[ci]); } catch (e) { cv = undefined; }
    if (cv !== undefined && cv !== null && String(cv).length > 0 && String(cv) !== "undefined") {
      client.fshAreaNow = String(cv);
      client.fshAreaSrc = cand[ci];
      break;
    }
  }
}