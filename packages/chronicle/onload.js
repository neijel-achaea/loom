// Tab icon: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo it. An open book.
var tiTabs = [["Chronicle", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M8 4 C6 2.6 3.5 2.4 1 3 L1 13 C3.5 12.4 6 12.6 8 14 Z" fill="#e6d5ac"/><path d="M8 4 C10 2.6 12.5 2.4 15 3 L15 13 C12.5 12.4 10 12.6 8 14 Z" fill="#cdb98a"/><path d="M8 4 L8 14" stroke="#8b6b47" stroke-width="0.8"/><path d="M3 5.5 L6.2 6 M3 7.5 L6.2 8 M3 9.5 L6.2 10 M9.8 6 L13 5.5 M9.8 8 L13 7.5" stroke="#8b6b47" stroke-width="0.5"/></svg>']];
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
run_function("chronicle_setup", [], "chronicle");
run_function("chronicle_gmcp", [], "chronicle");
run_function("chronicle_render", [], "chronicle");
