// waypoints_render -- the Waypoints tab (#369, mockup A), in the house style
// shared with Here: ink panel, serif small-caps headings, monospace rows.
//   - title: saved and areas counts, ⊕ ADD HERE when this room isn't saved
//   - Remembered (room's REMEMBER, through loom's link room-waypoints),
//     pinned in a dotted box with GO BACK; a placeholder with REMEMBER HERE
//     when nothing is remembered
//   - waypoints by area, the area you're in first; areas fold (remembered);
//     two lines a row: ⚑ name and number, then the room · environment and
//     the note; the room you're in highlighted with HERE; × on hover removes
if (!client.loom || !client.loom.waypoints || !client.loom.waypoints.list) run_function("waypoints_setup", [], "waypoints");
var WP = client.loom.waypoints;
var TH = (client.loom && client.loom.theme) || {};
var AMBER = TH.acc || "#e0b46c";
var DEEP = TH.deep || "#7a5f33";
var TXT = TH.txt || "#e8e2d6";
var MUTED = TH.muted || "#8f877a";
var DIM = TH.dim || "#6d665b";
var RULE = TH.rule || "#2b2620";
var BG = TH.bg || "#13110e";
var HI = TH.hi || "#f0cc8c";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
var SYM = "'Segoe UI Symbol','DejaVu Sans',sans-serif";
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function js(s) { return esc(String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'")); }
function ago(t) {
  var m = Math.floor((Date.now() - t) / 60000);
  if (m < 1) return "just now";
  if (m < 60) return m + " min ago";
  if (m < 1440) return Math.floor(m / 60) + " h ago";
  return Math.floor(m / 1440) + " d ago";
}
function chip(label, fn, col, border, tip) {
  return '<span onclick="window.loomWaypoints&&window.loomWaypoints.' + fn + '" title="' + esc(tip) + '" style="flex:none;cursor:pointer;padding:0 5px;border:1px solid ' + border + ';color:' + col + ';letter-spacing:0.08em;white-space:nowrap;">' + label + '</span>';
}

var here = WP.here || {};
var hereW = here.id ? WP.byId(here.id) : null;

// Group by area: the area you're in first, then the rest by name.
var groups = {}, order = [];
for (var i = 0; i < WP.list.length; i++) {
  var a = WP.list[i].area || "unknown area";
  if (!groups[a]) { groups[a] = []; order.push(a); }
  groups[a].push(WP.list[i]);
}
order.sort(function (x, y) {
  if (x === here.area) return -1;
  if (y === here.area) return 1;
  return x.toLowerCase() < y.toLowerCase() ? -1 : (x.toLowerCase() > y.toLowerCase() ? 1 : 0);
});
WP.areasDrawn = order.slice();

var html = '<div id="loom-waypoints" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;display:flex;flex-direction:column;">';

// Title.
var count = WP.list.length + ' saved' + (order.length ? ' &middot; ' + order.length + (order.length === 1 ? ' area' : ' areas') : '');
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
html += '<span style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:2px;font-size:15px;color:' + AMBER + ';">Waypoints</span>';
html += '<span style="display:flex;align-items:baseline;gap:8px;"><span style="color:' + MUTED + ';">' + count + '</span>';
if (here.id && !hereW) html += chip('&#8853; ADD HERE', 'add()', MUTED, DEEP, 'save the room you\'re in under its own title (WAYPOINTS RENAME to change it)');
html += '</span></div>';

// Remembered (room's REMEMBER), through loom.
var L = client.loom.loom;
var rem = (L && L.answer) ? L.answer("waypoints", "waypoints.remembered") : undefined;
if (rem && rem.id) {
  var remHere = here.id === rem.id;
  var sub = [rem.name, rem.area, rem.at ? ago(rem.at) : ""].filter(function (s) { return s; }).map(esc).join(' &middot; ');
  html += '<div style="margin-top:6px;padding:4px 6px;border:1px dotted ' + DEEP + ';display:flex;gap:8px;align-items:center;">';
  html += '<div style="flex:1 1 auto;min-width:0;"><div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">';
  html += '<span style="font-family:' + SERIF + ';font-size:14px;color:' + TXT + ';"><span style="font-family:' + SYM + ';color:' + AMBER + ';margin-right:4px;">&#8630;</span>Remembered</span>';
  html += '<span style="color:' + (remHere ? AMBER : MUTED) + ';letter-spacing:' + (remHere ? '0.08em' : '0') + ';">' + (remHere ? 'HERE &middot; ' : '') + esc(rem.id) + '</span></div>';
  html += '<div style="font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';">' + sub + '</div></div>';
  html += remHere ? chip('FORGET', "mark('forget')", DIM, DEEP, 'forget the remembered room') : chip('GO BACK', "mark('back')", AMBER, AMBER, 'walk back to ' + rem.name + ' (PATH FIND)');
  html += '</div>';
} else if (rem && here.id) {
  html += '<div onclick="window.loomWaypoints&&window.loomWaypoints.mark(\'remember\')" title="remember the room you\'re in (as REMEMBER in Here)" style="cursor:pointer;margin-top:6px;padding:4px 6px;border:1px dashed ' + RULE + ';display:flex;gap:8px;align-items:center;">';
  html += '<span style="flex:1 1 auto;min-width:0;font-family:' + SERIF + ';font-size:14px;color:' + MUTED + ';"><span style="font-family:' + SYM + ';color:' + DIM + ';margin-right:4px;">&#8630;</span>Nothing remembered</span>';
  html += '<span style="flex:none;padding:0 5px;border:1px solid ' + DEEP + ';color:' + MUTED + ';letter-spacing:0.08em;white-space:nowrap;">REMEMBER HERE</span></div>';
}

// The waypoints, by area.
for (var g = 0; g < order.length; g++) {
  var area = order[g], ws = groups[area], folded = !!WP.folded[area];
  var names = "";
  if (folded) {
    var nl = [];
    for (var f = 0; f < ws.length; f++) nl.push(esc(ws[f].name));
    names = ' <span style="color:' + DIM + ';font-variant:normal;letter-spacing:0;font-style:italic;">&middot; ' + nl.join(', ') + '</span>';
  }
  html += '<div onclick="window.loomWaypoints&&window.loomWaypoints.fold(' + g + ')" title="click to ' + (folded ? 'unfold' : 'fold') + '" style="cursor:pointer;font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;font-size:11px;color:' + AMBER + ';margin:8px 0 2px;border-top:1px solid ' + RULE + ';padding-top:5px;">';
  html += '<span style="font-family:' + SYM + ';display:inline-block;width:12px;color:' + MUTED + ';">' + (folded ? '&#9656;' : '&#9662;') + '</span>' + esc(area.toLowerCase()) + ' <span style="color:' + MUTED + ';">' + ws.length + '</span>' + names + '</div>';
  if (folded) continue;
  for (var k = 0; k < ws.length; k++) {
    var w = ws[k], isHere = here.id === w.id;
    var tip = isHere ? "you're here" : "walk to " + w.name + " (PATH FIND " + w.id + ")";
    html += '<div class="loom-wp-row" onclick="window.loomWaypoints&&window.loomWaypoints.go(\'' + js(w.id) + '\')" title="' + esc(tip) + '" style="cursor:pointer;padding:3px 4px;border-bottom:1px dotted ' + RULE + ';' + (isHere ? 'background:rgba(224,180,108,0.08);' : '') + '">';
    html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;">';
    html += '<span style="min-width:0;font-family:' + SERIF + ';font-size:14px;color:' + (isHere ? AMBER : TXT) + ';"><span style="font-family:' + SYM + ';color:' + (isHere ? AMBER : DEEP) + ';margin-right:4px;">&#9873;</span>' + esc(w.name) + '</span>';
    html += '<span style="flex:none;white-space:nowrap;color:' + (isHere ? AMBER : MUTED) + ';' + (isHere ? 'letter-spacing:0.08em;' : '') + '">' + (isHere ? 'HERE &middot; ' : '') + esc(w.id);
    html += '<span class="loom-wp-x" onclick="event.stopPropagation();window.loomWaypoints&&window.loomWaypoints.remove(\'' + js(w.id) + '\')" title="remove ' + esc(w.name) + '" style="cursor:pointer;margin-left:6px;color:#ff9a4c;">&times;</span></span></div>';
    var line2 = [w.room, (w.env || "").toLowerCase()].filter(function (s) { return s; }).map(esc).join(' &middot; ');
    html += '<div style="font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';padding-left:17px;">' + line2 + (w.note ? ' <span style="color:' + DIM + ';">&mdash; ' + esc(w.note) + '</span>' : '') + '</div>';
    html += '</div>';
  }
}
if (!WP.list.length) {
  html += '<div style="margin-top:8px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">No waypoints yet.</div>';
}
html += '<div style="margin-top:auto;padding-top:6px;font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';">Click a waypoint to walk there; click an area to fold it. WAYPOINTS RENAME gives a waypoint your own name.</div>';
html += '</div>';

// The whole tab in the panel's colour (#355); the × shows on a row's hover.
try {
  var wpSt = document.getElementById("loom-waypoints-style");
  if (!wpSt) { wpSt = document.createElement("style"); wpSt.id = "loom-waypoints-style"; document.head.appendChild(wpSt); }
  var wpCss = '.flexlayout__tab:has(#loom-waypoints) { background: ' + BG + ' !important; } .flexlayout__tab:has(#loom-waypoints) > * { min-height: 100%; } ' +
    '#loom-waypoints .loom-wp-x { visibility: hidden; } #loom-waypoints .loom-wp-row:hover .loom-wp-x { visibility: visible; } #loom-waypoints .loom-wp-row:hover { background: rgba(224,180,108,0.05); }';
  if (wpSt.textContent !== wpCss) wpSt.textContent = wpCss;
} catch (e) {}
try { set_custom_tab_html("Waypoints", html); } catch (e) {}
