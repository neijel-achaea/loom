// Tab icon: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo it. A folded map.
var tiTabs = [["Atlas", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M1.5 3.2 L5.5 1.8 L10.5 3.6 L14.5 2.2 V12.8 L10.5 14.2 L5.5 12.4 L1.5 13.8 Z" fill="#2b2620" stroke="#c8bfae" stroke-width="1" stroke-linejoin="round"/><path d="M5.5 1.8 V12.4 M10.5 3.6 V14.2" stroke="#7a5f33" stroke-width="0.9"/><circle cx="8" cy="7.6" r="1.6" fill="none" stroke="#e0b46c" stroke-width="1"/></svg>'], ["Areas", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect x="1.5" y="2" width="13" height="2.4" rx="0.6" fill="#2b2620" stroke="#c8bfae" stroke-width="0.8"/><rect x="1.9" y="2.4" width="9" height="1.6" fill="#e0b46c"/><rect x="1.5" y="6.8" width="13" height="2.4" rx="0.6" fill="#2b2620" stroke="#c8bfae" stroke-width="0.8"/><rect x="1.9" y="7.2" width="5" height="1.6" fill="#e0b46c"/><rect x="1.5" y="11.6" width="13" height="2.4" rx="0.6" fill="#2b2620" stroke="#c8bfae" stroke-width="0.8"/><rect x="1.9" y="12" width="11.6" height="1.6" fill="#e0b46c"/></svg>']];
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
run_function("atlas_setup", [], "atlas");
if (!client.loom.atlas.map) client.loom.atlas.load(false);
run_function("atlas_render", { full: true }, "atlas");
run_function("atlas_areas_render", [], "atlas");
