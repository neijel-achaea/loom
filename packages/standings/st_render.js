// Draws the Standings tab in the house style shared with Coffers, Level,
// Ledger and the rest: ink panel, serif small-caps headings, one large
// figure, monospace ledger rows. The accent is a cool steel; the bands carry
// their own colours, red through grey to blue, as in EVE.
run_function("st_ensure", [], "standings");
var F = client.stF;
var DB = client.st.db;
var view = client.st.view;
var STEEL = "#b8c4d6";
var DEEP = "#5a6478";
var TXT = "#e2e5ea";
var MUTED = "#868c97";
var RULE = "#262b33";
var KIND = "#8fd0a0";
var UNKIND = "#e08a78";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
var now = Math.floor(new Date().getTime() / 1000);

function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
function n1(v) { return Math.round(v * 10) / 10; }
function caps(t, c) { return '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;color:' + (c || STEEL) + ';font-size:11px;margin:0 0 3px;">' + t + '</div>'; }
function row(label, value, c) {
  return '<div style="display:flex;justify-content:space-between;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;"><span style="color:' + MUTED + ';white-space:nowrap;">' + label + '</span><span style="color:' + (c || TXT) + ';white-space:nowrap;">' + value + '</span></div>';
}
function box(inner) { return '<div style="flex:1 1 150px;min-width:150px;border-top:2px solid ' + DEEP + ';padding:3px 2px 0;">' + inner + '</div>'; }
function section(title, inner) { return '<div style="border-top:1px solid ' + RULE + ';margin-top:8px;padding-top:5px;">' + caps(title) + inner + '</div>'; }
function quiet(t) { return '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">' + t + '</div>'; }
function chip(t, c, filled) {
  return '<span style="display:inline-block;margin:0 4px 3px 0;padding:0 5px;border:1px solid ' + c + ';' + (filled ? 'background:' + c + ';color:#101216;' : 'color:' + c + ';') + 'white-space:nowrap;">' + esc(t) + '</span>';
}
function when(e) { return e[1] > 0 ? F.icTxt(e[1]) : F.realTxt(e[0]); }
function stepTxt(st) {
  if (st === 0) { return '<span style="color:' + MUTED + ';">note</span>'; }
  return '<span style="color:' + (st > 0 ? KIND : UNKIND) + ';letter-spacing:0.05em;">' + F.steps(st) + '</span>';
}
function standing(s, size) {
  var b = F.band(s);
  return '<span style="font-family:' + SERIF + ';font-size:' + size + 'px;color:' + b[2] + ';">' + F.signed(s) + '</span>';
}
function byStanding(a, b) { return b.s - a.s; }

// The scale from -10 to +10: each band a faded segment, the standing a tick.
function scale(s) {
  var out = '<div style="position:relative;display:flex;height:8px;margin:3px 0 1px;">';
  var lo = -10;
  for (var i = 0; i < F.BANDS.length; i++) {
    var hi = Math.min(10, F.BANDS[i][0]);
    out += '<div title="' + F.BANDS[i][1] + '" style="flex:' + n1(hi - lo) + ' 1 0;background:' + F.BANDS[i][2] + ';opacity:0.35;margin-right:1px;"></div>';
    lo = hi;
  }
  var pct = (s + 10) / 20 * 100;
  out += '<div style="position:absolute;top:-3px;left:calc(' + n1(pct) + '% - 1.5px);width:3px;height:14px;background:#ffffff;"></div></div>';
  out += '<div style="display:flex;justify-content:space-between;color:' + MUTED + ';"><span>-10</span><span>neutral</span><span>+10</span></div>';
  return out;
}
// Standing after each dealing, as a step line across the -10..+10 frame.
function history(log, W, H) {
  var fs = 8;
  var x0 = 22, x1 = W - 6, y0 = 4, y1 = H - 4;
  var pts = [0];
  var sub = [];
  for (var i = 0; i < log.length; i++) { sub.push(log[i]); pts.push(F.score(sub)); }
  function sy(v) { return y1 - ((v + 10) / 20) * (y1 - y0); }
  function sx(i2) { return x0 + (pts.length > 1 ? i2 / (pts.length - 1) : 0) * (x1 - x0); }
  var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" style="display:block;height:auto;" xmlns="http://www.w3.org/2000/svg">';
  var lo = -10;
  for (var b = 0; b < F.BANDS.length; b++) {
    var hi = Math.min(10, F.BANDS[b][0]);
    svg += '<rect x="' + x0 + '" y="' + n1(sy(hi)) + '" width="' + (x1 - x0) + '" height="' + n1(sy(lo) - sy(hi)) + '" fill="' + F.BANDS[b][2] + '" fill-opacity="0.08"/>';
    lo = hi;
  }
  svg += '<line x1="' + x0 + '" y1="' + n1(sy(0)) + '" x2="' + x1 + '" y2="' + n1(sy(0)) + '" stroke="' + DEEP + '" stroke-width="0.8"/>';
  var labs = [10, 0, -10];
  for (var l = 0; l < labs.length; l++) { svg += '<text x="' + (x0 - 3) + '" y="' + n1(sy(labs[l]) + 3) + '" text-anchor="end" font-family="' + MONO + '" font-size="' + fs + '" fill="' + MUTED + '">' + (labs[l] > 0 ? "+" : "") + labs[l] + '</text>'; }
  var d = "M" + n1(sx(0)) + "," + n1(sy(0));
  for (var p = 1; p < pts.length; p++) { d += "H" + n1(sx(p)) + "V" + n1(sy(pts[p])); }
  svg += '<path d="' + d + '" fill="none" stroke="' + STEEL + '" stroke-width="1.4"/>';
  for (var q = 1; q < pts.length; q++) {
    var st = log[q - 1][2];
    if (log[q - 1].length > 4) { svg += '<circle cx="' + n1(sx(q)) + '" cy="' + n1(sy(pts[q])) + '" r="2.2" fill="none" stroke="' + STEEL + '" stroke-width="1"/>'; }
    else if (st !== 0) { svg += '<circle cx="' + n1(sx(q)) + '" cy="' + n1(sy(pts[q])) + '" r="2" fill="' + (st > 0 ? KIND : UNKIND) + '"/>'; }
  }
  return svg + '</svg>';
}
// One dealing as a ledger line: when, the nudge, the note, the standing after.
function isSet(e) { return e.length > 4 && typeof e[4] === "number"; }
function dealing(e, after, who) {
  var mark = isSet(e) ? '<span style="color:' + STEEL + ';">set</span>' : stepTxt(e[2]);
  if (isSet(e) && after === null) { after = e[4]; }
  return '<div style="display:flex;gap:6px;align-items:baseline;border-bottom:1px dotted ' + RULE + ';padding:2px 0;">' +
    '<span style="color:' + MUTED + ';min-width:8.5em;white-space:nowrap;">' + when(e) + '</span>' +
    (who ? '<span style="color:' + TXT + ';min-width:5.5em;font-family:' + SERIF + ';font-size:11px;">' + esc(who) + '</span>' : '') +
    '<span style="min-width:2.4em;">' + mark + '</span>' +
    '<span style="flex:1 1 auto;min-width:0;color:' + TXT + ';">' + esc(e[3] || "") + '</span>' +
    (after !== null ? '<span style="white-space:nowrap;color:' + F.band(after)[2] + ';">' + F.signed(after) + '</span>' : '') + '</div>';
}
function personRow(e) {
  var b = F.band(e.s);
  return '<div style="display:flex;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;">' +
    '<span style="flex:1 1 auto;font-family:' + SERIF + ';font-size:11px;color:' + TXT + ';">' + esc(e.name) + '</span>' +
    '<span style="color:' + b[2] + ';min-width:6.5em;text-align:right;">' + b[1] + '</span>' +
    '<span style="color:' + b[2] + ';min-width:3.5em;text-align:right;">' + F.signed(e.s) + '</span>' +
    '<span style="color:' + MUTED + ';min-width:5.5em;text-align:right;">' + F.dealings(e) + ' dealt</span></div>';
}
function pendingRows(filterKey) {
  var out = "";
  for (var i = 0; i < DB.pending.length; i++) {
    var p = DB.pending[i];
    if (filterKey && F.key(p.who) !== filterKey) { continue; }
    out += '<div style="display:flex;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;"><span style="color:' + MUTED + ';min-width:8.5em;">' + (p.ic > 0 ? F.icTxt(p.ic) : F.realTxt(p.t)) + '</span>' +
      (filterKey ? '' : '<span style="font-family:' + SERIF + ';font-size:11px;min-width:5.5em;">' + esc(p.who) + '</span>') +
      '<span style="flex:1 1 auto;">' + esc(p.why) + '</span><span>' + stepTxt(p.step) + '?</span></div>';
  }
  if (out) { out += '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;margin-top:2px;">STN OK records the first as suggested, STN SKIP dismisses it.</div>'; }
  return out;
}

// A balance, the standings tab's counterpart of the coin stack.
var glyph = '<svg width="18" height="16" viewBox="0 0 18 16" style="vertical-align:-3px;margin-right:6px;" xmlns="http://www.w3.org/2000/svg">' +
  '<path d="M9 1.5 V14 M5 15 H13 M2 4 H16" stroke="' + STEEL + '" stroke-width="1.1"/>' +
  '<path d="M2 4 L0.5 9 H3.5 Z M16 4 L14.5 9 H17.5 Z" fill="none" stroke="' + STEEL + '" stroke-width="0.9"/>' +
  '<path d="M0.5 9 Q2 11 3.5 9 Z" fill="' + KIND + '"/><path d="M14.5 9 Q16 11 17.5 9 Z" fill="' + UNKIND + '"/><circle cx="9" cy="1.5" r="1.1" fill="' + STEEL + '"/></svg>';

var people = [];
var orgsN = 0;
for (var k in DB.e) { if (DB.e.hasOwnProperty(k)) { if (DB.e[k].org) { orgsN++; } else { people.push(DB.e[k]); } } }

var html = '<div style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:#101216;border:1px solid ' + RULE + ';padding:7px 8px 8px;">';
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
html += '<div style="font-family:' + SERIF + ';color:' + STEEL + ';font-size:14px;letter-spacing:0.22em;">' + glyph + 'STANDINGS</div>';
html += '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;color:' + MUTED + ';font-size:11px;">' + people.length + ' on the books' + (DB.pending.length ? ' &middot; <span style="color:' + STEEL + ';">' + DB.pending.length + ' to review</span>' : '') + '</div></div>';

var vk = view && view.k ? view.k : null;
var E = vk ? DB.e[vk] : null;

if (vk && vk.charAt(0) !== "@" && E) {
  // ------------------------------------------------------------ a person ---
  var b = F.band(E.s);
  html += '<div style="margin:6px 0 0;font-family:' + SERIF + ';font-size:17px;color:' + TXT + ';">' + esc(E.name) + '</div>';
  html += '<div style="margin:0 0 2px;">' + standing(E.s, 26) + ' <span style="font-family:' + SERIF + ';font-style:italic;color:' + b[2] + ';font-size:13px;">' + b[1] + '</span></div>';
  html += scale(E.s);
  var lists = F.lists(E.name);
  var chips = "";
  for (var li = 0; li < lists.length; li++) { chips += chip(lists[li][0], lists[li][1], true); }
  for (var ti = 0; ti < (E.tags || []).length; ti++) { chips += chip(E.tags[ti], STEEL, false); }
  if (chips) { html += '<div style="margin-top:6px;">' + chips + '</div>'; }

  var kindN = 0, unkindN = 0, notesN = 0;
  var setsN = 0;
  for (var i = 0; i < E.log.length; i++) { if (isSet(E.log[i])) { setsN++; } else if (E.log[i][2] > 0) { kindN++; } else if (E.log[i][2] < 0) { unkindN++; } else { notesN++; } }
  var cols = '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:6px;">';
  var db1 = caps("Dealings");
  db1 += row("kindnesses", String(kindN), kindN ? KIND : MUTED);
  db1 += row("slights", String(unkindN), unkindN ? UNKIND : MUTED);
  db1 += row("notes", String(notesN));
  if (setsN) { db1 += row("set by hand", String(setsN), STEEL); }
  cols += box(db1);
  var db2 = caps("Acquaintance");
  if (E.log.length > 0) {
    db2 += row("first", when(E.log[0]));
    db2 += row("latest", when(E.log[E.log.length - 1]));
    var lastT = E.log[E.log.length - 1][0];
    var ago = Math.floor((now - lastT) / 86400);
    db2 += row("real time since", ago < 1 ? "today" : ago + "d");
  } else { db2 += quiet("Never dealt with."); }
  cols += box(db2);
  html += cols + '</div>';

  var pr = pendingRows(F.key(E.name));
  if (pr) { html += section("Awaiting review", pr); }
  if (E.log.length > 1) { html += section("Over time", history(E.log, 640, 90)); }

  var dl = "";
  var sub = [];
  var afters = [];
  for (var a = 0; a < E.log.length; a++) { sub.push(E.log[a]); afters.push(F.score(sub)); }
  for (var c = E.log.length - 1; c >= 0 && c >= E.log.length - 25; c--) { dl += dealing(E.log[c], E.log[c][2] !== 0 ? afters[c] : null, null); }
  html += section("The record" + (E.log.length > 25 ? ", latest 25 of " + E.log.length : ""), dl || quiet("Nothing recorded yet."));
}
else if (vk && vk.charAt(0) === "@") {
  // ------------------------------------------------------ an organisation ---
  var tag = vk.slice(1);
  var av = F.tagAvg(tag);
  var ab = F.band(av.avg);
  html += '<div style="margin:6px 0 0;font-family:' + SERIF + ';font-size:17px;color:' + TXT + ';">' + esc(tag) + ' <span style="font-size:12px;font-style:italic;color:' + MUTED + ';">organisation</span></div>';
  html += '<div style="margin:0 0 2px;">' + standing(av.avg, 26) + ' <span style="font-family:' + SERIF + ';font-style:italic;color:' + ab[2] + ';font-size:13px;">' + ab[1] + '</span> <span style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:12px;">members&rsquo; average, ' + av.n + ' ' + (av.n === 1 ? 'person' : 'people') + ', weighted by ' + av.w + ' dealings</span></div>';
  html += scale(av.avg);
  if (E) {
    var eb = F.band(E.s);
    html += '<div style="margin-top:5px;color:' + MUTED + ';">standing with ' + esc(tag) + ' itself: ' + standing(E.s, 14) + ' <span style="color:' + eb[2] + ';font-family:' + SERIF + ';font-style:italic;">' + eb[1] + '</span></div>';
  }
  var mem = [];
  for (var m = 0; m < people.length; m++) { if (F.hasTag(people[m], tag)) { mem.push(people[m]); } }
  mem.sort(byStanding);
  var mr = "";
  for (var m2 = 0; m2 < mem.length; m2++) { mr += personRow(mem[m2]); }
  html += section("Members", mr || quiet("No one carries this tag yet. STN &lt;name&gt; TAG " + esc(tag)));
  if (E && E.log.length) {
    var ol = "";
    var osub = [];
    var oaft = [];
    for (var oa = 0; oa < E.log.length; oa++) { osub.push(E.log[oa]); oaft.push(F.score(osub)); }
    for (var oc = E.log.length - 1; oc >= 0 && oc >= E.log.length - 15; oc--) { ol += dealing(E.log[oc], E.log[oc][2] !== 0 ? oaft[oc] : null, null); }
    html += section("Dealings with " + esc(tag) + " itself", ol);
  }
}
else {
  // ------------------------------------------------------------ overview ---
  html += '<div style="margin:6px 0 2px;"><span style="font-family:' + SERIF + ';font-size:26px;color:' + STEEL + ';">' + people.length + '</span> <span style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:12px;">' + (people.length === 1 ? 'adventurer' : 'adventurers') + ' on the books' + (orgsN ? ', ' + orgsN + ' organisation' + (orgsN === 1 ? '' : 's') : '') + '</span></div>';
  if (vk && !E) { html += '<div style="color:' + MUTED + ';">' + esc(vk) + ' is not on the books.</div>'; }
  if (people.length === 0) {
    html += quiet("No one yet. Everyone starts Neutral; STN &lt;name&gt; ++ shared tea in the grove adds the first entry.");
  } else {
    var pa = pendingRows(null);
    if (pa) { html += section("Awaiting review", pa); }
    // Recent dealings across everyone.
    var rec = [];
    for (var r = 0; r < people.length; r++) { for (var rl = 0; rl < people[r].log.length; rl++) { rec.push([people[r].log[rl], people[r].name]); } }
    var rr, rj, rt;
    for (rr = 1; rr < rec.length; rr++) { rt = rec[rr]; rj = rr - 1; while (rj >= 0 && rec[rj][0][0] < rt[0][0]) { rec[rj + 1] = rec[rj]; rj--; } rec[rj + 1] = rt; }
    var rd = "";
    for (rr = 0; rr < rec.length && rr < 10; rr++) { rd += dealing(rec[rr][0], null, rec[rr][1]); }
    html += section("Recent dealings", rd);
    people.sort(byStanding);
    var hiR = "", loR = "";
    for (var h = 0; h < people.length && h < 5; h++) { if (people[h].s > 0.5) { hiR += personRow(people[h]); } }
    for (var lw = people.length - 1; lw >= 0 && lw >= people.length - 5; lw--) { if (people[lw].s < -0.5) { loR += personRow(people[lw]); } }
    if (hiR) { html += section("Held in highest regard", hiR); }
    if (loR) { html += section("Held in lowest regard", loR); }
    // Tag averages.
    var seen = {};
    var tl = [];
    for (var s2 = 0; s2 < people.length; s2++) { var tg = people[s2].tags || []; for (var t2 = 0; t2 < tg.length; t2++) { if (!seen[tg[t2]]) { seen[tg[t2]] = 1; tl.push(tg[t2]); } } }
    tl.sort();
    var tr = "";
    for (var t3 = 0; t3 < tl.length; t3++) {
      var ta = F.tagAvg(tl[t3]);
      var tb = F.band(ta.avg);
      tr += '<div style="display:flex;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;"><span style="flex:1 1 auto;color:' + STEEL + ';">' + esc(tl[t3]) + '</span><span style="color:' + tb[2] + ';min-width:6.5em;text-align:right;">' + tb[1] + '</span><span style="color:' + tb[2] + ';min-width:3.5em;text-align:right;">' + F.signed(ta.avg) + '</span><span style="color:' + MUTED + ';min-width:5.5em;text-align:right;">' + ta.n + ' people</span></div>';
    }
    if (tr) { html += section("By tag", tr); }
  }
}
html += '<div style="color:' + MUTED + ';margin-top:6px;font-family:' + SERIF + ';font-style:italic;">STN HELP lists the commands. STN alone returns here.</div>';
html += '</div>';
try { set_custom_tab_html("Standings", html); } catch (e) {}