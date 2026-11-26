// Tab icon: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo it.
var tiTabs = [["Ripples", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 16"><path d="M1 9 Q5 5 9 9 T17 9" fill="none" stroke="#8fd0c4" stroke-width="1.5"/><path d="M3 13 Q6 10.5 9 13 T15 13" fill="none" stroke="#3f6f6a" stroke-width="1.4"/><circle cx="9" cy="4" r="2.2" fill="#e8f1ee"/></svg>']];
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

run_function("ripples_setup", [], "ripples");
run_function("ripples_render", [], "ripples");
