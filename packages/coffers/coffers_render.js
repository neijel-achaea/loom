// Draws the Coffers tab. Nexus tabs will not run injected <script>, so every
// chart is static inline SVG, redrawn whenever the tick changes something.
if (!client.loom || !client.loom.coffers || !client.loom.coffers.f) run_function("coffers_setup", [], "coffers");
var CO = client.loom.coffers;
var F = CO.f;
var GOLD = "#e2bd5a";
var BRONZE = "#9c7330";
var TXT = "#e9dfc6";
var MUTED = "#8c8170";
var RULE = "#3a3122";
var UP = "#93cf8a";
var DOWN = "#de8a72";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
var now = Math.floor(new Date().getTime() / 1000);

function n1(n) { return Math.round(n * 10) / 10; }
function niceStep(range) {
  var raw = range / 4;
  if (raw <= 0) { raw = 1; }
  var mag = Math.pow(10, Math.floor(Math.log(raw) / Math.LN10));
  var m = [1, 2, 2.5, 5, 10];
  for (var i = 0; i < m.length; i++) { if (mag * m[i] >= raw) { return Math.max(1, mag * m[i]); } }
  return Math.max(1, mag * 10);
}
function axisLbl(v, step) {
  if (Math.abs(v) >= 1000000) { return (v / 1000000).toFixed(step >= 1000000 ? 0 : (step >= 100000 ? 1 : 2)) + "M"; }
  return F.n(v);
}
function wealth(p) { return p[1] + p[2]; }
function color(v) { return v > 0 ? UP : (v < 0 ? DOWN : MUTED); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/'/g, "&#39;"); }

// A chart frame is plain data; sy/sx take it as their first argument.
function frame(W, H, vmin, vmax, step, tmin, tmax) {
  var fs = Math.max(7, Math.min(10, Math.round(H * 0.085)));
  var widest = 2;
  var probe = Math.ceil(vmin / step) * step;
  while (probe <= vmax) { widest = Math.max(widest, axisLbl(probe, step).length); probe += step; }
  if (tmax <= tmin) { tmax = tmin + 60; }
  return { W: W, H: H, fs: fs, x0: Math.round(widest * fs * 0.62) + 6, x1: W - 6, y0: Math.round(fs * 0.9), y1: H - Math.round(fs * 1.9), vmin: vmin, vmax: vmax, step: step, tmin: tmin, tmax: tmax };
}
function sy(fr, v) { return fr.y1 - ((v - fr.vmin) / (fr.vmax - fr.vmin)) * (fr.y1 - fr.y0); }
function sx(fr, t) { return fr.x0 + ((t - fr.tmin) / (fr.tmax - fr.tmin)) * (fr.x1 - fr.x0); }
function grid(fr) {
  var out = "";
  var gv = Math.ceil(fr.vmin / fr.step) * fr.step;
  while (gv <= fr.vmax) {
    var gy = n1(sy(fr, gv));
    out += '<line x1="' + fr.x0 + '" y1="' + gy + '" x2="' + fr.x1 + '" y2="' + gy + '" stroke="' + (gv === 0 ? BRONZE : RULE) + '" stroke-width="' + (gv === 0 ? 0.9 : 0.6) + '"/>';
    out += '<text x="' + (fr.x0 - 3) + '" y="' + n1(gy + fr.fs * 0.35) + '" text-anchor="end" font-family="' + MONO + '" font-size="' + fr.fs + '" fill="' + MUTED + '">' + axisLbl(gv, fr.step) + '</text>';
    gv += fr.step;
  }
  return out;
}
function xLabels(fr, a, b) {
  var y = fr.H - 3;
  return '<text x="' + fr.x0 + '" y="' + y + '" font-family="' + MONO + '" font-size="' + fr.fs + '" fill="' + MUTED + '">' + a + '</text>' +
    '<text x="' + fr.x1 + '" y="' + y + '" text-anchor="end" font-family="' + MONO + '" font-size="' + fr.fs + '" fill="' + MUTED + '">' + b + '</text>';
}
function svgOpen(W, H) { return '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="display:block;height:auto;overflow:visible;" xmlns="http://www.w3.org/2000/svg">'; }

// Wealth line (gold + bank) with a soft gold fill; optional dashed marker,
// used to show where the current session began.
function wealthChart(hs, W, H, dayScale, markT) {
  var first = hs[0];
  var last = hs[hs.length - 1];
  var vmin = 1e15, vmax = -1e15, i, v;
  for (i = 0; i < hs.length; i++) { v = wealth(hs[i]); if (v < vmin) { vmin = v; } if (v > vmax) { vmax = v; } }
  if (vmax - vmin < 20) { vmin -= 10; vmax += 10; }
  var pad = (vmax - vmin) * 0.12;
  vmin = Math.max(0, vmin - pad);
  vmax += pad;
  var fr = frame(W, H, vmin, vmax, niceStep(vmax - vmin), first[0], last[0]);
  var stride = Math.ceil(hs.length / 320);
  var line = "";
  var k = 0;
  for (i = 0; i < hs.length; i += stride) { line += (k === 0 ? "M" : "L") + n1(sx(fr, hs[i][0])) + "," + n1(sy(fr, wealth(hs[i]))); k++; }
  line += "L" + n1(sx(fr, last[0])) + "," + n1(sy(fr, wealth(last)));
  var area = line + "L" + n1(sx(fr, last[0])) + "," + fr.y1 + "L" + n1(sx(fr, first[0])) + "," + fr.y1 + "Z";
  var out = svgOpen(W, H) + grid(fr);
  out += '<path d="' + area + '" fill="' + GOLD + '" fill-opacity="0.13" stroke="none"/>';
  if (markT && markT > fr.tmin && markT < fr.tmax) {
    var mx = n1(sx(fr, markT));
    out += '<line x1="' + mx + '" y1="' + fr.y0 + '" x2="' + mx + '" y2="' + fr.y1 + '" stroke="' + BRONZE + '" stroke-width="0.8" stroke-dasharray="2,2"/>';
  }
  out += '<path d="' + line + '" fill="none" stroke="' + GOLD + '" stroke-width="1.5" stroke-linejoin="round"/>';
  out += '<circle cx="' + n1(sx(fr, last[0])) + '" cy="' + n1(sy(fr, wealth(last))) + '" r="2.4" fill="#fff1b8"/>';
  out += xLabels(fr, dayScale ? F.date(first[0]) : F.hm(first[0]), dayScale ? F.date(last[0]) : F.hm(last[0]));
  return out + '</svg>';
}

// Small typographic helpers for the ledger blocks.
function caps(t, col) { return '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;color:' + (col || BRONZE) + ';font-size:11px;margin:0 0 2px;">' + t + '</div>'; }
function row(label, value, col) {
  return '<div style="display:flex;justify-content:space-between;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;"><span style="color:' + MUTED + ';white-space:nowrap;">' + label + '</span><span style="color:' + (col || TXT) + ';white-space:nowrap;">' + value + '</span></div>';
}
function bar(pct, col, h) {
  pct = Math.max(0, Math.min(100, pct));
  return '<div style="background:#2a2318;height:' + h + 'px;width:100%;margin:2px 0;"><div style="background:' + col + ';height:' + h + 'px;width:' + n1(pct) + '%;"></div></div>';
}
function box(inner) { return '<div style="flex:1 1 130px;min-width:130px;border-top:2px solid ' + BRONZE + ';padding:3px 2px 0;">' + inner + '</div>'; }
function section(title, inner) { return '<div style="border-top:1px solid ' + RULE + ';margin-top:8px;padding-top:5px;">' + caps(title) + inner + '</div>'; }

var coins = '<svg width="20" height="17" viewBox="0 0 20 17" style="vertical-align:-3px;margin-right:6px;" xmlns="http://www.w3.org/2000/svg">' +
  '<ellipse cx="10" cy="13.5" rx="8.5" ry="2.8" fill="' + BRONZE + '"/><ellipse cx="10" cy="12" rx="8.5" ry="2.8" fill="' + GOLD + '" stroke="' + BRONZE + '" stroke-width="0.6"/>' +
  '<ellipse cx="10" cy="9" rx="8.5" ry="2.8" fill="' + BRONZE + '"/><ellipse cx="10" cy="7.5" rx="8.5" ry="2.8" fill="' + GOLD + '" stroke="' + BRONZE + '" stroke-width="0.6"/>' +
  '<ellipse cx="10" cy="4.5" rx="8.5" ry="2.8" fill="' + BRONZE + '"/><ellipse cx="10" cy="3" rx="8.5" ry="2.8" fill="#f3d781" stroke="' + BRONZE + '" stroke-width="0.6"/></svg>';

var mins = CO.min || [];
var days = CO.days || [];
var L = CO.live || {};
var g, b;
if (L.gold !== undefined && L.bank !== undefined) { g = L.gold; b = L.bank; }
else if (mins.length > 0) { g = mins[mins.length - 1][1]; b = mins[mins.length - 1][2]; }
else if (days.length > 0) { g = days[days.length - 1][1]; b = days[days.length - 1][2]; }

var html = '<div style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:#16120b;border:1px solid ' + RULE + ';padding:7px 8px 8px;">';
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + BRONZE + ';padding-bottom:3px;">';
html += '<div style="font-family:' + SERIF + ';color:' + GOLD + ';font-size:14px;letter-spacing:0.22em;">' + coins + 'COFFERS</div>';

if (g === undefined) {
  html += '</div><div style="color:' + MUTED + ';margin-top:8px;font-family:' + SERIF + ';font-style:italic;">The ledger is empty. It fills itself the moment the game reports your purse; try SCORE or a quick deposit if nothing appears.</div></div>';
} else {
  var W = g + b;
  var T = CO.tiers;
  var ti = F.tier(W);
  html += '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;color:' + BRONZE + ';font-size:11px;">' + esc(T[ti][1]) + '</div></div>';

  // The fortune itself, set large in the serif: this is the number that matters.
  html += '<div style="margin:6px 0 1px;"><span style="font-family:' + SERIF + ';font-size:26px;color:' + GOLD + ';letter-spacing:0.02em;">' + F.n(W) + '</span>';
  html += ' <span style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:12px;">gold sovereigns</span></div>';
  var handPct = W > 0 ? g / W * 100 : 0;
  html += '<div style="display:flex;height:6px;width:100%;margin:2px 0 1px;background:#2a2318;"><div style="background:' + GOLD + ';width:' + n1(handPct) + '%;"></div><div style="background:' + BRONZE + ';width:' + n1(100 - handPct) + '%;"></div></div>';
  html += '<div style="display:flex;justify-content:space-between;color:' + MUTED + ';"><span><span style="color:' + GOLD + ';">&#9632;</span> ' + F.n(g) + ' in the purse</span><span>' + F.n(b) + ' in the bank <span style="color:' + BRONZE + ';">&#9632;</span></span></div>';

  // Next tier, and the personal goal if one is set.
  if (ti < T.length - 1) {
    var lo = T[ti][0], hi = T[ti + 1][0];
    var tp = (W - lo) / (hi - lo) * 100;
    html += '<div style="margin-top:6px;display:flex;justify-content:space-between;"><span style="color:' + MUTED + ';">next: <span style="font-family:' + SERIF + ';color:' + TXT + ';">' + esc(T[ti + 1][1]) + '</span> at ' + F.k(hi) + '</span><span style="color:' + TXT + ';">' + F.n(hi - W) + ' to go</span></div>';
    html += bar(tp, BRONZE, 3);
  }
  if (CO.goal > 0 && CO.goalBase >= 0) {
    var gEarn = W - CO.goalBase;
    var gp = gEarn / CO.goal * 100;
    html += '<div style="margin-top:3px;display:flex;justify-content:space-between;"><span style="color:' + MUTED + ';">goal ' + F.s(CO.goal) + ' since ' + F.date(CO.goalT) + '</span><span style="color:' + (gp >= 100 ? UP : color(gEarn)) + ';">' + (gp >= 100 ? "reached! " + F.s(gEarn) : F.s(gEarn) + " &middot; " + Math.max(0, Math.floor(gp)) + "%") + '</span></div>';
    html += bar(gp, gp >= 100 ? UP : GOLD, 3);
  }

  // Three ledger columns: this session, today, and the all-time records.
  var S = CO.sess;
  var R = CO.rec || {};
  var cols = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
  var sb = caps("This session");
  if (S) {
    var sDur = Math.max(0, S.last - S.s);
    var sNet = S.inn - S.out;
    sb += '<div style="font-family:' + SERIF + ';font-size:16px;color:' + color(sNet) + ';">' + F.s(sNet) + '</div>';
    sb += row("since", F.hm(S.s) + " &middot; " + F.dur(sDur));
    sb += row("in", F.n(S.inn), S.inn > 0 ? UP : TXT);
    sb += row("out", F.n(S.out), S.out > 0 ? DOWN : TXT);
    sb += row("per hour", sDur >= 600 ? F.s(Math.round(sNet / (sDur / 3600))) : "&hellip;", sDur >= 600 ? color(sNet) : MUTED);
    if (S.big > 0) { sb += row("best haul", F.s(S.big), GOLD); }
  } else {
    sb += '<div style="color:' + MUTED + ';">No session open.</div>';
  }
  cols += box(sb);

  var today = (days.length > 0 && F.dayKey(days[days.length - 1][0]) === F.dayKey(now)) ? days[days.length - 1] : null;
  var tb = caps("Today");
  var tIn = today ? (today[3] || 0) : 0;
  var tOut = today ? (today[4] || 0) : 0;
  var tNet = tIn - tOut;
  tb += '<div style="font-family:' + SERIF + ';font-size:16px;color:' + color(tNet) + ';">' + F.s(tNet) + '</div>';
  tb += row("date", F.date(now));
  tb += row("in", F.n(tIn), tIn > 0 ? UP : TXT);
  tb += row("out", F.n(tOut), tOut > 0 ? DOWN : TXT);
  if (R.bestDay && R.bestDay.net > 0) {
    if (tNet > R.bestDay.net) { tb += '<div style="color:' + GOLD + ';font-family:' + SERIF + ';font-style:italic;margin-top:2px;">&#9733; record day in the making</div>'; }
    else { tb += row("to beat", F.n(R.bestDay.net), MUTED); }
  }
  cols += box(tb);

  var rb = caps("Records");
  if (R.peak) { rb += row("peak fortune", F.n(R.peak.w), GOLD); }
  rb += row("best day", R.bestDay ? "<span title='" + F.date(R.bestDay.t) + "'>" + F.s(R.bestDay.net) + "</span>" : "&mdash;", R.bestDay ? UP : MUTED);
  rb += row("best session", R.bestSess ? "<span title='" + F.date(R.bestSess.s) + ", " + F.dur(R.bestSess.dur) + "'>" + F.s(R.bestSess.net) + "</span>" : "&mdash;", R.bestSess ? UP : MUTED);
  rb += row("sessions kept", String((CO.sessions || []).length));
  cols += box(rb);
  html += cols + '</div>';

  if (CO.graphSess) {
    if (mins.length < 2) {
      html += section("Last " + CO.mins + " minutes", '<div style="color:' + MUTED + ';">Collecting; a point lands every minute.</div>');
    } else {
      html += section("Last " + CO.mins + " minutes", wealthChart(mins, 640, CO.chartH, false, S ? S.s : 0));
    }
  }
  if (CO.graphLong) {
    if (days.length < 2) {
      html += section("Day by day", '<div style="color:' + MUTED + ';">Collecting; one entry per day. The graph appears from the second day.</div>');
    } else {
      var lSpan = (days[days.length - 1][0] - days[0][0]) / 86400;
      var lGain = wealth(days[days.length - 1]) - wealth(days[0]);
      var note = '<div style="color:' + MUTED + ';margin:2px 0 4px;">fortune over ' + Math.max(1, Math.round(lSpan)) + 'd: <span style="color:' + color(lGain) + ';">' + F.s(lGain) + '</span>' + (lSpan >= 1 ? ' &middot; ' + F.s(Math.round(lGain / lSpan)) + '/day' : '') + '</div>';
      html += section("Day by day", note + wealthChart(days, 640, CO.chartH, true, 0));
    }
  }
  html += '</div>';
}

try { set_custom_tab_html("Coffers", html); } catch (e) {}