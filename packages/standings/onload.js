// Tab icon: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo it.
var tiTabs = [["Standings", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 16"><path d="M9 1.5 V14 M5 15 H13 M2 4 H16" stroke="#b8c4d6" stroke-width="1.1"/><path d="M2 4 L0.5 9 H3.5 Z M16 4 L14.5 9 H17.5 Z" fill="none" stroke="#b8c4d6" stroke-width="0.9"/><path d="M0.5 9 Q2 11 3.5 9 Z" fill="#8fd0a0"/><path d="M14.5 9 Q16 11 17.5 9 Z" fill="#e08a78"/><circle cx="9" cy="1.5" r="1.1" fill="#b8c4d6"/></svg>']];
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

run_function("st_ensure", [], "standings");
run_function("st_render", [], "standings");