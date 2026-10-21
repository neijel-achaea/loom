if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
var FS = client.loom.fishingstats;
// Draws the 'fishinglog' tab: filed sessions and all-time totals.
// House style shared in spirit with Coffers, Level and Ledger: ink panel,
// serif small-caps headings, one large figure, monospace ledger rows.
// Tab theme (#310): loom's city palette when one is on, else this tab's own colours.
var TH = (client.loom && client.loom.theme) || {};
var WATER = TH.acc || "#7fd0c0";
var DEEP = TH.deep || "#3f7a72";
var CATCH = "#e6d27a";
var TXT = TH.txt || "#dbe8e4";
var MUTED = TH.muted || "#7f8f8b";
var RULE = TH.rule || "#20312d";
var TRACK = TH.track || "#17241f";
var BG = TH.bg || "#0d1514";
var HI = TH.hi || "#ffffff";
var RECORD = "#b8d88a";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";

function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function pad2(n) { return (n < 10 ? "0" : "") + n; }
function clock(t) { var d = new Date(t * 1000); return d.getHours() + ":" + pad2(d.getMinutes()); }
function dur(secs) {
  if (secs < 60) { return secs + "s"; }
  if (secs < 3600) { return Math.round(secs / 60) + "m"; }
  var h = Math.floor(secs / 3600);
  var m = Math.round((secs - h * 3600) / 60);
  return h + "h" + (m > 0 ? " " + m + "m" : "");
}
function wt(oz) {
  oz = Math.round(oz);
  var lb = Math.floor(oz / 16);
  var o = oz % 16;
  if (lb === 0) { return o + "oz"; }
  return lb + "lb" + (o > 0 ? " " + o + "oz" : "");
}
// House typography, shared in spirit (not in code) with Coffers, Level and Ledger.
function caps(t, col) { return '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;color:' + (col || DEEP) + ';font-size:11px;margin:0 0 3px;">' + t + '</div>'; }
function row(label, value, col) {
  return '<div style="display:flex;justify-content:space-between;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;"><span style="color:' + MUTED + ';white-space:nowrap;">' + label + '</span><span style="color:' + (col || TXT) + ';white-space:nowrap;">' + value + '</span></div>';
}
function box(inner, col) { return '<div style="flex:1 1 150px;min-width:150px;border-top:2px solid ' + (col || DEEP) + ';padding:3px 2px 0;">' + inner + '</div>'; }
function section(title, inner, extra) { return '<div style="border-top:1px solid ' + RULE + ';margin-top:8px;padding-top:5px;">' + caps(title + (extra || ""), WATER) + inner + '</div>'; }
function quiet(t) { return '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">' + t + '</div>'; }
function swatch(c) { return '<span style="display:inline-block;width:8px;height:8px;background:' + c + ';margin-right:4px;vertical-align:0;"></span>'; }

// A small leaping fish over a ripple, the fishing tabs' counterpart of the coin stack.
var glyph = '<svg width="20" height="16" viewBox="0 0 20 16" style="vertical-align:-3px;margin-right:6px;" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M3 9 C6 3.5 12 3 15.5 6.5 C12 9.5 6 10 3 9 Z" fill="' + WATER + '"/>' +
  '<path d="M15 6.3 L19 3.5 L18.2 7 L19 10 Z" fill="' + WATER + '"/><circle cx="6" cy="7.2" r="0.8" fill="' + BG + '"/>' +
  '<path d="M1 13.5 Q4 12 7 13.5 T13 13.5 T19 13.5" fill="none" stroke="' + DEEP + '" stroke-width="1"/></svg>';
function header(title, right) {
  return '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">' +
    '<div style="font-family:' + SERIF + ';color:' + WATER + ';font-size:14px;letter-spacing:0.22em;">' + glyph + title + '</div>' +
    '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;color:' + DEEP + ';font-size:11px;">' + right + '</div></div>';
}
function hero(num, tail) {
  return '<div style="margin:6px 0 2px;"><span style="font-family:' + SERIF + ';font-size:26px;color:' + WATER + ';">' + num + '</span> ' +
    '<span style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:12px;">' + tail + '</span></div>';
}
var PANEL = '<div id="loom-fishinglog" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;">';

var log = FS.log || [];
var pal = FS.palette;

function stamp(t) {
  if (!t || isNaN(Number(t))) { return "undated"; }
  var MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var d = new Date(t * 1000);
  return d.getDate() + " " + MN[d.getMonth()] + " " + d.getHours() + ":" + pad2(d.getMinutes());
}
var perAngler = {};
var curL = null;
function byTotal(a, b) { return perAngler[b][0] - perAngler[a][0]; }
function bySessionCount(a, b) { return curL.ang[b][0] - curL.ang[a][0]; }

var html = PANEL;
if (log.length === 0) {
  html += header("FISHING LOG", "0 sessions");
  html += quiet("No sessions filed yet. A session is filed automatically after " + FS.gap + " minutes idle, or on demand with FISHINGSTATS END.");
} else {
  // Aggregate across everything logged.
  var tn = 0, toz = 0, tsec = 0, trec = 0, tnTimed = 0;
  var bestOz = 0, bestSp = "", bestWho = "";
  var perSpecies = {};
  var i, k;
  for (i = 0; i < log.length; i++) {
    var L = log[i];
    tn += L.n;
    toz += L.oz || 0;
    // Older entries can lack a start or end time; count only the sound ones.
    var lsec = Number(L.e) - Number(L.s);
    if (!isNaN(lsec) && lsec > 0) { tsec += lsec; tnTimed += L.n; }
    trec += L.rec || 0;
    for (k in L.ang) {
      if (L.ang.hasOwnProperty(k)) {
        if (!perAngler[k]) { perAngler[k] = [0, 0, 0, ""]; }
        perAngler[k][0] += L.ang[k][0];
        perAngler[k][1] += L.ang[k][1];
        if (L.ang[k][2] > perAngler[k][2]) { perAngler[k][2] = L.ang[k][2]; perAngler[k][3] = L.ang[k][5] || ""; }
        if (L.ang[k][2] > bestOz) { bestOz = L.ang[k][2]; bestWho = k; bestSp = L.ang[k][5] || ""; }
      }
    }
    for (k in L.sp) { if (L.sp.hasOwnProperty(k)) { perSpecies[k] = (perSpecies[k] || 0) + L.sp[k][0]; } }
  }
  var spCount = 0;
  for (k in perSpecies) { if (perSpecies.hasOwnProperty(k)) { spCount += 1; } }

  html += header("FISHING LOG", log.length + " session" + (log.length === 1 ? "" : "s"));
  html += hero(String(tn), "fish landed" + (tsec > 0 ? " over " + dur(tsec) : "") + (toz > 0 ? ", " + wt(toz) + " in all" : ""));

  var cols = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
  var tb = caps("All sessions", WATER);
  tb += row("time fished", dur(tsec));
  tb += row("per hour", tsec > 0 ? String(Math.round(tnTimed / (tsec / 3600) * 10) / 10) : "&hellip;", WATER);
  tb += row("species seen", String(spCount));
  if (trec > 0) { tb += row("rankings beaten", String(trec), RECORD); }
  cols += box(tb, WATER);
  var bb = caps("Biggest ever", CATCH);
  if (bestOz > 0) {
    bb += '<div style="font-family:' + SERIF + ';font-size:16px;color:' + CATCH + ';">' + wt(bestOz) + '</div>';
    bb += row("species", esc(bestSp));
    bb += row("by", esc(bestWho), bestWho === FS.me ? HI : TXT);
  } else {
    bb += quiet("Nothing weighed yet.");
  }
  cols += box(bb, CATCH);
  html += cols + '</div>';

  var an = [];
  for (k in perAngler) { if (perAngler.hasOwnProperty(k)) { an.push(k); } }
  an.sort(byTotal);
  var tot = "";
  var maxA = an.length > 0 ? perAngler[an[0]][0] : 0;
  for (i = 0; i < an.length; i++) {
    var colour = FS.col[an[i]] || pal[i % pal.length];
    var pa = perAngler[an[i]];
    var pct = maxA > 0 ? Math.round(pa[0] / maxA * 100) : 0;
    tot += '<div style="display:flex;align-items:center;gap:6px;margin-top:2px;">';
    tot += '<span style="width:76px;color:' + (an[i] === FS.me ? HI : TXT) + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + swatch(colour) + esc(an[i]) + '</span>';
    tot += '<span style="flex:1;background:' + TRACK + ';height:6px;"><span style="display:block;background:' + colour + ';height:6px;width:' + pct + '%;"></span></span>';
    tot += '<span style="width:108px;text-align:right;color:' + TXT + ';white-space:nowrap;">' + pa[0] + ' <span style="color:' + MUTED + ';">&middot; ' + wt(pa[1]) + '</span></span></div>';
  }
  html += section("Anglers, all time", tot);

  // One entry per session, newest first.
  var sb = "";
  for (i = log.length - 1; i >= 0; i--) {
    var L2 = log[i];
    curL = L2;
    sb += '<div style="border-bottom:1px dotted ' + RULE + ';padding:2px 0 5px;margin:0 0 3px;">';
    sb += '<div style="display:flex;justify-content:space-between;align-items:baseline;">';
    sb += '<span style="font-family:' + SERIF + ';color:' + TXT + ';font-size:12px;">' + stamp(L2.s) + '</span>';
    sb += '<span style="color:' + TXT + ';">' + L2.n + ' <span style="color:' + MUTED + ';">&middot; ' + (isNaN(Number(L2.e) - Number(L2.s)) ? '?' : dur(L2.e - L2.s)) + ' &middot; ' + wt(L2.oz || 0) + '</span></span></div>';
    var meta = [];
    if (L2.ar) { meta.push('<span style="color:' + WATER + ';">' + esc(L2.ar) + '</span>'); }
    if (L2.y) { meta.push(L2.y + ' AF'); }
    if (L2.ft) { meta.push('avg cast ' + L2.ft + 'ft'); }
    if (L2.rec) { meta.push('<span style="color:' + RECORD + ';">' + L2.rec + ' ranking' + (L2.rec === 1 ? "" : "s") + ' beaten</span>'); }
    if (meta.length > 0) { sb += '<div style="color:' + MUTED + ';">' + meta.join(' &middot; ') + '</div>'; }

    var names = [];
    for (k in L2.ang) { if (L2.ang.hasOwnProperty(k)) { names.push(k); } }
    names.sort(bySessionCount);
    var maxN = names.length > 0 ? L2.ang[names[0]][0] : 0;
    var j;
    for (j = 0; j < names.length; j++) {
      var A = L2.ang[names[j]];
      var colour2 = FS.col[names[j]] || pal[j % pal.length];
      var pc = maxN > 0 ? Math.round((A[0] / maxN) * 100) : 0;
      var lostN = (A[4] || 0) - A[0];
      sb += '<div style="display:flex;align-items:center;gap:6px;margin-top:2px;">';
      sb += '<span style="width:76px;color:' + (names[j] === FS.me ? HI : TXT) + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(names[j]) + '</span>';
      sb += '<span style="flex:1;background:' + TRACK + ';height:5px;"><span style="display:block;background:' + colour2 + ';height:5px;width:' + pc + '%;"></span></span>';
      sb += '<span style="width:108px;text-align:right;color:' + MUTED + ';white-space:nowrap;"><span style="color:' + TXT + ';">' + A[0] + '</span> &middot; ' + wt(A[1]) + (lostN > 0 ? ' &middot; ' + lostN + ' lost' : '') + '</span></div>';
    }
    sb += '</div>';
  }
  html += section("Sessions", sb);
}
html += '</div>';

// The whole tab in the panel's colour (#355), as Self and Comms do: the
// panel fills the tab, and the tab itself takes the colour while it resizes.
try {
  var flSt = document.getElementById("loom-fishinglog-style");
  if (!flSt) { flSt = document.createElement("style"); flSt.id = "loom-fishinglog-style"; document.head.appendChild(flSt); }
  var flCss = '.flexlayout__tab:has(#loom-fishinglog) { background: ' + BG + ' !important; } .flexlayout__tab:has(#loom-fishinglog) > * { min-height: 100%; }';
  if (flSt.textContent !== flCss) flSt.textContent = flCss;
} catch (e) {}
try { set_custom_tab_html("fishinglog", html); } catch (e) {}