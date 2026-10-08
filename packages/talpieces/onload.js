// Tab icons: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo them.
var tiTabs = [["Talismans", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 14"><path d="M1 7 Q10 -1 19 7 Q10 15 1 7 Z" fill="#5f4c80" stroke="#b99be0" stroke-width="0.9"/><ellipse cx="10" cy="7" rx="3.4" ry="4.6" fill="#d9b45a"/><ellipse cx="10" cy="7" rx="0.9" ry="4" fill="#15121b"/></svg>']];
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

run_function("talpieces_setup", [], "talpieces");
run_function("talpieces_render", [], "talpieces");