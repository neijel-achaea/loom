// Tab icon: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo it.
var tiTabs = [["Coffers", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 17"><ellipse cx="10" cy="13.5" rx="8.5" ry="2.8" fill="#9c7330"/><ellipse cx="10" cy="12" rx="8.5" ry="2.8" fill="#e2bd5a" stroke="#9c7330" stroke-width="0.6"/><ellipse cx="10" cy="9" rx="8.5" ry="2.8" fill="#9c7330"/><ellipse cx="10" cy="7.5" rx="8.5" ry="2.8" fill="#e2bd5a" stroke="#9c7330" stroke-width="0.6"/><ellipse cx="10" cy="4.5" rx="8.5" ry="2.8" fill="#9c7330"/><ellipse cx="10" cy="3" rx="8.5" ry="2.8" fill="#f3d781" stroke="#9c7330" stroke-width="0.6"/></svg>']];
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

run_function("coffers_setup", [], "coffers");
run_function("coffers_render", [], "coffers");
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("coffers_gmcp", [], "coffers");
