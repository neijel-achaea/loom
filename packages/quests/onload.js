// Tab icon: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo it. A scroll.
var tiTabs = [["Quests", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><path d="M4 2.5 H12.5 V12.5 Q12.5 14 11 14 H3.5" fill="#c8bfae" stroke="#7a5f33" stroke-width="0.8"/><path d="M4 2.5 Q2.5 2.5 2.5 4 Q2.5 5.2 4 5.2 V12.5 Q4 14 3.5 14 Q2 14 2 12.6" fill="none" stroke="#7a5f33" stroke-width="0.8"/><path d="M6 6 H10.5 M6 8 H10.5 M6 10 H9" stroke="#7a5f33" stroke-width="0.8" stroke-linecap="round"/><circle cx="11" cy="12.3" r="1.3" fill="#e0b46c"/></svg>']];
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
run_function("quests_setup", [], "quests");
run_function("quests_render", [], "quests");
