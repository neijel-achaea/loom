// Tab icon: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo it.
var tiTabs = [["Level", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 16"><rect x="1" y="11" width="4" height="4" fill="#4d6f86"/><rect x="7" y="7" width="4" height="8" fill="#8fbfe0" fill-opacity="0.7"/><rect x="13" y="2" width="4" height="13" fill="#8fbfe0"/><path d="M13 1.5 L15 0 L17 1.5" fill="none" stroke="#e8f3fb" stroke-width="0.8"/></svg>']];
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