// Tab icon (Basher, #123): crossed swords in the suite's amber; pure CSS
// keyed on the tab button's title, as Here's, so Nexus's own redraws can't
// undo it. Injected once per page: a changed icon needs a page reload.
var tiTabs = [["Basher", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17"><g stroke-linecap="round"><line x1="2.5" y1="2.5" x2="11" y2="11" stroke="#ffffff" stroke-width="2.4"/><line x1="14.5" y1="2.5" x2="6" y2="11" stroke="#ffffff" stroke-width="2.4"/><line x1="2.5" y1="2.5" x2="11" y2="11" stroke="#e0b46c" stroke-width="1.4"/><line x1="14.5" y1="2.5" x2="6" y2="11" stroke="#e0b46c" stroke-width="1.4"/><line x1="9" y1="13" x2="13" y2="9" stroke="#e0b46c" stroke-width="1.6"/><line x1="4" y1="9" x2="8" y2="13" stroke="#e0b46c" stroke-width="1.6"/><line x1="11.4" y1="11.4" x2="14.4" y2="14.4" stroke="#a5824a" stroke-width="1.8"/><line x1="5.6" y1="11.4" x2="2.6" y2="14.4" stroke="#a5824a" stroke-width="1.8"/></g></svg>']];
try {
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
} catch (e) {}

// Always loads OFF. Hunting may load after this package, so its absence is
// told a little later, once.
run_function("basher_setup", [], "basher");
setTimeout(function () {
  var B = client.loom && client.loom.basher;
  if (B && !B.hunting()) display_notice("[basher] needs the hunting package to attack; it sends nothing without it.", "orange");
}, 5000);
