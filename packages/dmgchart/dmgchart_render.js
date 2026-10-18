if (!client.loom || !client.loom.dmgchart || !client.loom.dmgchart.saved) run_function("dmgchart_setup", [], "dmgchart");
// dmgchart_render -- paints the DmgChart tab in the house style shared with Coffers, Level,
// Ledger and Fishing: ink panel, serif small-caps headings, the two dps
// figures set large, donuts for the chosen source, then the session list.
// Accents are ember for damage dealt and crimson for damage taken.
var d = client.loom.dmgchart;
// Tab theme (#310): loom's city palette when one is on, else this tab's own colours.
var TH = (client.loom && client.loom.theme) || {};
var EMBER = "#eaa25c";
var CRIMSON = "#e0605a";
var DEEP = TH.deep || "#7a3f30";
var TXT = TH.txt || "#ecdfd9";
var MUTED = TH.muted || "#90807a";
var RULE = TH.rule || "#33231f";
var BG = TH.bg || "#150f0d";
var SEL = TH.sel || "#2a1a16";
var HI = TH.hi || "#ffffff";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";

function esc(t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function p2(n) { return ("0" + n).slice(-2); }
function hm(dt) { return p2(dt.getHours()) + ":" + p2(dt.getMinutes()); }
function md(dt) { return dt.getDate() + "/" + (dt.getMonth() + 1); }
function secs(s) {
  if (s < 60) { return (s < 10 ? s.toFixed(1) : Math.round(s)) + "s"; }
  if (s < 3600) { return Math.floor(s / 60) + "m " + p2(Math.round(s % 60)) + "s"; }
  return Math.floor(s / 3600) + "h " + Math.round((s % 3600) / 60) + "m";
}
function caps(t, col) { return '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;color:' + (col || DEEP) + ';font-size:11px;margin:0 0 3px;">' + t + '</div>'; }
function section(title, inner) { return '<div style="border-top:1px solid ' + RULE + ';margin-top:8px;padding-top:5px;">' + caps(title, EMBER) + inner + '</div>'; }
// One exchange row: a label, then the dealt and taken figures in their accents.
function xline(label, text, c) {
  return '<div style="display:flex;justify-content:space-between;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;"><span style="color:' + MUTED + ';">' + label + '</span><span style="color:' + c + ';">' + text + '</span></div>';
}
function quiet(t) { return '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">' + t + '</div>'; }
var REC = '<span style="color:' + CRIMSON + ';">&#9679;</span>';

// Pick the source: an open session, a saved one, or the live fight.
var src = null;
var label = "";
var sub = "";
var dt = null;
if (d.view == "session" && d.sess) {
  src = d.sess;
  dt = new Date(d.sess.start);
  label = REC + " recording";
  sub = '<span style="font-family:' + SERIF + ';color:' + TXT + ';">&ldquo;' + esc(d.sess.name) + '&rdquo;</span> since ' + hm(dt) + ' &middot; ' + d.sess.fights + ' fights &middot; ' + secs(d.sess.combatMs / 1000) + ' in combat';
  src.dur = Math.max(1, d.sess.combatMs / 1000);
} else if (d.view && d.view != "session") {
  for (var q = 0; q < d.saved.length; q++) { if (String(d.saved[q].id) == String(d.view)) { src = d.saved[q]; } }
  if (src) {
    dt = new Date(src.start);
    label = "session #" + src.id;
    sub = '<span style="font-family:' + SERIF + ';color:' + TXT + ';">&ldquo;' + esc(src.name) + '&rdquo;</span> ' + md(dt) + ' ' + hm(dt) + ' &middot; ' + src.fights + ' fights &middot; ' + secs(src.combatMs / 1000) + ' in combat';
    src.dur = Math.max(1, src.combatMs / 1000);
  }
}
if (!src && d.fight) {
  src = d.fight;
  dt = new Date(src.start);
  src.dur = Math.max(1, (src.last - src.start) / 1000);
  label = "live fight";
  sub = 'fight from ' + hm(dt) + ':' + p2(dt.getSeconds()) + ' &middot; ' + secs(src.dur) + ' <span style="font-style:italic;font-family:' + SERIF + ';">(a new one after ' + d.gap + 's quiet)</span>';
  if (d.sess) { sub += '<br>' + REC + ' recording <span style="font-family:' + SERIF + ';color:' + TXT + ';">&ldquo;' + esc(d.sess.name) + '&rdquo;</span>'; }
}

// Crossed blades for the title, the damage tab's counterpart of the coin stack.
var glyph = '<svg width="17" height="17" viewBox="0 0 17 17" style="vertical-align:-3px;margin-right:6px;" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M2 2 L11.5 11.5" stroke="' + EMBER + '" stroke-width="1.6"/><path d="M15 2 L5.5 11.5" stroke="' + CRIMSON + '" stroke-width="1.6"/>' +
  '<path d="M10 13.5 L13.5 10 M3.5 10 L7 13.5" stroke="' + TXT + '" stroke-width="1.2"/>' +
  '<path d="M12.5 12.5 L15 15 M4.5 12.5 L2 15" stroke="' + DEEP + '" stroke-width="1.8"/></svg>';

var html = '<div style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;">';
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
html += '<div style="font-family:' + SERIF + ';color:' + EMBER + ';font-size:14px;letter-spacing:0.22em;">' + glyph + 'DAMAGE</div>';
html += '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;color:' + MUTED + ';font-size:11px;">' + (label || (d.sess ? REC + ' recording' : 'waiting')) + '</div></div>';

if (!src) {
  html += '<div style="margin-top:8px;">' + quiet("No damage recorded yet. A new fight starts after " + d.gap + "s without damage in either direction.") + '</div>';
  if (d.sess) { html += '<div style="color:' + MUTED + ';margin-top:3px;">' + REC + ' recording &ldquo;' + esc(d.sess.name) + '&rdquo;</div>'; }
} else {
  var dur = src.dur;
  // The dealt and taken rates sit inside the donuts; above them, only what
  // the tab is showing.
  html += '<div style="color:' + MUTED + ';margin-top:5px;">' + sub + '</div>';

  html += '<div style="display:flex;flex-wrap:wrap;gap:10px;margin-top:8px;">';
  var dirs = ["out", "inc"];
  var titles = { out: "Dealt", inc: "Taken" };
  var accents = { out: EMBER, inc: CRIMSON };
  var R = 45;
  var C = 2 * Math.PI * R;
  for (var di = 0; di < dirs.length; di++) {
    var dir = dirs[di];
    var acc = accents[dir];
    var bucket = src[dir];
    var total = src[dir + "Total"];
    var rows = [];
    for (var k in bucket) {
      if (bucket.hasOwnProperty(k)) {
        var r = { type: k, amt: bucket[k] };
        var i = rows.length;
        while (i > 0 && rows[i - 1].amt < r.amt) { rows[i] = rows[i - 1]; i--; }
        rows[i] = r;
        if (!d.colors[k]) { d.colors[k] = d.spare[d.spareIdx % d.spare.length]; d.spareIdx++; }
      }
    }
    var col = '<div style="flex:1 1 200px;min-width:200px;border-top:2px solid ' + acc + ';padding:3px 2px 0;">';
    col += '<div style="display:flex;justify-content:space-between;align-items:baseline;">' + caps(titles[dir], acc) + '<span style="color:' + MUTED + ';">' + total + ' total</span></div>';
    col += '<svg viewBox="0 0 120 120" width="140" height="140" style="display:block;margin:4px auto 6px;">';
    col += '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="' + RULE + '" stroke-width="16"/>';
    var off = 0;
    for (var s = 0; s < rows.length; s++) {
      var len = total > 0 ? C * rows[s].amt / total : 0;
      col += '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="' + d.colors[rows[s].type] + '" stroke-width="16" stroke-dasharray="' + len.toFixed(3) + ' ' + (C - len).toFixed(3) + '" stroke-dashoffset="' + (-off).toFixed(3) + '" transform="rotate(-90 60 60)"/>';
      off += len;
    }
    col += '<text x="60" y="60" text-anchor="middle" font-family="' + SERIF + '" font-size="20" fill="' + acc + '">' + Math.round(total / dur) + '</text>';
    col += '<text x="60" y="75" text-anchor="middle" font-family="' + SERIF + '" font-style="italic" font-size="9" fill="' + MUTED + '">per second</text>';
    col += '</svg>';
    if (rows.length == 0) {
      col += quiet("none");
    } else {
      for (var t = 0; t < rows.length; t++) {
        var row = rows[t];
        col += '<div style="display:flex;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;">';
        col += '<span style="flex:1 1 auto;white-space:nowrap;"><span style="display:inline-block;width:8px;height:8px;background:' + d.colors[row.type] + ';margin-right:4px;"></span>' + esc(row.type) + '</span>';
        col += '<span style="min-width:3.5em;text-align:right;">' + row.amt + '</span>';
        col += '<span style="min-width:3.5em;text-align:right;color:' + MUTED + ';">' + (100 * row.amt / total).toFixed(1) + '%</span>';
        col += '<span style="min-width:3.5em;text-align:right;color:' + acc + ';">' + Math.round(row.amt / dur) + '/s</span></div>';
      }
    }
    html += col + '</div>';
  }
  html += '</div>';

  // The exchange: your hits, split into normal hits and each crit tier
  // (#185), with their count, share of all your hits and average. The four
  // usual tiers always have a row; the two rarest only once reached. Then
  // your biggest hit and hits a minute. Incoming is in the donut above.
  // Hit counts were added after the first sessions were saved, so those
  // show no exchange rows.
  var H = src.hits || null;
  var ex = "";
  if (H && H.out.n > 0) {
    var crOrder = [["CRITICAL", "critical hits"], ["CRUSHING", "crushing hits"], ["OBLITERATING", "obliterating hits"], ["ANNIHILATINGLY POWERFUL", "annihilatingly powerful hits"], ["WORLD-SHATTERING", "world-shattering hits"], ["PLANE-RAZING", "plane-razing hits"]];
    var crT = H.out.ct || {};
    var crN = H.out.cn || 0;
    var crD = H.out.cdmg || 0;
    function hrow(label, n, dmg, c) {
      return '<div style="display:flex;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;"><span style="flex:1 1 auto;color:' + (n > 0 ? c : MUTED) + ';">' + label + '</span><span style="min-width:4em;text-align:right;color:' + (n > 0 ? TXT : MUTED) + ';">' + n + '</span><span style="min-width:4em;text-align:right;color:' + MUTED + ';">' + Math.round(100 * n / H.out.n) + '%</span><span style="min-width:5em;text-align:right;color:' + (n > 0 ? EMBER : MUTED) + ';">' + (n > 0 ? Math.round(dmg / n) : "&mdash;") + '</span></div>';
    }
    ex += '<div style="display:flex;gap:6px;color:' + MUTED + ';border-bottom:1px solid ' + RULE + ';padding-bottom:1px;"><span style="flex:1 1 auto;"></span><span style="min-width:4em;text-align:right;">hits</span><span style="min-width:4em;text-align:right;">share</span><span style="min-width:5em;text-align:right;">average</span></div>';
    ex += hrow("hits", H.out.n - crN, src.outTotal - crD, TXT);
    for (var crI = 0; crI < crOrder.length; crI++) {
      var crE = crT[crOrder[crI][0]];
      var crCn = crE ? (typeof crE === "number" ? crE : crE.n) : 0;
      var crCd = crE && typeof crE === "object" ? crE.dmg : 0;
      if (crI < 4 || crCn > 0) ex += hrow(crOrder[crI][1], crCn, crCd, EMBER);
    }
    ex += xline("biggest hit", H.out.max, TXT);
    ex += xline("hits a minute", Math.round(H.out.n / (dur / 60)), TXT);
  }
  // Health lasts, for the live fight only, as dmgchart_lasts worked it out
  // (#153, #93): absent while health isn't falling.
  var LA = d.lasts;
  if (!d.view && LA && LA.start == src.start && Date.now() - src.last <= d.gap * 1000) {
    ex += xline("health lasts", "~" + secs(LA.secs) + " (losing " + Math.round(LA.drop) + "/s over the last " + Math.round(LA.span) + "s)", LA.secs < 10 ? CRIMSON : (LA.secs < 30 ? "#e6c25a" : MUTED));
  }
  if (ex) { html += section("The exchange", ex); }
}

if (d.saved.length) {
  var list = '<div style="display:flex;gap:6px;color:' + MUTED + ';border-bottom:1px solid ' + RULE + ';padding-bottom:1px;">';
  list += '<span style="min-width:2.2em;">#</span><span style="flex:1 1 auto;">name</span><span style="min-width:6.5em;">when</span><span style="min-width:3em;text-align:right;">fights</span><span style="min-width:3.5em;text-align:right;">combat</span><span style="min-width:3em;text-align:right;">dealt</span><span style="min-width:3em;text-align:right;">taken</span></div>';
  var shown = 0;
  for (var w = d.saved.length - 1; w >= 0 && shown < 10; w--) {
    var sv = d.saved[w];
    var sd = new Date(sv.start);
    var sdur = Math.max(1, sv.combatMs / 1000);
    var sel = String(d.view) == String(sv.id);
    list += '<div style="display:flex;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;' + (sel ? 'background:' + SEL + ';' : '') + '">';
    list += '<span style="min-width:2.2em;color:' + DEEP + ';">' + sv.id + '</span>';
    list += '<span style="flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:' + (sel ? HI : TXT) + ';">' + esc(sv.name) + '</span>';
    list += '<span style="min-width:6.5em;color:' + MUTED + ';">' + md(sd) + ' ' + hm(sd) + '</span>';
    list += '<span style="min-width:3em;text-align:right;">' + sv.fights + '</span>';
    list += '<span style="min-width:3.5em;text-align:right;">' + Math.round(sdur / 60) + 'm</span>';
    list += '<span style="min-width:3em;text-align:right;color:' + EMBER + ';">' + Math.round(sv.outTotal / sdur) + '</span>';
    list += '<span style="min-width:3em;text-align:right;color:' + CRIMSON + ';">' + Math.round(sv.incTotal / sdur) + '</span></div>';
    shown++;
  }
  html += section("Saved sessions", list);
}
if (d.view) { html += '<div style="color:' + MUTED + ';margin-top:6px;font-family:' + SERIF + ';font-style:italic;">DMGCHART LIVE returns to the live fight.</div>'; }
html += '</div>';
try { set_custom_tab_html(d.tab, html); } catch (err) {}