// Tab icon (Basher, #123): a training dummy with a target on its chest
// (Ricardo; crossed swords were too close to DmgChart's); pure CSS
// keyed on the tab button's title, as Here's, so Nexus's own redraws can't
// undo it. Injected once per page: a changed icon needs a page reload.
var tiTabs = [["Basher", '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17 17"><line x1="8.5" y1="9" x2="8.5" y2="16.2" stroke="#a5824a" stroke-width="1.8" stroke-linecap="round"/><line x1="5.6" y1="16.2" x2="11.4" y2="16.2" stroke="#a5824a" stroke-width="1.4" stroke-linecap="round"/><line x1="1.8" y1="7.2" x2="15.2" y2="7.2" stroke="#e0b46c" stroke-width="1.8" stroke-linecap="round"/><circle cx="8.5" cy="2.9" r="2.1" fill="#e0b46c"/><rect x="5.2" y="5" width="6.6" height="7.4" rx="2.4" fill="#e0b46c"/><circle cx="8.5" cy="8.7" r="2.3" fill="#ffffff"/><circle cx="8.5" cy="8.7" r="1.15" fill="#c0392b"/></svg>']];
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
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("basher_gmcp", [], "basher");
