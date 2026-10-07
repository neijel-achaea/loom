// Tab icon: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo it.
var tiTabs = [["Ledger", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 17"><path d="M14.5 1 C9 2.5 5.5 6.5 3.5 12.5 L5 12.8 C7 8 10 4.5 14.5 1 Z" fill="#e6d5ac"/><path d="M14.5 1 C10.5 4 7.5 8 5 12.8" fill="none" stroke="#8b6b47" stroke-width="0.7"/><path d="M3.5 12.5 L2.2 15.8" stroke="#e6d5ac" stroke-width="1.1"/><circle cx="2" cy="16" r="0.9" fill="#d0604c"/></svg>']];
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

// Ledger: self-contained startup. Seeds the Achaean date and queues the digest.
run_function("lg_build", [], "ledger");
client.lg.pendingDigest = true;
run_function("lg_sync", [], "ledger");
