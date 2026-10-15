// Tab icon (Here, #158): a "you are here" dot: pure CSS keyed on the tab button's title, so Nexus's
// own redraws (selecting, dragging, layout resets) cannot undo it.
var tiTabs = [["Here", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17"><circle cx="8.5" cy="8.5" r="7.5" fill="#e0b46c" fill-opacity="0.22"/><circle cx="8.5" cy="8.5" r="4.6" fill="#ffffff"/><circle cx="8.5" cy="8.5" r="3.4" fill="#e0b46c"/></svg>']];
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

run_function("room_setup", [], "room");
run_function("room_render", [], "room");
