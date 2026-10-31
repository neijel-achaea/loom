// Tab icon: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo it. A basket.
var tiTabs = [["Shopping", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4.5 6.5 L7 2 M11.5 6.5 L9 2" stroke="#c8bfae" stroke-width="1.2" stroke-linecap="round" fill="none"/><path d="M1.5 6.5 H14.5 L13 14 H3 Z" fill="#e0b46c"/><path d="M5.5 8.5 V12 M8 8.5 V12 M10.5 8.5 V12" stroke="#7a5f33" stroke-width="1.1" stroke-linecap="round"/></svg>']];
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
// A lookup can't survive a reload.
if (client.loom && client.loom.shopping) { client.loom.shopping.q = null; client.loom.shopping.choices = null; }
run_function("shopping_setup", [], "shopping");
run_function("shopping_render", [], "shopping");
