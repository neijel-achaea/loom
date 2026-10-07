// Tab icons: pure CSS keyed on the tab button's title, so Nexus's own
// redraws (selecting, dragging, layout resets) cannot undo them.
var tiTabs = [["fishingstats", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 16"><path d="M3 9 C6 3.5 12 3 15.5 6.5 C12 9.5 6 10 3 9 Z" fill="#7fd0c0"/><path d="M15 6.3 L19 3.5 L18.2 7 L19 10 Z" fill="#7fd0c0"/><circle cx="6" cy="7.2" r="0.8" fill="#0d1514"/><path d="M1 13.5 Q4 12 7 13.5 T13 13.5 T19 13.5" fill="none" stroke="#3f7a72" stroke-width="1"/></svg>'], ["fishinglog", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 16"><path d="M3 9 C6 3.5 12 3 15.5 6.5 C12 9.5 6 10 3 9 Z" fill="#3f7a72"/><path d="M15 6.3 L19 3.5 L18.2 7 L19 10 Z" fill="#3f7a72"/><circle cx="6" cy="7.2" r="0.8" fill="#0d1514"/><path d="M1 12.5 H19 M1 15 H19" stroke="#7fd0c0" stroke-width="1"/></svg>']];
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