// Tab icon: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo it. A pennant.
var tiTabs = [["Waypoints", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M3.5 1.5 V15" stroke="#c8bfae" stroke-width="1.3" stroke-linecap="round"/><path d="M4.2 2 L13.5 4.6 L4.2 7.4 Z" fill="#e0b46c"/><ellipse cx="3.5" cy="15" rx="2.6" ry="0.8" fill="#7a5f33"/></svg>']];
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
run_function("waypoints_setup", [], "waypoints");
run_function("waypoints_render", [], "waypoints");
