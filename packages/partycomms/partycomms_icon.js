// partycomms_icon -- the Party tab's icon: pure CSS keyed on the tab button's
// title, so Nexus's own redraws (selecting, dragging, layout resets) cannot
// undo it. Run from onLoad and onInstall, so it shows straight after an
// import as well as after a reload.
var tiTabs = [["Party", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 18 15"><circle cx="4" cy="5" r="2.2" fill="#3f6b60"/><path d="M0.5 14 C1 10 2.5 8.8 4 8.8 C5.5 8.8 7 10 7.5 14 Z" fill="#3f6b60"/><circle cx="14" cy="5" r="2.2" fill="#3f6b60"/><path d="M10.5 14 C11 10 12.5 8.8 14 8.8 C15.5 8.8 17 10 17.5 14 Z" fill="#3f6b60"/><circle cx="9" cy="3.6" r="2.6" fill="#7cc4b0"/><path d="M4.8 14 C5.3 9.4 7.2 7.9 9 7.9 C10.8 7.9 12.7 9.4 13.2 14 Z" fill="#7cc4b0"/></svg>']];
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
