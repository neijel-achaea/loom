// huntstats_render -- rebuild the 'Stats' custom tab from the persistent log + area aggregates,
// in the house style shared with Coffers, Level, Ledger, Fishing, DmgChart and
// Talismans: ink panel, serif small-caps headings, one large figure, monospace
// ledger rows. The accent is a hunter's moss green.
var log = [];
try { log = JSON.parse(get_variable("huntstats_log")) || []; } catch (e) { log = []; }
var areas = {};
try { areas = JSON.parse(get_variable("huntstats_areas")) || {}; } catch (e) { areas = {}; }

var MOSS = "#a9c46c";
var DEEP = "#56693a";
var GOLD = "#e2bd5a";
var DRAGON = "#b99be0";
var TXT = "#e4e6da";
var MUTED = "#878c7a";
var RULE = "#272d1f";
var TRACK = "#1a1f14";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";

function fmtDur(ms) { var m = Math.floor(ms / 60000); return m < 60 ? m + "m" : Math.floor(m / 60) + "h " + (m % 60) + "m"; }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function thou(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var o = ""; while (s.length > 3) { o = "," + s.slice(-3) + o; s = s.slice(0, -3); } return (neg ? "-" : "") + s + o; }
function ago(t) {
  var s = Math.floor((Date.now() - t) / 1000);
  if (s < 3600) { return Math.max(1, Math.round(s / 60)) + "m ago"; }
  if (s < 86400) { return Math.round(s / 3600) + "h ago"; }
  return Math.round(s / 86400) + "d ago";
}
function caps(t, c) { return '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;color:' + (c || DEEP) + ';font-size:11px;margin:0 0 3px;">' + t + '</div>'; }
function row(label, value, c) {
  return '<div style="display:flex;justify-content:space-between;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;"><span style="color:' + MUTED + ';white-space:nowrap;">' + label + '</span><span style="color:' + (c || TXT) + ';white-space:nowrap;">' + value + '</span></div>';
}
function box(inner, c) { return '<div style="flex:1 1 150px;min-width:150px;border-top:2px solid ' + (c || DEEP) + ';padding:3px 2px 0;">' + inner + '</div>'; }
function section(title, inner) { return '<div style="border-top:1px solid ' + RULE + ';margin-top:8px;padding-top:5px;">' + caps(title, MOSS) + inner + '</div>'; }
function quiet(t) { return '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">' + t + '</div>'; }
function byTime(x, y) { return y.ms - x.ms; }

// Dragonhood, when the level is known this connection and you aren't a dragon yet.
var dh = null;
try { dh = client.loom.huntstats.dragon(); } catch (e) { dh = null; }
if (dh !== null && dh >= 100) dh = null;

// An arrowhead over a sprig, the hunting tab's counterpart of the coin stack.
var glyph = '<svg width="18" height="17" viewBox="0 0 18 17" style="vertical-align:-3px;margin-right:6px;" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M2 15 L12 5" stroke="' + TXT + '" stroke-width="1.2"/><path d="M10 2 L16 2 L16 8 Z" fill="' + MOSS + '"/>' +
  '<path d="M2 15 L1 12 M2 15 L5 16 M3.6 13.4 L2.4 10.6 M3.6 13.4 L6.4 14.6" stroke="' + DEEP + '" stroke-width="1"/></svg>';

var arr = [];
var lt = { xp: 0, gold: 0, kills: 0, ms: 0, sessions: 0 };
for (var k in areas) {
  if (areas.hasOwnProperty(k)) {
    var a = areas[k];
    var hrs = a.ms / 3600000;
    arr.push({ area: k, xpHr: hrs > 0 ? Math.round(a.xp / hrs) : 0, goldHr: hrs > 0 ? Math.round(a.gold / hrs) : 0, sessions: a.sessions, ms: a.ms });
    lt.xp += a.xp || 0; lt.gold += a.gold || 0; lt.kills += a.kills || 0; lt.ms += a.ms || 0; lt.sessions += a.sessions || 0;
  }
}
arr.sort(byTime);

var html = '<div style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:#11130d;border:1px solid ' + RULE + ';padding:7px 8px 8px;">';
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
html += '<div style="font-family:' + SERIF + ';color:' + MOSS + ';font-size:14px;letter-spacing:0.22em;">' + glyph + 'HUNTING</div>';
html += '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;color:' + MUTED + ';font-size:11px;">' + (dh !== null ? 'dragonhood <span style="color:' + DRAGON + ';">' + dh.toFixed(2) + '%</span>' : arr.length + ' area' + (arr.length === 1 ? '' : 's')) + '</div></div>';

// The hunt under way (#90): running from its first experience until it is
// filed, or idle for 10 minutes (the same gap after which a resumed hunt is
// filed instead). While it runs it heads the tab; otherwise the last
// finished hunt does.
var C = null;
try { C = client.loom.huntstats.cur; } catch (e) { C = null; }
var live = !!(C && C.area !== undefined && C.firstXpAt && C.xp > 0 && (Date.now() - (C.lastXpAt || C.firstXpAt)) < 600000);
function lifeBox() {
  var hb = caps("Lifetime", MOSS);
  var lh = lt.ms / 3600000;
  hb += row("time hunted", fmtDur(lt.ms));
  hb += row("hunts", String(lt.sessions));
  hb += row("xp / hr", lh > 0 ? thou(lt.xp / lh) : "&mdash;", MOSS);
  hb += row("gold / hr", lh > 0 ? thou(lt.gold / lh) : "&mdash;", GOLD);
  hb += row("kills", thou(lt.kills));
  return box(hb, DEEP);
}

if (live) {
  var cMs = Math.max(1000, Date.now() - C.firstXpAt);
  var cH = cMs / 3600000;
  html += '<div style="margin:6px 0 1px;"><span style="font-family:' + SERIF + ';font-size:26px;color:' + MOSS + ';">' + thou(C.xp / cH) + '</span> ';
  html += '<span style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:12px;">xp/hour, this hunt</span></div>';
  html += '<div style="color:' + MUTED + ';">in <span style="font-family:' + SERIF + ';color:' + TXT + ';">' + esc(C.area) + '</span> &middot; under way</div>';
  var cb = caps("This hunt", MOSS);
  cb += row("time", fmtDur(cMs));
  cb += row("experience", thou(C.xp));
  cb += row("gold", thou(C.gold || 0) + ' <span style="color:' + MUTED + ';">(' + thou((C.gold || 0) / cH) + '/hr)</span>', GOLD);
  cb += row("kills", String(C.kills || 0) + ' <span style="color:' + MUTED + ';">(' + Math.round((C.kills || 0) / cH) + '/hr)</span>');
  var cP = [];
  for (var cK in (C.players || {})) { if (C.players.hasOwnProperty(cK)) cP.push(cK); }
  cb += row("party", cP.length ? esc(cP.join(", ")) : "alone");
  if (dh !== null && C.startDragonPct !== null && C.startDragonPct !== undefined && dh - C.startDragonPct > 0) { cb += row("dragonhood", '+' + (dh - C.startDragonPct).toFixed(3) + '%', DRAGON); }
  html += '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">' + box(cb, MOSS) + lifeBox() + '</div>';
}

if (log.length === 0) {
  if (!live) html += '<div style="margin-top:8px;">' + quiet("No hunts logged yet. A hunt is filed when you leave the area, or with HUNTSTATS FLUSH; it needs a minute or more of experience to count.") + '</div>';
} else {
  // Without a hunt under way, the headline is the most recent hunt's rate.
  var L = log[0];
  if (!live) {
  html += '<div style="margin:6px 0 1px;"><span style="font-family:' + SERIF + ';font-size:26px;color:' + MOSS + ';">' + thou(L.xpHr) + '</span> ';
  html += '<span style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:12px;">xp/hour, last hunt</span></div>';
  html += '<div style="color:' + MUTED + ';">in <span style="font-family:' + SERIF + ';color:' + TXT + ';">' + esc(L.area) + '</span>' + (L.at ? ' &middot; ' + ago(L.at) : '') + '</div>';

  var cols = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">';
  var lb = caps("Last hunt", MOSS);
  lb += row("time", fmtDur(L.ms));
  lb += row("experience", thou(L.xp));
  lb += row("gold", thou(L.gold) + ' <span style="color:' + MUTED + ';">(' + thou(L.goldHr) + '/hr)</span>', GOLD);
  lb += row("kills", String(L.kills) + (L.ms > 0 ? ' <span style="color:' + MUTED + ';">(' + Math.round(L.kills / (L.ms / 3600000)) + '/hr)</span>' : ''));
  if (L.dGain !== null && L.dGain !== undefined && L.dGain !== 0) { lb += row("dragonhood", '+' + L.dGain.toFixed(3) + '%', DRAGON); }
  cols += box(lb, MOSS);
  cols += lifeBox();
  html += cols + '</div>';
  }

  // Recent hunts, newest first, each as a two-line ledger entry.
  var rs = "";
  for (var i = 0; i < log.length; i++) {
    var s = log[i];
    rs += '<div style="border-bottom:1px dotted ' + RULE + ';padding:2px 0 3px;">';
    rs += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:6px;"><span style="font-family:' + SERIF + ';color:' + TXT + ';font-size:11px;">' + esc(s.area) + '</span>';
    rs += '<span style="color:' + MUTED + ';white-space:nowrap;">' + fmtDur(s.ms) + (s.at ? ' &middot; ' + ago(s.at) : '') + '</span></div>';
    rs += '<div style="color:' + MUTED + ';"><span style="color:' + MOSS + ';">' + thou(s.xpHr) + '</span> xp/hr &middot; <span style="color:' + GOLD + ';">' + thou(s.gold) + '</span> gold &middot; ' + s.kills + ' kills';
    if (s.dGain !== null && s.dGain !== undefined && s.dGain !== 0) { rs += ' &middot; <span style="color:' + DRAGON + ';">+' + s.dGain.toFixed(3) + '%</span>'; }
    rs += '</div>';
    if (s.players && s.players.length) { rs += '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">with ' + esc(s.players.join(", ")) + '</div>'; }
    rs += '</div>';
  }
  html += section("Recent hunts", rs);
}

// Areas, by total time; each bar is its xp/hr against the best area.
var ar = "";
if (arr.length === 0) {
  ar = quiet("No area history yet.");
} else {
  var best = 0;
  for (var j = 0; j < arr.length; j++) { if (arr[j].xpHr > best) { best = arr[j].xpHr; } }
  for (var j2 = 0; j2 < arr.length; j2++) {
    var r = arr[j2];
    var top = (r.xpHr === best && arr.length > 1);
    var pct = best > 0 ? Math.round(r.xpHr / best * 100) : 0;
    ar += '<div style="margin:0 0 5px;">';
    ar += '<div style="display:flex;justify-content:space-between;gap:6px;"><span style="color:' + TXT + ';">' + esc(r.area) + (top ? ' <span style="color:' + MOSS + ';" title="best xp/hr">&#9733;</span>' : '') + '</span>';
    ar += '<span style="color:' + MOSS + ';white-space:nowrap;">' + thou(r.xpHr) + ' <span style="color:' + MUTED + ';">xp/hr</span></span></div>';
    ar += '<div style="background:' + TRACK + ';height:5px;margin:2px 0 1px;"><div style="background:' + (top ? MOSS : DEEP) + ';height:5px;width:' + pct + '%;"></div></div>';
    ar += '<div style="color:' + MUTED + ';"><span style="color:' + GOLD + ';">' + thou(r.goldHr) + '</span> gold/hr &middot; ' + r.sessions + ' hunt' + (r.sessions === 1 ? '' : 's') + ' &middot; ' + fmtDur(r.ms) + '</div>';
    ar += '</div>';
  }
}
html += section("Areas, by time spent", ar);
html += '</div>';

try { set_custom_tab_html("Stats", html); } catch (e) {}