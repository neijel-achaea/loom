// Draws the Level tab in the house style shared with Coffers: ink panel,
// serif small-caps headings, one large figure, monospace ledger rows.
// Nexus tabs will not run injected <script>, so charts are static inline SVG,
// redrawn whenever a new sample lands.
if (!client.loom || !client.loom.levelgraph || !client.loom.levelgraph.day) run_function("levelgraph_setup", [], "levelgraph");
var LG = client.loom.levelgraph;
var MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
// Tab theme (#310): loom's city palette when one is on, else this tab's own colours.
var TH = (client.loom && client.loom.theme) || {};
var ACC = TH.acc || "#8fbfe0";
var ACC2 = "#c8a2d8";
var DEEP = TH.deep || "#4d6f86";
var BRIGHT = TH.hi || "#e8f3fb";
var TXT = TH.txt || "#dde8ee";
var MUTED = TH.muted || "#7d8c96";
var RULE = TH.rule || "#26353e";
var TRACK = TH.track || "#1a252c";
var BG = TH.bg || "#0f1418";
var UP = "#8fe0c8";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";

function n1(n) { return Math.round(n * 10) / 10; }
function pad2(n) { return (n < 10 ? "0" : "") + n; }
function prog(p) { return p[1] + p[2] / 100; }
function dur(secs) {
  if (secs < 3600) { return Math.max(0, Math.round(secs / 60)) + "m"; }
  if (secs >= 86400) { return Math.round(secs / 86400 * 10) / 10 + "d"; }
  var h = Math.floor(secs / 3600);
  var m = Math.round((secs - h * 3600) / 60);
  return h + "h" + (m > 0 ? " " + m + "m" : "");
}
// dayScale is set by the pane, not inferred from the data span: the long-term
// pane must read as dates even on its first day, when it holds only hours.
function fmtT(sec, span, dayScale) {
  var d = new Date(sec * 1000);
  if (dayScale) {
    if (span < 300 * 86400) { return d.getDate() + " " + MN[d.getMonth()]; }
    return MN[d.getMonth()] + " " + d.getFullYear();
  }
  return d.getHours() + ":" + pad2(d.getMinutes());
}

function lvlChart(hs, W, H, accent, dayScale) {
  var fs = Math.max(7, Math.min(10, Math.round(H * 0.085)));
  var y0 = Math.round(fs * 0.9);
  var y1 = H - Math.round(fs * 1.9);
  var first = hs[0];
  var last = hs[hs.length - 1];
  var tmin = first[0];
  var tmax = last[0];
  if (tmax <= tmin) { tmax = tmin + 60; }
  var span = tmax - tmin;

  var vmin = 1e9, vmax = -1e9, i, v;
  for (i = 0; i < hs.length; i++) { v = prog(hs[i]); if (v < vmin) { vmin = v; } if (v > vmax) { vmax = v; } }
  if ((vmax - vmin) < 0.0005) { vmin -= 0.01; vmax += 0.01; }
  var padV = (vmax - vmin) * 0.12;
  vmin = Math.max(0, vmin - padV);
  vmax += padV;

  var steps = [0.001, 0.002, 0.005, 0.01, 0.02, 0.05, 0.1, 0.25, 0.5, 1, 2, 5, 10, 25, 50, 100];
  var stepv = steps[steps.length - 1];
  for (i = 0; i < steps.length; i++) { if ((vmax - vmin) / steps[i] <= 5) { stepv = steps[i]; break; } }
  var dp = stepv < 0.01 ? 3 : (stepv < 1 ? 2 : 0);

  var widest = 2;
  var probe = Math.ceil(vmin / stepv) * stepv;
  while (probe <= vmax) { widest = Math.max(widest, (dp === 0 ? String(Math.round(probe)) : probe.toFixed(dp)).length); probe += stepv; }
  var x0 = Math.round(widest * fs * 0.62) + 6;
  var x1 = W - 6;

  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="display:block;height:auto;overflow:visible;" xmlns="http://www.w3.org/2000/svg">';
  // Whole-level gridlines are drawn stronger: they are the boundaries crossed.
  var gv = Math.ceil(vmin / stepv) * stepv;
  while (gv <= vmax) {
    var gy = n1(y1 - ((gv - vmin) / (vmax - vmin)) * (y1 - y0));
    var whole = (Math.abs(gv - Math.round(gv)) < 0.0005);
    svg += '<line x1="' + x0 + '" y1="' + gy + '" x2="' + x1 + '" y2="' + gy + '" stroke="' + (whole ? DEEP : RULE) + '" stroke-width="' + (whole ? 0.9 : 0.6) + '"/>';
    svg += '<text x="' + (x0 - 3) + '" y="' + n1(gy + fs * 0.35) + '" text-anchor="end" font-family="' + MONO + '" font-size="' + fs + '" fill="' + MUTED + '">' + (dp === 0 ? String(Math.round(gv)) : gv.toFixed(dp)) + '</text>';
    gv += stepv;
  }
  var stride = Math.ceil(hs.length / 320);
  var line = "";
  var k = 0;
  for (i = 0; i < hs.length; i += stride) {
    line += (k === 0 ? "M" : "L") + n1(x0 + ((hs[i][0] - tmin) / (tmax - tmin)) * (x1 - x0)) + "," + n1(y1 - ((prog(hs[i]) - vmin) / (vmax - vmin)) * (y1 - y0));
    k++;
  }
  var lx = n1(x0 + ((last[0] - tmin) / (tmax - tmin)) * (x1 - x0));
  var ly = n1(y1 - ((prog(last) - vmin) / (vmax - vmin)) * (y1 - y0));
  line += "L" + lx + "," + ly;
  var area = line + "L" + lx + "," + y1 + "L" + x0 + "," + y1 + "Z";
  svg += '<path d="' + area + '" fill="' + accent + '" fill-opacity="0.13" stroke="none"/>';
  svg += '<path d="' + line + '" fill="none" stroke="' + accent + '" stroke-width="1.5" stroke-linejoin="round"/>';
  svg += '<circle cx="' + lx + '" cy="' + ly + '" r="2.4" fill="' + BRIGHT + '"/>';
  svg += '<text x="' + x0 + '" y="' + (H - 3) + '" font-family="' + MONO + '" font-size="' + fs + '" fill="' + MUTED + '">' + fmtT(first[0], span, dayScale) + '</text>';
  svg += '<text x="' + x1 + '" y="' + (H - 3) + '" text-anchor="end" font-family="' + MONO + '" font-size="' + fs + '" fill="' + MUTED + '">' + fmtT(last[0], span, dayScale) + '</text>';
  return svg + '</svg>';
}

// Ledger typography, matching Coffers.
function caps(t, col) { return '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;color:' + (col || DEEP) + ';font-size:11px;margin:0 0 2px;">' + t + '</div>'; }
function row(label, value, col) {
  return '<div style="display:flex;justify-content:space-between;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;"><span style="color:' + MUTED + ';white-space:nowrap;">' + label + '</span><span style="color:' + (col || TXT) + ';white-space:nowrap;">' + value + '</span></div>';
}
function box(inner, col) { return '<div style="flex:1 1 150px;min-width:150px;border-top:2px solid ' + (col || DEEP) + ';padding:3px 2px 0;">' + inner + '</div>'; }
function big(t, col) { return '<div style="font-family:' + SERIF + ';font-size:16px;color:' + col + ';">' + t + '</div>'; }
function section(title, inner, col) { return '<div style="border-top:1px solid ' + RULE + ';margin-top:8px;padding-top:5px;">' + caps(title, col) + inner + '</div>'; }
function quiet(t) { return '<div style="color:' + MUTED + ';">' + t + '</div>'; }

// A small rising-stair glyph for the title, the level-up counterpart of the coin stack.
var glyph = '<svg width="18" height="16" viewBox="0 0 18 16" style="vertical-align:-2px;margin-right:6px;" xmlns="http://www.w3.org/2000/svg">' +
  '<rect x="1" y="11" width="4" height="4" fill="' + DEEP + '"/><rect x="7" y="7" width="4" height="8" fill="' + ACC + '" fill-opacity="0.7"/>' +
  '<rect x="13" y="2" width="4" height="13" fill="' + ACC + '"/><path d="M13 1.5 L15 0 L17 1.5" fill="none" stroke="' + BRIGHT + '" stroke-width="0.8"/></svg>';

var mins = LG.min || [];
var days = LG.day || [];
var cur = null;
if (mins.length > 0) { cur = mins[mins.length - 1]; }
else if (days.length > 0) { cur = days[days.length - 1]; }

var html = '<div id="loom-levelgraph" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;">';
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
html += '<div style="font-family:' + SERIF + ';color:' + ACC + ';font-size:14px;letter-spacing:0.22em;">' + glyph + 'LEVEL</div>';

if (!cur) {
  html += '</div><div style="color:' + MUTED + ';margin-top:8px;font-family:' + SERIF + ';font-style:italic;">No samples yet. Play a little, or use LEVELGRAPH MARK.</div></div>';
} else {
  // Session figures (#335): gain since the session started, rate, and time
  // to level; the graph below keeps its own span.
  var sF = LG.sessFigures ? LG.sessFigures(cur) : null;
  var sSpan = sF ? sF.span : 0, sGain = sF ? sF.gain : 0, perHour = sF ? sF.perHour : 0, togo = sF ? sF.togo : -1;
  // Long-term figures: gain across the daily buffer.
  var lSpan = 0, lGain = 0, perDay = 0;
  if (days.length >= 2) {
    lSpan = days[days.length - 1][0] - days[0][0];
    lGain = prog(days[days.length - 1]) - prog(days[0]);
    if (lSpan > 0) { perDay = lGain / (lSpan / 86400); }
  }

  html += '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;color:' + DEEP + ';font-size:11px;">' + (togo > 0 ? 'next in ~' + dur(togo) : 'onward') + '</div></div>';

  html += '<div style="margin:6px 0 1px;"><span style="font-family:' + SERIF + ';font-size:26px;color:' + ACC + ';">' + cur[1] + '</span>';
  // Days at this level: walk the day buffer back while the level matches. If
  // the walk reaches the start of the buffer, the true figure may be longer.
  var atLvl = "";
  if (days.length > 0) {
    var dj = days.length - 1;
    while (dj > 0 && days[dj - 1][1] === cur[1]) { dj--; }
    var dFrom = new Date(days[dj][0] * 1000);
    dFrom.setHours(0, 0, 0, 0);
    var dNow = new Date();
    dNow.setHours(0, 0, 0, 0);
    var nDays = Math.round((dNow.getTime() - dFrom.getTime()) / 86400000);
    var known = (dj > 0 && days[dj - 1][1] < cur[1]);
    if (known) { atLvl = nDays === 0 ? "reached today" : (nDays + (nDays === 1 ? " day" : " days") + " at this level"); }
    else { atLvl = nDays > 0 ? (nDays + "+ days at this level") : "at this level since tracking began"; }
  }
  html += ' <span style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:12px;">' + atLvl + '</span></div>';
  html += '<div style="background:' + TRACK + ';height:6px;width:100%;margin:2px 0 1px;"><div style="background:' + ACC + ';height:6px;width:' + n1(cur[2]) + '%;"></div></div>';
  html += '<div style="display:flex;justify-content:space-between;color:' + MUTED + ';"><span>' + cur[2].toFixed(2) + '% done</span><span>' + (100 - cur[2]).toFixed(2) + '% to go</span></div>';

  var cols = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
  var sb = caps("This session", ACC);
  if (sF && sSpan >= 60) {
    sb += big((sGain >= 0 ? "+" : "") + (Math.round(sGain * 10000) / 100) + "%", sGain > 0 ? UP : MUTED);
    sb += row("length", dur(sSpan));
    sb += row("per hour", perHour > 0 ? (Math.round(perHour * 10000) / 100) + "%" : "&hellip;", perHour > 0 ? UP : MUTED);
    sb += row("started at", sF.p0.toFixed(2));
  } else {
    sb += quiet("Just started; figures after a minute. LEVELGRAPH NEW starts a new session.");
  }
  cols += box(sb, ACC);

  var lb = caps("Long term", ACC2);
  if (lSpan > 0) {
    lb += big((lGain >= 0 ? "+" : "") + (Math.round(lGain * 100) / 100) + " lv", lGain > 0 ? ACC2 : MUTED);
    lb += row("window", dur(lSpan));
    lb += row("per day", perDay > 0 ? (Math.round(perDay * 100) / 100) + " lv" : "&hellip;", perDay > 0 ? ACC2 : MUTED);
    lb += row("started at", prog(days[0]).toFixed(2));
  } else {
    lb += quiet("Collecting; one point is kept per day.");
  }
  cols += box(lb, ACC2);
  html += cols + '</div>';

  if (LG.graphSess) {
    html += section("Last " + LG.mins + " minutes", mins.length < 2 ? quiet("Collecting. A point lands every minute that your experience moves.") : lvlChart(mins, 640, LG.chartH, ACC, false), ACC);
  }
  if (LG.graphLong) {
    html += section("Last " + LG.days + " days", days.length < 2 ? quiet("Collecting. One point is kept per day.") : lvlChart(days, 640, LG.chartH, ACC2, true), ACC2);
  }
  html += '</div>';
}

// The whole tab in the panel's colour (#355), as Self and Comms do: the
// panel fills the tab, and the tab itself takes the colour while it resizes.
try {
  var lvSt = document.getElementById("loom-levelgraph-style");
  if (!lvSt) { lvSt = document.createElement("style"); lvSt.id = "loom-levelgraph-style"; document.head.appendChild(lvSt); }
  var lvCss = '.flexlayout__tab:has(#loom-levelgraph) { background: ' + BG + ' !important; } .flexlayout__tab:has(#loom-levelgraph) > * { min-height: 100%; }';
  if (lvSt.textContent !== lvCss) lvSt.textContent = lvCss;
} catch (e) {}
try { set_custom_tab_html("Level", html); } catch (e) {}