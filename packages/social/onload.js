// Tab icon (Online, #76): pure CSS keyed on the tab button's title, so
// Nexus's own redraws (selecting, dragging, layout resets) cannot undo it.
var tiTabs = [["Online", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17"><circle cx="7" cy="5.5" r="3" fill="none" stroke="#e2e8e6" stroke-width="1.3"/><path d="M1.5 15.5 C1.8 11.5 4 10 7 10 C10 10 12.2 11.5 12.5 15.5" fill="none" stroke="#e2e8e6" stroke-width="1.3"/><circle cx="13.5" cy="4" r="2.3" fill="#7fd6c8"/></svg>']];
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

run_function("social_setup", [], "social");
run_function("social_online", [], "social");
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("social_line", [], "social");
