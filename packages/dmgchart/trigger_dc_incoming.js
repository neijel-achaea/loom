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
client.dc.ev = { dir: "inc", type: String(args[2]).replace("physical ", ""), amt: parseInt(args[1], 10) };
run_function("dc_add", [], "dmgchart");
