if (!client.loom || !client.loom.talpieces || !client.loom.talpieces.pieces) run_function("talpieces_setup", [], "talpieces");
var TP = client.loom.talpieces;
// Draws the 'Talismans' tab in the house style shared with Coffers, Level,
// Ledger, Fishing and DmgChart: ink panel, serif small-caps headings, one
// large figure, monospace ledger rows. The tab accent is amethyst; each dragon keeps its own colour.
var t = TP;
// Tab theme (#310): loom's city palette when one is on, else this tab's own colours.
var TH = (client.loom && client.loom.theme) || {};
var AME = TH.acc || "#b99be0";
var DEEP = TH.deep || "#5f4c80";
var TXT = TH.txt || "#e2ddea";
var MUTED = TH.muted || "#8a8496";
var RULE = TH.rule || "#2c2638";
var TRACK = TH.track || "#1d1926";
var BG = TH.bg || "#121018";
var HI = TH.hi || "#f1e8ff";
var EDGE = TH.edge || "#3a3446";
var DONE = "#7fdca0";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
// Black is drawn as a dark swatch with a pale rim so it stays visible on ink.
var nameCol = { black: "#a9a6b4", blue: "#7aa7e0", gold: "#d9b45a", green: "#6ec38a", red: "#e08a8a", silver: "#c3cbd5" };
var swCol = { black: "#18161c", blue: "#7aa7e0", gold: "#d9b45a", green: "#6ec38a", red: "#e08a8a", silver: "#c3cbd5" };
var heads = ["Bone", "Claw", "Eye", "Heart", "Leather", "Scale", "Tooth"];
var MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function n1(v) { return Math.round(v * 10) / 10; }
function fmtShort(sec) { var d = new Date(sec * 1000); return d.getDate() + " " + MN[d.getMonth()]; }
function fmtLong(sec) { var d = new Date(sec * 1000); return d.getDate() + " " + MN[d.getMonth()] + " " + d.getFullYear(); }
function thou(n) { var s = String(Math.round(n)); var o = ""; while (s.length > 3) { o = "," + s.slice(-3) + o; s = s.slice(0, -3); } return s + o; }
// Heat for "still needed": green when nearly there, warming to red when far.
function col(need, max) {
  if (need <= 0) { return DONE; }
  var r = need / max;
  if (r <= 0.25) { return DONE; }
  if (r <= 0.5) { return "#e6d27a"; }
  if (r <= 0.75) { return "#e0a76a"; }
  return "#e08a8a";
}
function swatch(c) { return '<span style="display:inline-block;width:8px;height:8px;background:' + swCol[c] + ';border:1px solid ' + (c === "black" ? "#6d6878" : swCol[c]) + ';margin-right:4px;vertical-align:-1px;"></span>'; }
function caps(tx, c) { return '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;color:' + (c || DEEP) + ';font-size:11px;margin:0 0 3px;">' + tx + '</div>'; }
function row(label, value, c) {
  return '<div style="display:flex;justify-content:space-between;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;"><span style="color:' + MUTED + ';white-space:nowrap;">' + label + '</span><span style="color:' + (c || TXT) + ';white-space:nowrap;">' + value + '</span></div>';
}
function box(inner, c) { return '<div style="flex:1 1 150px;min-width:150px;border-top:2px solid ' + (c || DEEP) + ';padding:3px 2px 0;">' + inner + '</div>'; }
function section(title, inner) { return '<div style="border-top:1px solid ' + RULE + ';margin-top:8px;padding-top:5px;">' + caps(title, AME) + inner + '</div>'; }
function quiet(tx) { return '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">' + tx + '</div>'; }

// A dragon's slit eye for the title, the talisman tab's counterpart of the coin stack.
var glyph = '<svg width="20" height="14" viewBox="0 0 20 14" style="vertical-align:-2px;margin-right:6px;" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M1 7 Q10 -1 19 7 Q10 15 1 7 Z" fill="' + DEEP + '" stroke="' + AME + '" stroke-width="0.9"/>' +
  '<ellipse cx="10" cy="7" rx="3.4" ry="4.6" fill="#d9b45a"/><ellipse cx="10" cy="7" rx="0.9" ry="4" fill="#15121b"/></svg>';
function header(title, right) {
  return '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">' +
    '<div style="font-family:' + SERIF + ';color:' + AME + ';font-size:14px;letter-spacing:0.22em;">' + glyph + title + '</div>' +
    '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;color:' + MUTED + ';font-size:11px;">' + right + '</div></div>';
}
var PANEL = '<div style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;">';

// ------------------------------------------------------------ the numbers ---
// Owned is capped per piece type, so 100 black claws still scores 64.
var goal = TP.goalTotal;
var owned = 0;
var perColour = {};
var grandC = 0, grandR = 0, coloursDone = 0;
var ci, ti;
for (ci = 0; ci < t.colors.length; ci++) {
  var cc = t.colors[ci];
  var own = 0, needC = 0;
  for (ti = 0; ti < t.commonTypes.length; ti++) {
    var gotC = t.getcount(cc, t.commonTypes[ti]);
    own += gotC > t.reqCommon ? t.reqCommon : gotC;
    needC += Math.max(0, t.reqCommon - gotC);
  }
  var gotR = t.getcount(cc, t.colorrare[cc]);
  own += gotR > t.reqRare ? t.reqRare : gotR;
  var needR = Math.max(0, t.reqRare - gotR);
  perColour[cc] = { own: own, needC: needC, needR: needR };
  owned += own;
  grandC += needC;
  grandR += needR;
  if (needC === 0 && needR === 0) { coloursDone++; }
}
var perColourGoal = t.reqCommon * t.commonTypes.length + t.reqRare;

// Pace from the history, over the trailing seven days.
var hs = TP.hist || [];
var rate = 0, etaT = 0;
if (hs.length >= 2) {
  var last = hs[hs.length - 1];
  var lastTot = last[1] + last[2];
  var cutoff = last[0] - 7 * 86400;
  var ref = hs[0];
  for (var hi = hs.length - 1; hi >= 0; hi--) { if (hs[hi][0] <= cutoff) { ref = hs[hi]; break; } }
  var spanD = (last[0] - ref[0]) / 86400;
  rate = spanD > 0 ? ((lastTot - (ref[1] + ref[2])) / spanD) : 0;
  if (rate > 0 && lastTot < goal) {
    var daysLeft = (goal - lastTot) / rate;
    if (daysLeft < 3650) { etaT = last[0] + Math.round(daysLeft * 86400); }
  }
}
function rateTxt(r) { return r < 1 ? String(Math.round(r * 100) / 100) : String(Math.round(r * 10) / 10); }

// ---------------------------------------------------------------- chart ---
// Nexus tabs take raw HTML but will not execute injected <script>, so the
// graph is drawn as static inline SVG and rebuilt on every sync.
function talChart(W, H) {
  var fs = Math.max(7, Math.min(10, Math.round(H * 0.08)));
  if (hs.length < 2) {
    return quiet("Two or more data points are needed. One point is stored per hour in which your totals change; TALPIECES SEED backdates a starting point.");
  }
  var first = hs[0];
  var lastP = hs[hs.length - 1];
  var lastT = lastP[1] + lastP[2];
  var x0 = Math.round(fs * 3.4), x1 = W - 6, y0 = Math.round(fs * 0.9), y1 = H - Math.round(fs * 1.9);

  // Give the projection at most 60% of the width, so a distant finish does
  // not squash the real data into the corner. Past that it leaves the frame
  // and the right-hand label carries the date instead.
  var tmin = first[0];
  var dataSpan = lastP[0] - tmin;
  if (dataSpan <= 0) { dataSpan = 3600; }
  var tmax = lastP[0];
  var clipped = false;
  if (etaT > lastP[0]) {
    var maxProj = dataSpan * 1.5;
    if ((etaT - lastP[0]) > maxProj) { tmax = lastP[0] + maxProj; clipped = true; }
    else { tmax = etaT; }
  }
  if (tmax <= tmin) { tmax = tmin + 3600; }
  function sx(v) { return x0 + ((v - tmin) / (tmax - tmin)) * (x1 - x0); }
  function sy(v) { return y1 - (v / goal) * (y1 - y0); }

  // Thin the series so a long history stays cheap to draw.
  var step = Math.ceil(hs.length / 300);
  var line = "";
  var k = 0, j;
  for (j = 0; j < hs.length; j += step) { line += (k === 0 ? "M" : "L") + n1(sx(hs[j][0])) + "," + n1(sy(hs[j][1] + hs[j][2])); k++; }
  line += "L" + n1(sx(lastP[0])) + "," + n1(sy(lastT));
  var area = line + "L" + n1(sx(lastP[0])) + "," + y1 + "L" + n1(sx(first[0])) + "," + y1 + "Z";

  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="display:block;height:auto;overflow:visible;" xmlns="http://www.w3.org/2000/svg">';
  // Gridlines at each quarter of the goal; the goal itself is dashed.
  for (var q = 0; q <= 4; q++) {
    var gv = goal * q / 4;
    var gy = n1(sy(gv));
    svg += '<line x1="' + x0 + '" y1="' + gy + '" x2="' + x1 + '" y2="' + gy + '" stroke="' + (q === 4 ? DEEP : RULE) + '" stroke-width="' + (q === 4 ? 0.9 : 0.6) + '"' + (q === 4 ? ' stroke-dasharray="3,2"' : "") + '/>';
    if (q === 0 || q === 2 || q === 4) {
      svg += '<text x="' + (x0 - 3) + '" y="' + n1(gy + fs * 0.35) + '" text-anchor="end" font-family="' + MONO + '" font-size="' + fs + '" fill="' + MUTED + '">' + thou(gv) + '</text>';
    }
  }
  svg += '<path d="' + area + '" fill="' + AME + '" fill-opacity="0.13" stroke="none"/>';
  if (etaT > 0) {
    var pEndT = clipped ? tmax : etaT;
    var pEndV = clipped ? (lastT + rate * ((tmax - lastP[0]) / 86400)) : goal;
    svg += '<path d="M' + n1(sx(lastP[0])) + ',' + n1(sy(lastT)) + 'L' + n1(sx(pEndT)) + ',' + n1(sy(pEndV)) + '" fill="none" stroke="' + DEEP + '" stroke-width="1.1" stroke-dasharray="3,3"/>';
  }
  svg += '<path d="' + line + '" fill="none" stroke="' + AME + '" stroke-width="1.5" stroke-linejoin="round"/>';
  svg += '<circle cx="' + n1(sx(lastP[0])) + '" cy="' + n1(sy(lastT)) + '" r="' + 2.4 + '" fill="' + HI + '"/>';
  // X labels: start on the left, projected finish on the right, latest in the
  // middle only when there is room for it without collisions.
  var lblGap = fs * 5;
  var ly = H - 3;
  svg += '<text x="' + x0 + '" y="' + ly + '" font-family="' + MONO + '" font-size="' + fs + '" fill="' + MUTED + '">' + fmtShort(first[0]) + '</text>';
  if (etaT > 0) {
    svg += '<text x="' + x1 + '" y="' + ly + '" text-anchor="end" font-family="' + MONO + '" font-size="' + fs + '" fill="' + AME + '">' + (clipped ? "&#8594; " : "") + fmtShort(etaT) + '</text>';
    var mx = sx(lastP[0]);
    if ((mx - x0) > lblGap && (x1 - mx) > lblGap) {
      svg += '<text x="' + n1(mx) + '" y="' + ly + '" text-anchor="middle" font-family="' + MONO + '" font-size="' + fs + '" fill="' + MUTED + '">' + fmtShort(lastP[0]) + '</text>';
    }
  } else {
    svg += '<text x="' + x1 + '" y="' + ly + '" text-anchor="end" font-family="' + MONO + '" font-size="' + fs + '" fill="' + MUTED + '">' + fmtShort(lastP[0]) + '</text>';
  }
  return svg + '</svg>';
}

// -------------------------------------------------------- headline block ---
var pct = goal > 0 ? Math.round(owned / goal * 1000) / 10 : 0;
function headline() {
  var out = '<div style="margin:6px 0 2px;"><span style="font-family:' + SERIF + ';font-size:26px;color:' + AME + ';">' + pct + '%</span> ';
  out += '<span style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:12px;">of the way &mdash; ' + thou(owned) + ' of ' + thou(goal) + ' pieces</span></div>';
  // One bar in six equal parts, each filled in its dragon's colour.
  out += '<div style="display:flex;gap:2px;height:7px;margin:2px 0 1px;">';
  for (var b = 0; b < t.colors.length; b++) {
    var c = t.colors[b];
    var fp = Math.min(100, perColour[c].own / perColourGoal * 100);
    out += '<div title="' + c + ' ' + Math.floor(fp) + '%" style="flex:1 1 0;background:' + TRACK + ';' + (c === "black" ? 'outline:1px solid ' + EDGE + ';' : '') + '"><div style="height:7px;width:' + n1(fp) + '%;background:' + swCol[c] + ';' + (c === "black" ? 'background:#4a4556;' : '') + '"></div></div>';
  }
  out += '</div>';
  out += '<div style="display:flex;gap:2px;color:' + MUTED + ';">';
  for (var b2 = 0; b2 < t.colors.length; b2++) {
    var c2 = t.colors[b2];
    var fp2 = Math.floor(Math.min(100, perColour[c2].own / perColourGoal * 100));
    out += '<span style="flex:1 1 0;text-align:center;' + (fp2 >= 100 ? 'color:' + DONE + ';' : '') + '">' + (fp2 >= 100 ? '&#10003;' : fp2 + '%') + '</span>';
  }
  return out + '</div>';
}

// -------------------------------------------------------------- the tab ---
var html = PANEL + header("TALISMANS", coloursDone + ' of ' + t.colors.length + ' colours done');
html += headline();

var cols = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
var nb = caps("Still needed", AME);
nb += '<div style="font-family:' + SERIF + ';font-size:16px;color:' + (grandC + grandR > 0 ? TXT : DONE) + ';">' + (grandC + grandR > 0 ? thou(grandC + grandR) + ' pieces' : 'nothing!') + '</div>';
nb += row("common", thou(grandC), grandC > 0 ? TXT : DONE);
nb += row("rare", String(grandR), grandR > 0 ? TXT : DONE);
cols += box(nb, AME);
var pb = caps("Pace, last 7 days", AME);
if (owned >= goal) {
  pb += '<div style="font-family:' + SERIF + ';font-size:16px;color:' + DONE + ';">complete</div>';
} else if (rate > 0) {
  pb += '<div style="font-family:' + SERIF + ';font-size:16px;color:' + TXT + ';">' + rateTxt(rate) + ' / day</div>';
  pb += row("finish", etaT > 0 ? '~' + fmtLong(etaT) : 'beyond ten years', etaT > 0 ? AME : MUTED);
} else {
  pb += quiet(hs.length < 2 ? "Not enough history yet." : "No gain in the last 7 days.");
}
cols += box(pb, DEEP);
html += cols + '</div>';

// The grid: pieces still needed, by colour and type.
var cell = 'text-align:right;padding:1px 0 1px 4px;';
var grid = '<table style="width:100%;border-collapse:collapse;font-family:' + MONO + ';font-size:10px;color:' + TXT + ';">';
grid += '<tr style="color:' + MUTED + ';font-family:' + SERIF + ';font-size:11px;font-variant:small-caps;letter-spacing:0.06em;border-bottom:1px solid ' + RULE + ';"><td style="padding:0 0 2px;">colour</td>';
for (var h2 = 0; h2 < heads.length; h2++) { grid += '<td style="' + cell + '" title="' + heads[h2] + '">' + heads[h2].substr(0, 2).toLowerCase() + '</td>'; }
grid += '<td style="' + cell + '">rare</td><td style="' + cell + '">need</td></tr>';
for (ci = 0; ci < t.colors.length; ci++) {
  var color = t.colors[ci];
  var P = perColour[color];
  var cells = '';
  for (ti = 0; ti < t.commonTypes.length; ti++) {
    var n = Math.max(0, t.reqCommon - t.getcount(color, t.commonTypes[ti]));
    cells += '<td style="' + cell + 'color:' + col(n, t.reqCommon) + ';">' + (n <= 0 ? '&#10003;' : String(n)) + '</td>';
  }
  var rare = t.colorrare[color];
  var rareCell = '<td style="' + cell + 'color:' + col(P.needR, t.reqRare) + ';white-space:nowrap;"><span style="color:' + MUTED + ';">' + esc(rare).substr(0, 4) + '</span> ' + (P.needR <= 0 ? '&#10003;' : String(P.needR)) + '</td>';
  var done = (P.needC === 0 && P.needR === 0);
  var totalCell = done ? '<td style="' + cell + 'color:' + DONE + ';font-family:' + SERIF + ';font-size:11px;font-variant:small-caps;letter-spacing:0.08em;">done</td>' : '<td style="' + cell + 'color:' + col(P.needC, t.reqCommon * 7) + ';">' + P.needC + '</td>';
  grid += '<tr style="border-bottom:1px dotted ' + RULE + ';"><td style="padding:1px 0;color:' + nameCol[color] + ';white-space:nowrap;">' + swatch(color) + color + '</td>' + cells + rareCell + totalCell + '</tr>';
}
grid += '</table>';
grid += '<div style="color:' + MUTED + ';margin-top:3px;font-family:' + SERIF + ';font-style:italic;">64 of each common and 4 of each rare, per colour. Run your in-game talisman list to rebuild from the game.</div>';
html += section("Pieces still needed", grid);

if (TP.graphOn) {
  html += section("Progress over time", talChart(640, TP.chartH));
  html += '<div style="color:' + MUTED + ';margin-top:5px;font-family:' + SERIF + ';font-style:italic;">Solid line: pieces counted toward the goal. Dashed: projection at the last seven days&rsquo; rate. TALPIECES RATE for figures, TALPIECES MARK to force a data point.</div>';
}
html += '</div>';

try { set_custom_tab_html("Talismans", html); } catch (e) {}
