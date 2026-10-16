// social_flush -- end of a QW capture (its "Plus another" line, or the 30s
// safety when no reply came): compare with the previous set and announce
// watched names that came online or went offline.
// Your standing with someone, as its icon, for the "has awoken" notice
// (#50, from standings through loom's link standings-login): "Ana \u2665 has
// awoken" (Ricardo). Empty when the link is off or they aren't on the books.
function soMark(name) {
  var LL = client.loom.loom;
  var st = (LL && LL.answer) ? LL.answer("social", "notice.standing", name) : undefined;
  return (st && st.icon) ? " " + st.icon + "\ufe0e" : "";
}
// Your open ledger items about them (#197/#49, from ledger through loom's
// link ledger-login), after the notice: " \u00b7 ledger: #12 pay back Ana
// 5k (overdue 2d)". At most three, most urgent first, then how many more.
function soLedger(name) {
  var LL = client.loom.loom;
  var its = (LL && LL.answer) ? LL.answer("social", "notice.ledger", name) : undefined;
  if (!its || !its.length) return "";
  var parts = [];
  for (var i = 0; i < its.length && i < 3; i++) parts.push("#" + its[i].id + " " + its[i].text + (its[i].when ? " (" + its[i].when + ")" : ""));
  return " \u00b7 ledger: " + parts.join("; ") + (its.length > 3 ? "; +" + (its.length - 3) + " more" : "");
}
var S = client.loom.social;
S.capturing = false;
clearTimeout(S.safetyT);
clearTimeout(S.flushT);
// QW's last line: "Plus another N whose presence you cannot fully sense (M total)."
var soFoot = S.buf.join(" ").match(/Plus another (\d+)[\s\S]*?\((\d+) total\)/);
if (soFoot) { S.qwHidden = parseInt(soFoot[1], 10); S.qwTotal = parseInt(soFoot[2], 10); }
var soText = S.buf.join(" ").replace(/Plus another[\s\S]*$/, "").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1");
S.buf = [];
var soParts = soText.split(/,|\band\b/);
var soNames = [];
for (var soI = 0; soI < soParts.length; soI++) {
  var soS = soParts[soI].replace(/[^A-Za-z]/g, "");
  if (/^[A-Z][a-z]+$/.test(soS)) soNames.push(soS.toLowerCase());
}
S.lastCount = soNames.length;
if (!soNames.length) {
  if (S.reportOnce) { display_notice("[social] poll returned no names (kept the previous set).", "cyan"); S.reportOnce = false; }
} else {
  var soNow = {};
  for (var soJ = 0; soJ < soNames.length; soJ++) soNow[soNames[soJ]] = true;
  var soUp = 0, soDown = 0, soPrimed = false;
  if (S.prev === null) {
    soPrimed = true;
    // Online before the first poll: counted from your login.
    for (var soP in soNow) S.since[soP] = S.loginAt || Date.now();
  } else {
    // name -> colour of its highest-priority watched group
    var soIdx = {};
    for (var soG = 0; soG < S.groups.length; soG++) {
      var soGr = S.groups[soG];
      if (!S.watch[soGr]) continue;
      for (var soN in S.lists[soGr]) { if (!soIdx[soN]) soIdx[soN] = S.color[soGr]; }
    }
    for (var soA in soNow) {
      if (!S.prev[soA]) { soUp++; S.since[soA] = Date.now(); S.flash[soA] = { kind: "in", at: Date.now() }; if (soIdx[soA]) display_notice("[social] " + soA.charAt(0).toUpperCase() + soA.slice(1) + soMark(soA.charAt(0).toUpperCase() + soA.slice(1)) + " has awoken." + soLedger(soA.charAt(0).toUpperCase() + soA.slice(1)), soIdx[soA]); }
    }
    for (var soB in S.prev) {
      if (!soNow[soB]) { soDown++; delete S.since[soB]; S.flash[soB] = { kind: "out", at: Date.now() }; if (soIdx[soB]) display_notice("[social] " + soB.charAt(0).toUpperCase() + soB.slice(1) + " has drifted into slumber.", soIdx[soB]); }
    }
  }
  // Anyone online whose login we never saw counts from yours.
  for (var soQ in soNow) { if (!S.since[soQ]) S.since[soQ] = S.loginAt || Date.now(); }
  S.prev = soNow;
  if (S.reportOnce || S.debug) {
    display_notice(soPrimed ? "[social] primed with " + soNames.length + " names." : "[social] poll: " + soUp + " new, " + soDown + " gone (" + soNames.length + " online).", "cyan");
    S.reportOnce = false;
  }
}
// Last seen, for the Offline section: everyone listed who is online now. Those
// who just left keep the time of the last poll that saw them.
var soListed = function (n) { for (var g = 0; g < S.groups.length; g++) { if (S.lists[S.groups[g]][n]) return true; } return false; };
var soSeenNow = Date.now();
for (var soS1 = 0; soS1 < soNames.length; soS1++) { if (soListed(soNames[soS1])) S.seen[soNames[soS1]] = soSeenNow; }
if (soDown > 0 || soSeenNow - S.seenSaved > 60000) {
  // Drop names no longer in any list, then save.
  for (var soD in S.seen) { if (!soListed(soD)) delete S.seen[soD]; }
  set_variable("social_seen", JSON.stringify(S.seen));
  S.seenSaved = soSeenNow;
}
// The Online tab (#76), after every poll.
S.lastPoll = Date.now();
run_function("social_online", [], "social");
