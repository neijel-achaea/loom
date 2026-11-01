// atlas_areas_render -- the Areas tab (#451), in the house style:
//   - title: Areas, and how many you've visited of the areas on the map
//   - totals: rooms explored of rooms mapped in the areas you've visited,
//     and of every room on the map, each with a bar
//   - your tags as groups (an area under each of its tags), then untagged,
//     then "not visited yet" and "hidden" (both folded at first); a heading
//     folds its group and gives its own totals
//   - a row: the area's name, explored / mapped and the percentage, a thin
//     bar under it; the area you're in marked HERE; a click shows the area
//     in the Atlas tab
// An area is "visited" once Atlas has seen its explored rooms (the game
// sends them when you enter it); counts are kept per character.
if (!client.loom || !client.loom.atlas || !client.loom.atlas.look) run_function("atlas_setup", [], "atlas");
var AT = client.loom.atlas;
var TH = (client.loom && client.loom.theme) || {};
var AMBER = TH.acc || "#e0b46c";
var DEEP = TH.deep || "#7a5f33";
var TXT = TH.txt || "#e8e2d6";
var MUTED = TH.muted || "#8f877a";
var DIM = TH.dim || "#6d665b";
var RULE = TH.rule || "#2b2620";
var BG = TH.bg || "#13110e";
var TRACK = TH.track || "#2b2620";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function fmt(n) { return Number(n).toLocaleString("en-US"); }
// Whole percentages, rounded down (100% only when complete); the totals,
// small for a long time, get a decimal below 10%.
function pct(a, b, dec) {
  if (!b) return "—";
  var p = a / b * 100;
  if (dec && p > 0 && p < 10) return (Math.floor(p * 10) / 10).toFixed(1) + "%";
  return (p > 0 && p < 1 ? "&lt;1" : Math.floor(p)) + "%";
}
// No exploration record: a folded map crossed out in red, after the name.
var NOREC = ' <span title="no exploration record: the game sent no explored rooms when you walked in, so this area counts for no total" style="display:inline-block;vertical-align:-2px;margin-left:3px;">' +
  '<svg width="14" height="14" viewBox="0 0 16 16"><path d="M1.5 3.2 L5.5 1.8 L10.5 3.6 L14.5 2.2 V12.8 L10.5 14.2 L5.5 12.4 L1.5 13.8 Z" fill="none" stroke="' + MUTED + '" stroke-width="1.1" stroke-linejoin="round"/>' +
  '<path d="M5.5 1.8 V12.4 M10.5 3.6 V14.2" stroke="' + MUTED + '" stroke-width="0.9"/><path d="M3 3.5 L13 12.5 M13 3.5 L3 12.5" stroke="#d9534f" stroke-width="2" stroke-linecap="round"/></svg></span>';
function bar(a, b, h) {
  var w = b ? Math.min(100, a / b * 100) : 0;
  return '<div style="height:' + h + 'px;background:' + TRACK + ';margin-top:2px;"><div style="height:100%;width:' + w.toFixed(1) + '%;background:' + (w >= 100 ? AMBER : DEEP) + ';"></div></div>';
}

var M = AT.map;
var html = '<div id="loom-atlas-areas" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;display:flex;flex-direction:column;">';

if (!M) {
  html += '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:2px;font-size:15px;color:' + AMBER + ';border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">Areas</div>';
  html += '<div style="margin-top:8px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">' + (AT.state == "loading" ? "Loading the community map…" : "The community map isn't loaded: ATLAS RELOAD.") + '</div>';
} else {
  // Every area with rooms, sorted by name; visited, unvisited, hidden.
  var all = [], vis = [], unv = [], hid = [];
  for (var a in M.areas) {
    if (!M.areas.hasOwnProperty(a)) continue;
    var aid = Number(a), mapped = AT.areaRooms(aid).length;
    if (!mapped) continue;
    var e = { aid: aid, mapped: mapped, n: AT.count(aid), key: AT.sortKey(aid) };
    all.push(e);
  }
  all.sort(function (x, y) { return x.key < y.key ? -1 : (x.key > y.key ? 1 : 0); });
  var tot = { n: 0, m: 0, mAll: 0 };
  for (var i = 0; i < all.length; i++) {
    var E = all[i];
    if (AT.hidden[E.aid]) { hid.push(E); continue; }
    // An area without an exploration record sits in its groups like any
    // visited one, with no figures, and counts for no total (Ricardo).
    if (AT.uncounted[E.aid] && E.n < 0) { E.unc = true; vis.push(E); continue; }
    tot.mAll += E.mapped;
    if (E.n >= 0) { vis.push(E); tot.n += Math.min(E.n, E.mapped); tot.m += E.mapped; }
    else unv.push(E);
  }

  // Title.
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
  html += '<span style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:2px;font-size:15px;color:' + AMBER + ';">Areas</span>';
  html += '<span style="color:' + MUTED + ';">' + vis.length + ' of ' + (vis.length + unv.length) + ' visited</span></div>';

  // Totals.
  html += '<div style="margin:6px 0 4px;padding:5px 6px;border:1px solid ' + RULE + ';">';
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;" title="rooms you\'ve explored in the areas you\'ve visited, of the rooms the community map has there">' +
    '<span style="font-family:' + SERIF + ';font-size:13px;">In the areas you\'ve visited</span><span><span style="color:' + MUTED + ';">' + fmt(tot.n) + ' / ' + fmt(tot.m) + '</span> <span style="color:' + AMBER + ';">' + pct(tot.n, tot.m, true) + '</span></span></div>' + bar(tot.n, tot.m, 4);
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-top:5px;" title="rooms you\'ve explored, of every room on the community map (hidden areas left out)">' +
    '<span style="font-family:' + SERIF + ';font-size:13px;">Of the whole map</span><span><span style="color:' + MUTED + ';">' + fmt(tot.n) + ' / ' + fmt(tot.mAll) + '</span> <span style="color:' + AMBER + ';">' + pct(tot.n, tot.mAll, true) + '</span></span></div>' + bar(tot.n, tot.mAll, 4);
  html += '</div>';

  // Groups: each tag (alphabetical), then untagged; then not visited, hidden.
  var groups = {}, order = [];
  var put = function (key, E) { if (!groups[key]) { groups[key] = []; order.push(key); } groups[key].push(E); };
  for (var v = 0; v < vis.length; v++) {
    var tg = AT.tags[vis[v].aid];
    if (!tg || !tg.length) put("tag:", vis[v]);
    else for (var t = 0; t < tg.length; t++) put("tag:" + tg[t], vis[v]);
  }
  order.sort(function (x, y) { if (x === "tag:") return 1; if (y === "tag:") return -1; return x < y ? -1 : (x > y ? 1 : 0); });
  if (unv.length) { groups.unvisited = unv; order.push("unvisited"); }
  if (hid.length) { groups.hidden = hid; order.push("hidden"); }
  AT.groupsDrawn = order.slice();
  var hereA = AT.here && AT.here.area;
  var anyTag = order.some(function (k) { return k.indexOf("tag:") === 0 && k !== "tag:"; });

  for (var g = 0; g < order.length; g++) {
    var key = order[g], rows = groups[key], folded = AT.isFolded(key);
    var label = key === "unvisited" ? "not visited yet" : key === "hidden" ? "hidden"
      : key === "tag:" ? (anyTag ? "untagged" : "visited") : key.substring(4);
    var gn = 0, gm = 0, hasHere = false;
    for (var r = 0; r < rows.length; r++) { if (!rows[r].unc) gm += rows[r].mapped; if (rows[r].n > 0) gn += Math.min(rows[r].n, rows[r].mapped); if (rows[r].aid === hereA) hasHere = true; }
    var stat = key === "unvisited" || key === "hidden" ? rows.length + (rows.length === 1 ? ' area' : ' areas') + ' &middot; ' + fmt(gm) + ' rooms'
      : rows.length + (rows.length === 1 ? ' area' : ' areas') + ' &middot; ' + fmt(gn) + ' / ' + fmt(gm) + ' &middot; <span style="color:' + AMBER + ';">' + pct(gn, gm) + '</span>';
    html += '<div onclick="window.loomAtlas&&window.loomAtlas.fold(' + g + ')" title="click to ' + (folded ? 'open' : 'fold') + '" style="cursor:pointer;user-select:none;display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-top:7px;padding:2px 0;border-bottom:1px solid ' + RULE + ';">';
    html += '<span style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:1.5px;font-size:13px;color:' + (hasHere ? AMBER : TXT) + ';">' + (folded ? '&#9656; ' : '&#9662; ') + esc(label) + (hasHere ? ' <span style="font-family:' + MONO + ';font-variant:normal;font-size:9px;letter-spacing:0.08em;">&#9673; HERE</span>' : '') + '</span>';
    html += '<span style="flex:none;color:' + MUTED + ';">' + stat + '</span></div>';
    if (folded) continue;
    for (var q = 0; q < rows.length; q++) {
      var R = rows[q], isHere = R.aid === hereA, seen = R.n >= 0 || R.unc;
      var tags = AT.tags[R.aid] || [];
      var tip = AT.title(R.aid) + ' (area ' + R.aid + ')' + (tags.length ? ' · tags: ' + tags.join(', ') : '') + ' · click to show it in Atlas · ATLAS TAG ' + R.aid + ' <tag> to group it';
      html += '<div onclick="window.loomAtlas&&window.loomAtlas.show(' + R.aid + ')" title="' + esc(tip) + '" class="loom-atlas-arow" style="cursor:pointer;padding:3px 4px 2px;' + (isHere ? 'background:rgba(224,180,108,0.08);' : '') + '">';
      html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">';
      html += '<span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:' + SERIF + ';font-size:13px;color:' + (isHere ? AMBER : (seen ? TXT : MUTED)) + ';">' + esc(AT.title(R.aid)) + (R.unc ? NOREC : '') + '</span>';
      html += '<span style="flex:none;white-space:nowrap;color:' + MUTED + ';">' + (isHere ? '<span style="color:' + AMBER + ';letter-spacing:0.08em;">HERE &middot; </span>' : '') +
        (R.unc ? fmt(R.mapped) + ' rooms' : seen ? fmt(Math.min(R.n, R.mapped)) + ' / ' + fmt(R.mapped) + ' <span style="display:inline-block;min-width:4ch;text-align:right;color:' + (R.n >= R.mapped ? AMBER : TXT) + ';">' + pct(R.n, R.mapped) + '</span>' : fmt(R.mapped) + ' rooms') + '</span></div>';
      if (seen && !R.unc) html += bar(R.n, R.mapped, 2);
      html += '</div>';
    }
  }
  if (!vis.length) html += '<div style="margin-top:8px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">No area visited yet: the game tells which rooms you\'ve explored when you enter an area.</div>';
  html += '<div style="margin-top:auto;padding-top:6px;font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';">Click a heading to fold it, an area to see it in Atlas. ATLAS TAG HERE &lt;tag&gt; groups the area you\'re in; ATLAS HIDE keeps an area out of the totals.</div>';
}
html += '</div>';

// The whole tab in the panel's colour (#355); rows light up under the mouse.
try {
  var aaSt = document.getElementById("loom-atlas-areas-style");
  if (!aaSt) { aaSt = document.createElement("style"); aaSt.id = "loom-atlas-areas-style"; document.head.appendChild(aaSt); }
  var aaCss = '.flexlayout__tab:has(#loom-atlas-areas) { background: ' + BG + ' !important; } .flexlayout__tab:has(#loom-atlas-areas) > * { min-height: 100%; } ' +
    '#loom-atlas-areas .loom-atlas-arow:hover { background: rgba(224,180,108,0.05); }';
  if (aaSt.textContent !== aaCss) aaSt.textContent = aaCss;
} catch (e) {}
try { set_custom_tab_html("Areas", html); } catch (e) {}
