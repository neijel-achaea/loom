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

run_function("dmgchart_setup", [], "dmgchart");
run_function("dmgchart_render", [], "dmgchart");
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("dmgchart_gmcp", [], "dmgchart");
