// Tab icon: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo it.
var tiTabs = [["Stats", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 17"><path d="M2 15 L12 5" stroke="#e4e6da" stroke-width="1.2"/><path d="M10 2 L16 2 L16 8 Z" fill="#a9c46c"/><path d="M2 15 L1 12 M2 15 L5 16 M3.6 13.4 L2.4 10.6 M3.6 13.4 L6.4 14.6" stroke="#56693a" stroke-width="1"/></svg>']];
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