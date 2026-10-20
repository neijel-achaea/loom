// Tab icon (Comms, #157): a speech bubble: pure CSS keyed on the tab button's title, so Nexus's
// own redraws (selecting, dragging, layout resets) cannot undo it.
var tiTabs = [["Comms", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17"><path d="M3 2.5h11a1.5 1.5 0 0 1 1.5 1.5v6.5a1.5 1.5 0 0 1-1.5 1.5H8l-3.5 3v-3H3a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 3 2.5z" fill="#b9a4e6"/><circle cx="5.5" cy="7.2" r="1" fill="#121016"/><circle cx="8.5" cy="7.2" r="1" fill="#121016"/><circle cx="11.5" cy="7.2" r="1" fill="#121016"/></svg>']];
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

run_function("comms_setup", [], "comms");
run_function("comms_render", [], "comms");
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("comms_gmcp", [], "comms");
