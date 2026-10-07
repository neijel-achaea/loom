if (!client.dc) {
  client.dc = {};
  client.dc.gap = parseFloat(get_variable("dc_gap"));
  if (isNaN(client.dc.gap) || client.dc.gap <= 0) { client.dc.gap = 8; }
  client.dc.tab = "DmgChart";
  client.dc.colors = { "cutting": "#d9534f", "blunt": "#b08968", "magical": "#9b6bd6", "unblockable": "#d8d8d8", "poison": "#6abf4b", "fire": "#f0883e", "cold": "#5bc0de", "electricity": "#f2d43d", "asphyxiation": "#7f8fa6", "psychic": "#e36bb8", "raw": "#8c8c8c", "bleed": "#8b1e2d" };
  client.dc.spare = ["#4fb0a5", "#c9a0dc", "#a3c45a", "#e0b070", "#6f8fd8", "#d97a9a"];
  client.dc.spareIdx = 0;
  client.dc.fight = null;
  client.dc.lastInc = null;
  client.dc.ev = null;
  client.dc.view = "";
  client.dc.saved = [];
  try { var dcRaw = get_variable("dc_sessions"); if (dcRaw && String(dcRaw).length) { client.dc.saved = JSON.parse(dcRaw) || []; } } catch (dcErr1) { client.dc.saved = []; }
  client.dc.nextId = 1;
  for (var dcI = 0; dcI < client.dc.saved.length; dcI++) { if (client.dc.saved[dcI].id >= client.dc.nextId) { client.dc.nextId = client.dc.saved[dcI].id + 1; } }
  client.dc.sess = null;
  client.dc.sessSaved = 0;
  try { var dcOpen = get_variable("dc_open"); if (dcOpen && String(dcOpen).length) { client.dc.sess = JSON.parse(dcOpen); } } catch (dcErr2) { client.dc.sess = null; }
}
// Adds client.dc.ev ({dir, type, amt}) to the current fight and, if one is open, the session.
var d = client.dc;
var e = d.ev;
if (e && !isNaN(e.amt)) {
  var now = Date.now();
  var gapMs = d.gap * 1000;
  var f = d.fight;
  if (!f || now - f.last > gapMs) {
    f = { start: now, last: now, inc: {}, out: {}, incTotal: 0, outTotal: 0 };
    d.fight = f;
    d.lastInc = null;
  }
  f[e.dir][e.type] = (f[e.dir][e.type] || 0) + e.amt;
  f[e.dir + "Total"] += e.amt;
  // Hit counts and the biggest single hit, per direction, for the exchange stats.
  if (!f.hits) { f.hits = { inc: { n: 0, max: 0 }, out: { n: 0, max: 0 } }; }
  f.hits[e.dir].n++;
  if (e.amt > f.hits[e.dir].max) { f.hits[e.dir].max = e.amt; }
  f.last = now;
  var ss = d.sess;
  if (ss) {
    if (ss.lastT && now - ss.lastT <= gapMs) { ss.combatMs += now - ss.lastT; } else { ss.fights++; }
    ss.lastT = now;
    ss[e.dir][e.type] = (ss[e.dir][e.type] || 0) + e.amt;
    ss[e.dir + "Total"] += e.amt;
    if (!ss.hits) { ss.hits = { inc: { n: 0, max: 0 }, out: { n: 0, max: 0 } }; }
    ss.hits[e.dir].n++;
    if (e.amt > ss.hits[e.dir].max) { ss.hits[e.dir].max = e.amt; }
    if (now - d.sessSaved > 5000) { set_variable("dc_open", JSON.stringify(ss)); d.sessSaved = now; }
  }
  if (e.dir == "inc") { d.lastInc = { type: e.type, amt: e.amt, t: now, inSess: !!ss }; }
  run_function("dc_render", [], "dmgchart");
}
d.ev = null;
