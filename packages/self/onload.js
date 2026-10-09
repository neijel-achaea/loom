// Tab icon: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo it.
var tiTabs = [["Self", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><circle cx="8" cy="5" r="3.3" fill="#e0a0a8"/><path d="M1.5 15.5 C2 10.5 5 9.2 8 9.2 C11 9.2 14 10.5 14.5 15.5 Z" fill="#7a4a52" stroke="#e0a0a8" stroke-width="0.8"/></svg>']];
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

run_function("self_setup", [], "self");
// The tab fills from GMCP; SCORE and DEF fill in what GMCP doesn't send.
send_command("score");
send_command("def");

run_function("self_render", [], "self");
