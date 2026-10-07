// Tab icon: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo it.
var tiTabs = [["DmgChart", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17"><path d="M2 2 L11.5 11.5" stroke="#eaa25c" stroke-width="1.6"/><path d="M15 2 L5.5 11.5" stroke="#e0605a" stroke-width="1.6"/><path d="M10 13.5 L13.5 10 M3.5 10 L7 13.5" stroke="#ecdfd9" stroke-width="1.2"/><path d="M12.5 12.5 L15 15 M4.5 12.5 L2 15" stroke="#7a3f30" stroke-width="1.8"/></svg>']];
for (var tiI = 0; tiI < tiTabs.length; tiI++) {
  var tiId = "tabicon-" + tiTabs[tiI][0].toLowerCase();
  if (!document.getElementById(tiId)) {
    var tiSel = '.flexlayout__tab_button[title="' + tiTabs[tiI][0] + '" i]';
    var tiSt = document.createElement("style");
    tiSt.id = tiId;
    tiSt.textContent = tiSel + ' > * { display: none !important; } ' + tiSel + '::before { content: ""; display: block; width: 20px; height: 20px; margin: auto; background: url("data:image/svg+xml,' + encodeURIComponent(tiTabs[tiI][1]) + '") center / contain no-repeat; }';
    document.head.appendChild(tiSt);
  }
}

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
run_function("dc_render", [], "dmgchart");
