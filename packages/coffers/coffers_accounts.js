// coffers_accounts -- the Accounts view of the Coffers tab (#236), drawn
// into CO.acctHtml for coffers_render, which hands over its colours and
// helpers in CO.th. Static SVG only (Nexus tabs run no <script>); clicks go
// through window.loomCoffers.
if (!client.loom || !client.loom.coffers || !client.loom.coffers.f) run_function("coffers_setup", [], "coffers");
var CO = client.loom.coffers;
var F = CO.f;
var H = CO.th || {};
var acNow = Math.floor(new Date().getTime() / 1000);
var acTxt = H.TXT || "#e9dfc6", acMuted = H.MUTED || "#8c8170", acRule = H.RULE || "#3a3122", acBronze = H.BRONZE || "#9c7330";
var acGold = H.GOLD || "#e2bd5a", acUp = H.UP || "#93cf8a", acDown = H.DOWN || "#de8a72";
var acSerif = H.SERIF || "Georgia,serif";
var UNK = "#e0913f";
// Source colours, by CO.srcOrder; sources added later take the spares in turn.
var acPal = ["#93cf8a", "#e2bd5a", "#7fb7c9", "#c49bd6", "#d9a6a0", "#a8b878", "#c9a26b", "#8fa7d6"];
function acEsc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/'/g, "&#39;").replace(/"/g, "&quot;"); }
function acCaps(t, col) { return '<div style="font-family:' + acSerif + ';font-variant:small-caps;letter-spacing:0.12em;color:' + (col || acBronze) + ';font-size:11px;margin:0 0 2px;">' + t + '</div>'; }
function acColour(id) {
  if (id === "?") return UNK;
  var i = CO.srcOrder.indexOf(id);
  if (i < 0) {
    if (!CO.srcSpare) CO.srcSpare = {};
    if (CO.srcSpare[id] === undefined) { var n = 0; for (var k in CO.srcSpare) if (CO.srcSpare.hasOwnProperty(k)) n++; CO.srcSpare[id] = CO.srcOrder.length + n; }
    i = CO.srcSpare[id];
  }
  return acPal[i % acPal.length];
}
function acPick(label, on, call) {
  return '<span onclick="' + call + '" style="cursor:pointer;user-select:none;font-family:' + acSerif + ';font-variant:small-caps;letter-spacing:0.1em;font-size:11px;padding:0 1px 1px;color:' + (on ? acGold : acMuted) + ';border-bottom:1px solid ' + (on ? acGold : "transparent") + ';">' + label + '</span>';
}

// One donut: the sources of one side (0 in, 1 out), biggest first, unknown last.
function acDonut(o, side, title, accent) {
  var rows = [], total = 0, k;
  for (k in o) if (o.hasOwnProperty(k) && Array.isArray(o[k]) && o[k][side] > 0) {
    if (k !== "?") rows.push({ id: k, a: o[k][side] });
    total += o[k][side];
  }
  rows.sort(function (x, y) { return y.a - x.a; });
  if (o["?"] && o["?"][side] > 0) rows.push({ id: "?", a: o["?"][side] });
  var pct = CO.explained(o, side);
  var R = 45, C = 2 * Math.PI * R;
  var col = '<div style="flex:1 1 150px;min-width:150px;border-top:2px solid ' + accent + ';padding:3px 2px 0;">';
  col += '<div style="display:flex;justify-content:space-between;align-items:baseline;">' + acCaps(title, accent) + '<span style="color:' + acMuted + ';">' + F.n(total) + ' gold</span></div>';
  col += '<svg viewBox="0 0 120 120" width="112" height="112" style="display:block;margin:4px auto 6px;" xmlns="http://www.w3.org/2000/svg">';
  col += '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="' + acRule + '" stroke-width="15"/>';
  var off = 0;
  for (var s = 0; s < rows.length; s++) {
    var len = total > 0 ? C * rows[s].a / total : 0;
    col += '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="' + acColour(rows[s].id) + '" stroke-width="15" stroke-dasharray="' + len.toFixed(3) + ' ' + (C - len).toFixed(3) + '" stroke-dashoffset="' + (-off).toFixed(3) + '" transform="rotate(-90 60 60)"><title>' + acEsc(CO.srcName(rows[s].id)) + '</title></circle>';
    off += len;
  }
  col += '<text x="60" y="61" text-anchor="middle" font-family="' + acSerif + '" font-size="21" fill="' + (pct === null ? acMuted : (pct >= 100 ? acUp : acGold)) + '">' + (pct === null ? "&mdash;" : pct + "%") + '</text>';
  col += '<text x="60" y="76" text-anchor="middle" font-family="' + acSerif + '" font-style="italic" font-size="9" fill="' + acMuted + '">explained</text>';
  col += '</svg>';
  if (!rows.length) col += '<div style="color:' + acMuted + ';font-family:' + acSerif + ';font-style:italic;">nothing yet</div>';
  for (var t = 0; t < rows.length; t++) {
    var r = rows[t], unk = r.id === "?";
    col += '<div style="display:flex;gap:6px;border-bottom:1px dotted ' + acRule + ';padding:1px 0;' + (unk ? 'color:' + UNK + ';' : '') + '">';
    col += '<span style="flex:1 1 auto;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"><span style="display:inline-block;width:8px;height:8px;background:' + acColour(r.id) + ';margin-right:4px;"></span>' + acEsc(CO.srcName(r.id)) + '</span>';
    col += '<span style="min-width:3.5em;text-align:right;">' + F.k(r.a) + '</span>';
    col += '<span style="min-width:2.6em;text-align:right;color:' + (unk ? UNK : acMuted) + ';">' + Math.round(100 * r.a / total) + '%</span></div>';
  }
  return col + '</div>';
}

var ac = "";
// The period: session, today, the last 7 days.
var acPer = [["session", "session"], ["today", "today"], ["week", "7 days"]];
ac += '<div style="display:flex;justify-content:flex-end;gap:10px;margin-top:6px;">';
for (var pi = 0; pi < acPer.length; pi++) ac += acPick(acPer[pi][1], CO.period === acPer[pi][0], "window.loomCoffers&&window.loomCoffers.period('" + acPer[pi][0] + "')");
ac += '</div>';
var acO = CO.srcFor(CO.period, acNow);
var acAll = CO.explained(acO);
ac += '<div style="color:' + acMuted + ';margin-top:2px;">' + (acAll === null ? "No money has moved " + (CO.period === "session" ? "this session" : (CO.period === "today" ? "today" : "in the last 7 days")) + " since coffers started keeping accounts."
  : "<span title=\"Each source counts in full, so these totals can run above the Wealth view's in and out when money comes and goes on the same prompt.\"><span style=\"color:" + (acAll >= 100 ? acUp : acGold) + ";\">" + acAll + "%</span> of the money moved " + (CO.period === "session" ? "this session" : (CO.period === "today" ? "today" : "in the last 7 days")) + " is explained.</span>") + '</div>';
ac += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:6px;">' + acDonut(acO, 0, "Income", acUp) + acDonut(acO, 1, "Spending", acDown) + '</div>';

// Recent moves, newest first; unknown rows open to the lines captured with them.
var acM = CO.moves || [], acShown = 0, acList = "", acUnk = 0;
for (var mi = acM.length - 1; mi >= 0; mi--) if (acM[mi].u) acUnk++;
for (var mj = acM.length - 1; mj >= 0 && acShown < 60; mj--) {
  var mv = acM[mj];
  if (CO.unknownOnly && !mv.u) continue;
  acShown++;
  var mvOpen = mv.u && CO.openRow === mv.n;
  var mvClick = mv.u ? ' onclick="window.loomCoffers&&window.loomCoffers.open(' + mv.n + ')" title="' + (mv.x && mv.x.length ? "Show the lines that came with it" : "No lines were kept for this one") + '" style="cursor:pointer;' : ' style="';
  acList += '<div' + mvClick + 'display:flex;gap:8px;border-bottom:1px dotted ' + acRule + ';padding:1px 0;">';
  acList += '<span style="color:' + acMuted + ';min-width:5.5em;white-space:nowrap;">' + (F.dayKey(mv.t) === F.dayKey(acNow) ? "" : F.date(mv.t) + " ") + F.hm(mv.t) + '</span>';
  acList += '<span style="min-width:5.5em;text-align:right;color:' + (mv.d > 0 ? acUp : acDown) + ';">' + F.s(mv.d) + '</span>';
  var mvTxt = acEsc(CO.describe(mv));
  if (mv.u) mvTxt = mvTxt.replace(/unknown( [+\-][\d,]+)?$/, '<span style="color:' + UNK + ';">unknown$1 ' + (mvOpen ? "&#9652;" : "&#9662;") + '</span>');
  acList += '<span style="flex:1 1 auto;min-width:0;">' + mvTxt + '</span></div>';
  if (mvOpen) {
    var mvX = mv.x || [];
    acList += '<div style="margin:1px 0 4px 6em;padding:2px 6px;border-left:2px solid ' + UNK + ';color:' + acMuted + ';white-space:pre-wrap;word-break:break-word;">' +
      (mvX.length ? mvX.map(acEsc).join("\n") : "No lines were kept for this one (only the newest " + CO.movesLines + " unknown moves keep them).") + '</div>';
  }
}
var acHead = '<div style="display:flex;justify-content:space-between;align-items:baseline;">' + acCaps("Recent moves") +
  acPick(CO.unknownOnly ? "show all" : "unknown only (" + acUnk + ")", CO.unknownOnly, "window.loomCoffers&&window.loomCoffers.unknown()") + '</div>';
if (!acShown) acList = '<div style="color:' + acMuted + ';font-family:' + acSerif + ';font-style:italic;">' + (CO.unknownOnly ? "No unknown moves kept." : "None yet: every change of fortune lands here, with what it was.") + '</div>';
else acList += '<div style="color:' + acMuted + ';font-family:' + acSerif + ';font-style:italic;margin-top:3px;">Click an unknown move for the lines that came with it. COFFERS LOG UNKNOWN prints them to copy.</div>';
ac += '<div style="border-top:1px solid ' + acRule + ';margin-top:8px;padding-top:5px;">' + acHead + acList + '</div>';
CO.acctHtml = ac;
