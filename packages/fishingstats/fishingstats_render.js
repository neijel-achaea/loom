if (!client.loom || !client.loom.fishingstats || !client.loom.fishingstats.session) run_function("fishingstats_setup", [], "fishingstats");
var FS = client.loom.fishingstats;
// Draws the 'fishingstats' tab: the live session.
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
var PANEL = '<div id="loom-fishingstats" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;">';

var s = FS.session;
var pal = FS.palette;
var rec = FS.rec.f;

// Ranking rows truncate long names, so a stored key that prefixes the caught
// species counts as the same fish.
function recFor(sp) {
  if (rec[sp]) { return rec[sp]; }
  var k;
  for (k in rec) {
    if (rec.hasOwnProperty(k) && k.length > 3 && sp.indexOf(k) === 0) { return rec[k]; }
  }
  return null;
}
// One angler: name and count over a bar in their colour, details beneath.
function barRow(label, right, note, value, max, colour, me) {
  var pct = max > 0 ? Math.round((value / max) * 100) : 0;
  if (pct < 1 && value > 0) { pct = 1; }
  var out = '<div style="margin:0 0 5px;">';
  out += '<div style="display:flex;justify-content:space-between;"><span style="color:' + (me ? HI : TXT) + ';">' + swatch(colour) + esc(label) + (me ? ' <span style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">(you)</span>' : '') + '</span>';
  out += '<span style="color:' + TXT + ';">' + right + '</span></div>';
  out += '<div style="background:' + TRACK + ';height:6px;width:100%;margin:2px 0 1px;"><div style="background:' + colour + ';height:6px;width:' + pct + '%;"></div></div>';
  if (note) { out += '<div style="color:' + MUTED + ';">' + note + '</div>'; }
  return out + '</div>';
}
// Species bars are split into one segment per angler, all drawn on the same
// scale as each other, so a segment's length is comparable across species as
// well as within one.
function stackRow(label, right, segs, notes, max) {
  var out = '<div style="margin:0 0 5px;">';
  out += '<div style="display:flex;justify-content:space-between;"><span style="color:' + TXT + ';">' + esc(label) + '</span><span style="color:' + TXT + ';">' + right + '</span></div>';
  out += '<div style="background:' + TRACK + ';height:6px;width:100%;margin:2px 0 1px;display:flex;">';
  var i;
  for (i = 0; i < segs.length; i++) {
    var w = max > 0 ? (segs[i].n / max) * 100 : 0;
    out += '<div title="' + esc(segs[i].who) + ' ' + segs[i].n + '" style="background:' + segs[i].colour + ';height:6px;width:' + (Math.round(w * 10) / 10) + '%;' + (i < segs.length - 1 ? 'margin-right:1px;' : '') + '"></div>';
  }
  out += '</div>';
  for (i = 0; i < notes.length; i++) { out += '<div style="color:' + MUTED + ';">' + notes[i] + '</div>'; }
  return out + '</div>';
}
function byAnglerCount(a, b) { return s.anglers[b].n - s.anglers[a].n; }
function bySpeciesCount(a, b) { return s.species[b].n - s.species[a].n; }

var now = Math.floor(new Date().getTime() / 1000);
var elapsed = now - (s.start || now);
if (elapsed < 1) { elapsed = 1; }

var totHook = 0, totCast = 0, totOz = 0, kk;
var names = [];
for (kk in s.anglers) {
  if (s.anglers.hasOwnProperty(kk)) {
    names.push(kk);
    totHook += s.anglers[kk].hooks || 0;
    totCast += s.anglers[kk].casts || 0;
    totOz += s.anglers[kk].oz || 0;
  }
}
var areaList = [];
for (kk in s.areas) { if (s.areas.hasOwnProperty(kk)) { areaList.push(kk); } }

var html = PANEL + header("FISHING", dur(elapsed) + (s.year ? ' &middot; ' + s.year + ' AF' : ''));

if (s.n === 0 && names.length === 0) {
  html += hero("0", "fish landed so far");
  html += quiet("Nothing yet this session. Cast a line, or run FISHINGSTATS DEMO to preview the layout.");
} else {
  html += hero(String(s.n), (s.n === 1 ? "fish" : "fish") + " landed" + (totOz > 0 ? ", " + wt(totOz) + " in all" : ""));
  // Where: flag a pinned area so a stale manual override is visible rather
  // than looking like a detection failure.
  if (areaList.length > 0) {
    html += '<div style="color:' + MUTED + ';">at <span style="color:' + TXT + ';font-family:' + SERIF + ';">' + esc(areaList.join(", ")) + '</span>' + (FS.areaSrc === "manual" ? ' <span style="font-style:italic;font-family:' + SERIF + ';">(pinned)</span>' : '') + '</div>';
  } else {
    html += '<div style="color:' + MUTED + ';">area unknown &mdash; FISHINGSTATS AREA to set</div>';
  }

  // Two ledger columns: the pace of the session, and its prize catch.
  var lost = totHook - s.n;
  var cols = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
  var pb = caps("The session", WATER);
  pb += row("per hour", s.n > 0 ? String(Math.round((s.n / (elapsed / 3600)) * 10) / 10) : "&hellip;", s.n > 0 ? WATER : MUTED);
  pb += row("landed / cast", totCast > 0 ? s.n + "/" + totCast + " (" + Math.round((s.n / totCast) * 100) + "%)" : "&mdash;");
  pb += row("got away", lost > 0 ? String(lost) : "none", lost > 0 ? "#de8a72" : MUTED);
  pb += row("avg cast", s.castN > 0 ? Math.round(s.castFt / s.castN) + "ft" : "&mdash;", s.castN > 0 ? TXT : MUTED);
  cols += box(pb, WATER);

  var bestOz = 0, bestWho = "", bestSp = "";
  for (kk = 0; kk < names.length; kk++) {
    var an = s.anglers[names[kk]];
    if (an.best > bestOz) { bestOz = an.best; bestWho = names[kk]; bestSp = an.bestSp || ""; }
  }
  var spCount = 0;
  for (kk in s.species) { if (s.species.hasOwnProperty(kk)) { spCount++; } }
  var bb = caps("Prize catch", CATCH);
  if (bestOz > 0) {
    bb += '<div style="font-family:' + SERIF + ';font-size:16px;color:' + CATCH + ';">' + wt(bestOz) + '</div>';
    bb += row("species", esc(bestSp));
    bb += row("by", esc(bestWho), bestWho === FS.me ? HI : TXT);
  } else {
    bb += quiet("Nothing weighed yet.");
  }
  bb += row("species seen", String(spCount));
  if (s.rec > 0) { bb += row("rankings beaten", String(s.rec), RECORD); }
  cols += box(bb, CATCH);
  html += cols + '</div>';

  names.sort(byAnglerCount);
  var maxN = 0;
  var k;
  for (k = 0; k < names.length; k++) { if (s.anglers[names[k]].n > maxN) { maxN = s.anglers[names[k]].n; } }
  var colourOf = {};
  for (k = 0; k < names.length; k++) { colourOf[names[k]] = FS.col[names[k]] || pal[k % pal.length]; }

  var ab = "";
  for (k = 0; k < names.length; k++) {
    var a = s.anglers[names[k]];
    var share = s.n > 0 ? Math.round((a.n / s.n) * 100) : 0;
    var note = 'total ' + wt(a.oz);
    if (a.best > 0) { note += ' &middot; best ' + wt(a.best) + ' ' + esc(a.bestSp); }
    if (a.casts > 0) { note += ' &middot; ' + Math.round((a.n / a.casts) * 100) + '% of casts landed'; }
    ab += barRow(names[k], a.n + ' <span style="color:' + MUTED + ';">&middot; ' + share + '%</span>', note, a.n, maxN, colourOf[names[k]], names[k] === FS.me);
  }
  html += section("By angler", ab);

  var sp = [];
  for (k in s.species) { if (s.species.hasOwnProperty(k)) { sp.push(k); } }
  if (sp.length > 0) {
    sp.sort(bySpeciesCount);
    var maxS = s.species[sp[0]].n;
    var shown = sp.length > 10 ? 10 : sp.length;
    var sb = "";
    if (names.length > 1) {
      sb += '<div style="margin:0 0 5px;">';
      for (k = 0; k < names.length; k++) { sb += '<span style="margin-right:9px;white-space:nowrap;color:' + MUTED + ';">' + swatch(colourOf[names[k]]) + esc(names[k]) + '</span>'; }
      sb += '</div>';
    }
    for (k = 0; k < shown; k++) {
      var f = s.species[sp[k]];
      var segs = [];
      var parts = [];
      var q;
      for (q = 0; q < names.length; q++) {
        var cnt = s.anglers[names[q]].sp ? (s.anglers[names[q]].sp[sp[k]] || 0) : 0;
        if (cnt > 0) {
          segs.push({ who: names[q], n: cnt, colour: colourOf[names[q]] });
          parts.push('<span style="color:' + colourOf[names[q]] + ';">' + esc(names[q]) + ' ' + cnt + '</span>');
        }
      }
      var notes = [];
      if (parts.length > 1) { notes.push(parts.join(' &middot; ')); }
      var note2 = 'avg ' + wt(f.oz / f.n) + ' &middot; best ' + wt(f.best) + ' (' + esc(f.bestBy) + ')';
      var rr = recFor(sp[k]);
      if (rr) { note2 += ' &middot; <span style="color:' + RECORD + ';">year&rsquo;s best ' + wt(rr[0]) + ' ' + esc(rr[1]) + '</span>'; }
      notes.push(note2);
      sb += stackRow(sp[k], String(f.n), segs, notes, maxS);
    }
    html += section("By species", sb, sp.length > shown ? ' <span style="font-variant:normal;letter-spacing:0;font-style:italic;color:' + MUTED + ';">top ' + shown + ' of ' + sp.length + '</span>' : '');
  }

  if (s.recent.length > 0) {
    var rb = "";
    for (k = s.recent.length - 1; k >= 0; k--) {
      var r2 = s.recent[k];
      var isMe = (r2[1] === FS.me);
      rb += '<div style="display:flex;gap:8px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;">';
      rb += '<span style="color:' + MUTED + ';min-width:3em;">' + clock(r2[0]) + '</span>';
      rb += '<span style="color:' + (colourOf[r2[1]] || TXT) + ';min-width:5.5em;' + (isMe ? 'font-weight:bold;' : '') + '">' + esc(r2[1]) + '</span>';
      rb += '<span style="flex:1 1 auto;color:' + TXT + ';">' + esc(r2[2]) + '</span>';
      rb += '<span style="color:' + CATCH + ';white-space:nowrap;">' + wt(r2[3]) + '</span></div>';
    }
    html += section("Recent catches", rb);
  }
}
html += '</div>';

// The whole tab in the panel's colour (#355), as Self and Comms do: the
// panel fills the tab, and the tab itself takes the colour while it resizes.
try {
  var fsSt = document.getElementById("loom-fishingstats-style");
  if (!fsSt) { fsSt = document.createElement("style"); fsSt.id = "loom-fishingstats-style"; document.head.appendChild(fsSt); }
  var fsCss = '.flexlayout__tab:has(#loom-fishingstats) { background: ' + BG + ' !important; } .flexlayout__tab:has(#loom-fishingstats) > * { min-height: 100%; }';
  if (fsSt.textContent !== fsCss) fsSt.textContent = fsCss;
} catch (e) {}
try { set_custom_tab_html("fishingstats", html); } catch (e) {}