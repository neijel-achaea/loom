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
// Bleeding arrives as "Health lost: N (raw)." then "You bleed N health."
// If that raw line was just recorded, move it from raw to bleed (fight and session); else record bleed.
var amt = parseInt(args[1], 10);
var d = client.dc;
var li = d.lastInc;
var f = d.fight;
if (f && li && li.type == "raw" && li.amt == amt && Date.now() - li.t < 1500 && (f.inc.raw || 0) >= amt) {
  f.inc.raw -= amt;
  if (f.inc.raw <= 0) { delete f.inc.raw; }
  f.inc.bleed = (f.inc.bleed || 0) + amt;
  if (li.inSess && d.sess && (d.sess.inc.raw || 0) >= amt) {
    d.sess.inc.raw -= amt;
    if (d.sess.inc.raw <= 0) { delete d.sess.inc.raw; }
    d.sess.inc.bleed = (d.sess.inc.bleed || 0) + amt;
  }
  d.lastInc = { type: "bleed", amt: amt, t: li.t, inSess: li.inSess };
  run_function("dc_render", [], "dmgchart");
} else {
  d.ev = { dir: "inc", type: "bleed", amt: amt };
  run_function("dc_add", [], "dmgchart");
}
