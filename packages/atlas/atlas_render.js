// atlas_render -- the Atlas tab (#451), in the house style shared with Here:
// ink panel, serif small-caps headings, monospace lines.
//   - title: Atlas, the area's name, zoom − +, ⌖ (back to you), FOG
//   - line 2: the room you're in · its number · level (▲▼ to look at the
//     area's other levels) · explored N · M on the map
//   - the area's rooms on that level as squares in their environment's
//     colour, exits as lines; with fog of war, only the rooms you've
//     explored (and stubs where an exit leads somewhere you haven't been);
//     without it, unexplored rooms faint; exits to other areas dashed; ▲▼
//     in a room for up/down; the room you're in ringed
//   - drag to pan, wheel or − + to zoom, click a room to walk there
// Every draw is whole (0.1.1): Nexus shows a tab's HTML as given, and a ring
// moved in place showed only at the next draw.
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
var HI = TH.hi || "#f0cc8c";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function chip(label, fn, tip, on) {
  return '<span onclick="window.loomAtlas&&window.loomAtlas.' + fn + '" title="' + esc(tip) + '" style="flex:none;cursor:pointer;padding:0 5px;border:1px solid ' + (on ? AMBER : DEEP) + ';color:' + (on ? AMBER : MUTED) + ';letter-spacing:0.08em;white-space:nowrap;user-select:none;">' + label + '</span>';
}
function lvl(z) { return z === 0 ? "ground" : (z > 0 ? "+" + z : String(z)); }
function arrow(sym, d, on, tip) {
  return on ? '<span onclick="window.loomAtlas&&window.loomAtlas.level(' + d + ')" title="' + tip + '" style="cursor:pointer;color:' + AMBER + ';padding:0 2px;user-select:none;">' + sym + '</span>'
    : '<span style="color:' + RULE + ';padding:0 2px;">' + sym + '</span>';
}
// Environment colours: the community map's (Mudlet's bright ones), muted to
// sit on the ink panel: the same hue, far less saturation, a narrow band of
// lightness so every room reads and none glares.
var envCol = {};
function col(e) {
  if (envCol[e]) return envCol[e];
  var o = AT.envs && AT.envs[e];
  if (o && o.c) return (envCol[e] = o.c);
  var c = AT.map && AT.map.env[e];
  if (!c) return (envCol[e] = "rgb(96,90,80)");
  var r = c[0] / 255, g = c[1] / 255, b = c[2] / 255;
  var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, sa = 0, d = mx - mn;
  if (d) {
    sa = d / (1 - Math.abs(2 * l - 1));
    h = mx === r ? ((g - b) / d) % 6 : (mx === g ? (b - r) / d + 2 : (r - g) / d + 4);
    h *= 60; if (h < 0) h += 360;
  }
  return (envCol[e] = "hsl(" + Math.round(h) + "," + Math.round(sa * 38) + "%," + Math.round(30 + l * 18) + "%)");
}
// A game colour (#hex) muted the same way, for the wilderness tiles.
var hueCol = {};
function hue(hex) {
  if (hueCol[hex]) return hueCol[hex];
  var h6 = hex.length === 4 ? hex.replace(/^#(.)(.)(.)$/, "#$1$1$2$2$3$3") : hex.slice(0, 7);
  var n = parseInt(h6.slice(1), 16);
  if (isNaN(n)) return (hueCol[hex] = "rgb(96,90,80)");
  var r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  var mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, h = 0, sa = 0, d = mx - mn;
  if (d) {
    sa = d / (1 - Math.abs(2 * l - 1));
    h = mx === r ? ((g - b) / d) % 6 : (mx === g ? (b - r) / d + 2 : (r - g) / d + 4);
    h *= 60; if (h < 0) h += 360;
  }
  return (hueCol[hex] = "hsl(" + Math.round(h) + "," + Math.round(sa * 38) + "%," + Math.round(24 + l * 30) + "%)");
}
function areaTitle(aid) { return AT.title(aid); }

var H = AT.here, V = AT.view, M = AT.map;
var WILD = !!(H && H.wild);       // in the wilderness: the game's own map
// Party members' rooms, through loom (partycomms-atlas, #451): those in your
// room are left out (Ricardo); partyOn[room] = members drawn on the map, the
// rest listed under it.
var LP = client.loom.loom;
var party = (LP && LP.answer) ? LP.answer("atlas", "atlas.party") : undefined;
if (!Array.isArray(party)) party = [];
party = party.filter(function (p) { return p && p.name && p.room > 0 && !(H && Number(p.room) === H.id); });
var partyOn = {}, partyDrawn = {};
var aid = V.area;
var here = H ? AT.room(H.id) : null;
var expl = aid && AT.known[aid] ? AT.exAll : null;   // every explored room, once a list covers this area
var fogOn = AT.fog && !!expl;
var nExpl = aid ? AT.count(aid) : -1;
var roomLine = H ? esc(H.name || "?") + ' &middot; ' + H.id : "";

{
  if (AT.drawT) { clearTimeout(AT.drawT); AT.drawT = null; }
  var html = '<div id="loom-atlas" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;height:100%;min-height:300px;box-sizing:border-box;display:flex;flex-direction:column;">';

  // Title: Atlas, the area, the controls.
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
  html += '<span style="display:flex;align-items:baseline;gap:8px;min-width:0;"><span style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:2px;font-size:15px;color:' + AMBER + ';flex:none;">Atlas</span>';
  if (WILD || aid) html += '<span style="font-family:' + SERIF + ';font-size:13px;color:' + TXT + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(WILD ? "the wilderness" : areaTitle(aid)) + '</span>';
  html += '</span><span style="display:flex;align-items:baseline;gap:4px;flex:none;">';
  if (M && !WILD) {
    html += chip('&minus;', 'zoom(1.25)', 'zoom out (or the mouse wheel)') + chip('+', 'zoom(0.8)', 'zoom in (or the mouse wheel)');
    html += chip('&#8982;', 'centre()', 'back to the room you\'re in');
    html += chip('FOG', 'fog()', AT.fog ? 'fog of war on: only the rooms you\'ve explored (click to show every room)' : 'fog of war off: every room on the map, unexplored ones faint (click to hide them)', AT.fog);
  }
  html += '</span></div>';

  // Line 2: the room, its level, explored (in the wilderness: the room and
  // its environment).
  if (WILD) {
    html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:3px 0 2px;color:' + MUTED + ';">';
    html += '<span style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:' + SERIF + ';font-size:12px;color:' + TXT + ';">' + esc(H.name || "?") + '</span>';
    html += '<span style="flex:none;white-space:nowrap;">' + esc([H.env].concat(H.details || []).filter(function (x) { return x; }).join(" · ")) + '</span></div>';
  } else if (M && aid) {
    var zs = AT.levels(aid), zi = zs.indexOf(V.z);
    var up = zi >= 0 && zi < zs.length - 1, dn = zi > 0;
    var hereLvl = here && here.a === aid ? here.z : null;
    html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:3px 0 2px;color:' + MUTED + ';">';
    html += '<span class="loom-atlas-room" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:' + SERIF + ';font-size:12px;color:' + TXT + ';">' + roomLine + '</span>';
    html += '<span style="flex:none;white-space:nowrap;">';
    if (zs.length > 1) html += arrow('&#9660;', -1, dn, 'the level below') + '<span title="the level shown' + (hereLvl !== null && hereLvl !== V.z ? ' (you\'re on ' + lvl(hereLvl) + ')' : '') + '" style="color:' + (hereLvl !== null && hereLvl !== V.z ? AMBER : MUTED) + ';">level ' + lvl(V.z) + '</span>' + arrow('&#9650;', 1, up, 'the level above') + ' &middot; ';
    var mapped = AT.areaRooms(aid).length;
    if (aid === AT.SKETCH) html += '<span title="this place is on no map (an instance like the Mnemosyne): Atlas sketches the rooms as you walk, and forgets them when you leave">sketched as you walk &middot; ' + mapped + (mapped === 1 ? ' room' : ' rooms') + '</span>';
    else html += nExpl >= 0 ? '<span title="rooms on the community map you\'ve explored here (from the game\'s record), of all the rooms it has in this area">' + nExpl + ' of ' + mapped + ' explored</span>'
      : (AT.uncounted[aid] ? '<span title="the game sent no explored rooms when you walked in: it keeps no record of exploring this area">' + mapped + ' rooms &middot; no exploration record</span>'
      : '<span title="the game tells which rooms you\'ve explored when you enter an area">' + mapped + ' rooms on the map</span>');
    html += '</span></div>';
  }

  // The map.
  html += '<div style="flex:1 1 auto;position:relative;min-height:240px;margin-top:4px;border:1px solid ' + RULE + ';overflow:hidden;">';
  if (WILD) {
    // The game's map, as it sent it: fitted to the frame (container units),
    // one character cell per room, you the @.
    var WM = AT.wildMap;
    if (WM && WM.grid && WM.grid.length && AT.wildOn && AT.wildStyle !== "text") {
      // Tiles: each cell a square in its colour (the background when it has
      // one, else the character's), muted as Atlas's own rooms; you an amber
      // ring (your cell is the @, or the white one: flying shows another
      // mark); ? cells (ways out of the wilderness) a small marker.
      var gw = Math.max(WM.cols, 1), gh = WM.grid.length, tiles = '', glyphs = '', outs = '', meX = -1, meY = -1, best = 1e9;
      for (var gy = 0; gy < gh; gy++) {
        var rowc = WM.grid[gy], runC = null, runX = 0;
        for (var gx = 0; gx <= rowc.length; gx++) {
          var cell = rowc[gx], cc = null;
          if (cell) {
            var chr = cell[0], fgc = cell[1], bgc = cell[2];
            var mine = chr === "@" || (chr !== " " && /^#f{3}(?:f{3})?$/i.test(fgc || ""));
            if (mine) { var dd = Math.abs(gx - gw / 2) + Math.abs(gy - gh / 2) - (chr === "@" ? 1e6 : 0); if (dd < best) { best = dd; meX = gx; meY = gy; } }
            if (chr === "?") outs += '<g><title>a way out of the wilderness</title><circle cx="' + (gx + 0.5) + '" cy="' + (gy + 0.5) + '" r="0.32" fill="' + AMBER + '" stroke="#000" stroke-width="0.08"/></g>';
            cc = bgc || (chr !== " " && !mine ? fgc : null) || (mine ? (bgc || null) : null);
            if (cc) cc = hue(cc);
            // The letter, faint, where a background carries the colour: it tells
            // apart terrains drawn in the same colours (waves on water, trees).
            if (bgc && fgc && chr !== " " && chr !== "?" && !mine)
              glyphs += '<text x="' + (gx + 0.5) + '" y="' + (gy + 0.55) + '" fill="' + hue(fgc) + '">' + (chr === "<" ? "&lt;" : chr === "&" ? "&amp;" : chr === ">" ? "&gt;" : chr) + '</text>';
          }
          if (cc !== runC) {
            if (runC) tiles += '<rect x="' + runX + '" y="' + gy + '" width="' + (gx - runX) + '" height="1" fill="' + runC + '"/>';
            runC = cc; runX = gx;
          }
        }
      }
      var me = meX >= 0 ? '<circle cx="' + (meX + 0.5) + '" cy="' + (meY + 0.5) + '" r="0.9" fill="none" stroke="' + AMBER + '" stroke-width="0.28"/>' : '';
      html += '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.5 -0.5 ' + (gw + 1) + ' ' + (gh + 1) + '" preserveAspectRatio="xMidYMid meet" style="position:absolute;inset:0;width:100%;height:100%;display:block;background:' + BG + ';" shape-rendering="crispEdges">' +
        tiles + '<g shape-rendering="auto" font-family="' + MONO + '" font-size="0.9" text-anchor="middle" dominant-baseline="central" opacity="0.55" pointer-events="none">' + glyphs + '</g>' +
        '<g shape-rendering="auto">' + outs + me + '</g></svg>';
    } else if (WM && WM.rows.length && AT.wildOn) {
      var wc = Math.max(WM.cols, 1), wr = WM.rows.length;
      html += '<div style="position:absolute;inset:0;container-type:size;display:flex;align-items:center;justify-content:center;background:#000;">';
      html += '<pre style="margin:0;font-family:' + MONO + ';line-height:1;letter-spacing:0;color:#aaaaaa;font-size:14px;font-size:min(' + (100 / wc / 0.6).toFixed(2) + 'cqw,' + (100 / wr).toFixed(2) + 'cqh);">' + WM.rows.join("\n") + '</pre></div>';
    } else {
      html += '<div style="padding:12px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">' +
        (AT.wildOn ? "The wilderness map shows with your next step." : "The wilderness map stays in the main window (ATLAS WILDERNESS ON shows it here).") + '</div>';
    }
  } else if (!M) {
    var msg = AT.state == "loading" ? AT.note || "loading the community map…"
      : (AT.state == "failed" ? "Couldn't load the community map: " + AT.note + "." : "The community map isn't loaded yet.");
    html += '<div style="padding:12px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">' + esc(msg);
    if (AT.state != "loading") html += ' <span onclick="window.loomAtlas&&window.loomAtlas.reload()" style="cursor:pointer;font-style:normal;font-family:' + MONO + ';font-size:10px;color:' + AMBER + ';border:1px solid ' + DEEP + ';padding:0 5px;letter-spacing:0.08em;">RELOAD</span>';
    html += '</div>';
  } else if (!aid) {
    html += '<div style="padding:12px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">Move or LOOK, and the map follows you.</div>';
  } else {
    var DIR = { north: [0, -1], south: [0, 1], east: [1, 0], west: [-1, 0], northeast: [1, -1], northwest: [-1, -1], southeast: [1, 1], southwest: [-1, 1] };
    var ids = AT.areaRooms(aid), shown = {}, list = [];
    for (var i = 0; i < ids.length; i++) {
      var R = AT.room(ids[i]);
      if (R.z !== V.z) continue;
      var known = !expl || !!expl[R.id] || (here && here.id === R.id);
      if (fogOn && !known) continue;
      shown[R.id] = known ? 1 : 2;           // 2: unexplored, shown faint (fog off)
      list.push(R);
    }
    var lines = '', stubs = '', rooms = '', marks = '';
    for (var k = 0; k < list.length; k++) {
      var Q = list[k], qx = Q.x, qy = -Q.y;
      // Lines only for the eight compass directions: up, down, in and out are
      // marks inside the room (a line for them read as a compass exit).
      var ins = { up: 0, down: 0, "in": 0, out: 0 }, exl = [];
      for (var d in Q.ex) {
        if (!Q.ex.hasOwnProperty(d)) continue;
        // With fog, an exit shows when it leads somewhere explored, or the
        // game itself lists it: for the room you're in (Room.Info), or in the
        // area's official map, which has no hidden exits (the crowdmap does).
        // A crowdmap-only exit into the unknown stays hidden.
        if (fogOn && !AT.exAll[Q.ex[d]] && !(here && Q.id === here.id && H.exits && H.exits[Q.ex[d]]) &&
          !(AT.offEx && AT.offEx[Q.id] && AT.offEx[Q.id][d] === Q.ex[d])) continue;
        exl.push(d);
        if (ins.hasOwnProperty(d)) { ins[d] = 1; continue; }
        var v = DIR[d];
        if (!v) continue;
        var to = Q.ex[d], T = AT.room(to);
        if (T && T.a === aid && T.z === V.z && shown[to]) {
          if (Q.id < to || !(T.ex && Object.keys(T.ex).some(function (kk) { return DIR[kk] && T.ex[kk] === Q.id; })))
            lines += '<line x1="' + qx + '" y1="' + qy + '" x2="' + T.x + '" y2="' + (-T.y) + '"' + (shown[to] === 2 || shown[Q.id] === 2 ? ' opacity="0.4"' : '') + '/>';
        } else {
          var other = T && T.a !== aid;
          var nv = Math.sqrt(v[0] * v[0] + v[1] * v[1]), ux = v[0] / nv, uy = v[1] / nv;
          var len = other ? 0.78 : 0.6;
          var tx = qx + ux * len, ty = qy + uy * len;
          var tip = '<title>' + esc(d + (other ? ' to ' + areaTitle(T.a) : (T && T.z !== V.z ? ' (another level)' : ' (somewhere you haven\'t explored)'))) + '</title>';
          if (other) {
            // Into another area: a line ending in an arrowhead, as on the stock map.
            var bx = tx - ux * 0.2, by = ty - uy * 0.2;
            stubs += '<g stroke="' + AMBER + '" fill="' + AMBER + '">' + tip +
              '<line x1="' + qx + '" y1="' + qy + '" x2="' + bx.toFixed(2) + '" y2="' + by.toFixed(2) + '"/>' +
              '<path stroke-width="0.02" d="M' + tx.toFixed(2) + ' ' + ty.toFixed(2) + ' L' + (bx - uy * 0.12).toFixed(2) + ' ' + (by + ux * 0.12).toFixed(2) + ' L' + (bx + uy * 0.12).toFixed(2) + ' ' + (by - ux * 0.12).toFixed(2) + ' Z"/></g>';
          } else {
            stubs += '<line x1="' + qx + '" y1="' + qy + '" x2="' + tx.toFixed(2) + '" y2="' + ty.toFixed(2) + '" stroke="' + DIM + '" stroke-dasharray="0.06 0.08">' + tip + '</line>';
          }
        }
      }
      var faint = shown[Q.id] === 2;
      rooms += '<rect class="loom-atlas-r" x="' + (qx - 0.3) + '" y="' + (qy - 0.3) + '" width="0.6" height="0.6" rx="0.08" fill="' + col(Q.e) + '"' + (faint ? ' opacity="0.35"' : '') +
        ' onclick="window.loomAtlas&&window.loomAtlas.go(' + Q.id + ')"><title>' + esc((Q.n || "?") + " (" + Q.id + ")" + (AT.envs && AT.envs[Q.e] && AT.envs[Q.e].n ? " · " + AT.envs[Q.e].n : "") + (exl.length ? " · exits: " + exl.join(", ") : "") + (faint ? " · not explored" : "") + " · click to walk here") + '</title></rect>';
      // As the stock map: one arrow in the middle of the room (▲ up, ▼ down,
      // ▶ in, ◀ out, as the stock map (Ricardo)); up and down together an hourglass (▼ over ▲, tips
      // meeting), in and out together the same on its side. With both pairs,
      // up/down on the left half of the room, in/out on the right.
      var vU = ins.up, vD = ins.down, hI = ins["in"], hO = ins.out, both = (vU || vD) && (hI || hO);
      function tri(cx, cy, dir, w, h) {
        // dir: 0 up, 1 down, 2 left, 3 right; (cx, cy) the middle of the triangle's box.
        var a = w / 2, b = h / 2, P;
        if (dir === 0) P = [[cx - a, cy + b], [cx, cy - b], [cx + a, cy + b]];
        else if (dir === 1) P = [[cx - a, cy - b], [cx, cy + b], [cx + a, cy - b]];
        else if (dir === 2) P = [[cx + b, cy - a], [cx - b, cy], [cx + b, cy + a]];
        else P = [[cx - b, cy - a], [cx + b, cy], [cx - b, cy + a]];
        return '<path d="M' + P.map(function (p) { return p[0].toFixed(3) + ' ' + p[1].toFixed(3); }).join(' L') + ' Z"/>';
      }
      if (!both) {
        if (vU && vD) marks += tri(qx, qy - 0.075, 1, 0.3, 0.15) + tri(qx, qy + 0.075, 0, 0.3, 0.15);
        else if (vU) marks += tri(qx, qy, 0, 0.32, 0.26);
        else if (vD) marks += tri(qx, qy, 1, 0.32, 0.26);
        if (hI && hO) marks += tri(qx - 0.075, qy, 3, 0.3, 0.15) + tri(qx + 0.075, qy, 2, 0.3, 0.15);
        else if (hI) marks += tri(qx, qy, 3, 0.32, 0.26);
        else if (hO) marks += tri(qx, qy, 2, 0.32, 0.26);
      } else {
        // Both pairs (Ricardo: a big ▼ covered a small ▶): the room split in
        // two, up/down on the left half, in/out on the right, the same size.
        var lx = qx - 0.13, rx = qx + 0.13;
        if (vU && vD) marks += tri(lx, qy - 0.06, 1, 0.2, 0.12) + tri(lx, qy + 0.06, 0, 0.2, 0.12);
        else if (vU) marks += tri(lx, qy, 0, 0.22, 0.18);
        else marks += tri(lx, qy, 1, 0.22, 0.18);
        if (hI && hO) marks += tri(rx - 0.06, qy, 3, 0.2, 0.12) + tri(rx + 0.06, qy, 2, 0.2, 0.12);
        else if (hI) marks += tri(rx, qy, 3, 0.22, 0.18);
        else marks += tri(rx, qy, 2, 0.22, 0.18);
      }
    }
    // ---- From other packages, through loom (#451): waypoints and quests ----
    var LL = client.loom.loom, pins = '', partyRings = '';
    for (var pi = 0; pi < party.length; pi++) if (shown[party[pi].room] === 1) (partyOn[party[pi].room] || (partyOn[party[pi].room] = [])).push(party[pi]);
    var wpAt = {}, qAt = {}, sAt = {};
    var wps = (LL && LL.answer) ? LL.answer("atlas", "atlas.waypoints") : undefined;
    if (Array.isArray(wps)) for (var wi = 0; wi < wps.length; wi++) if (wps[wi] && wps[wi].id) wpAt[wps[wi].id] = wps[wi];
    var qm = (LL && LL.answer) ? LL.answer("atlas", "atlas.quests") : undefined;
    if (qm && typeof qm == "object") {
      if (qm.follow && Array.isArray(qm.follow.goes)) for (var qi = 0; qi < qm.follow.goes.length; qi++) {
        var G = qm.follow.goes[qi];
        (qAt[G.room] || (qAt[G.room] = [])).push(G);
      }
      if (Array.isArray(qm.starts)) for (var sj = 0; sj < qm.starts.length; sj++) (sAt[qm.starts[sj].room] || (sAt[qm.starts[sj].room] = [])).push(qm.starts[sj].name);
    }
    for (var pk = 0; pk < list.length; pk++) {
      var P = list[pk], px = P.x, py = -P.y, w = wpAt[P.id], qs = qAt[P.id], ss = sAt[P.id];
      if (w) {
        // ⚑ in a circle at the top right corner (Ricardo), name and note on
        // hover: a light badge with a red pennant, apart from the quest badges.
        var fx = px + 0.27, fy = py - 0.27;
        pins += '<g style="cursor:pointer;" onclick="window.loomAtlas&&window.loomAtlas.go(' + P.id + ')"><title>' + esc("⚑ " + w.name + (w.note ? " — " + w.note : "") + " (waypoint)") + '</title>' +
          '<circle cx="' + fx.toFixed(2) + '" cy="' + fy.toFixed(2) + '" r="0.2" fill="#ece4d2" stroke="#000" stroke-width="0.045"/>' +
          '<path d="M' + (fx - 0.07).toFixed(3) + ' ' + (fy + 0.13).toFixed(3) + ' V' + (fy - 0.13).toFixed(3) + '" stroke="#000" stroke-width="0.05" stroke-linecap="round"/>' +
          '<path d="M' + (fx - 0.06).toFixed(3) + ' ' + (fy - 0.13).toFixed(3) + ' l0.18 0.065 l-0.18 0.065 z" fill="#c0392b" stroke="#000" stroke-width="0.02" stroke-linejoin="round"/></g>';
      }
      var pm = partyOn[P.id];
      if (pm && pm.length) {
        // Party members here: a ring like yours, the same size, in their
        // colour (Ricardo); several in one room share it, one arc each.
        var rr = 0.48, nm = pm.map(function (m) { return m.name; }).join(", ");
        var ringG = '<g style="cursor:pointer;" onclick="window.loomAtlas&&window.loomAtlas.go(' + P.id + ')"><title>' + esc(nm + " (party)") + '</title>';
        if (pm.length === 1) ringG += '<circle cx="' + px + '" cy="' + py + '" r="' + rr + '" fill="none" stroke="' + esc(pm[0].colour || AMBER) + '" stroke-width="0.09" pointer-events="stroke"/>';
        else for (var pa = 0; pa < pm.length; pa++) {
          var gap = 0.18, a0 = -Math.PI / 2 + pa * 2 * Math.PI / pm.length + gap / 2, a1 = -Math.PI / 2 + (pa + 1) * 2 * Math.PI / pm.length - gap / 2;
          ringG += '<path d="M' + (px + rr * Math.cos(a0)).toFixed(3) + ' ' + (py + rr * Math.sin(a0)).toFixed(3) + ' A' + rr + ' ' + rr + ' 0 ' + (a1 - a0 > Math.PI ? 1 : 0) + ' 1 ' + (px + rr * Math.cos(a1)).toFixed(3) + ' ' + (py + rr * Math.sin(a1)).toFixed(3) + '" fill="none" stroke="' + esc(pm[pa].colour || AMBER) + '" stroke-width="0.09" stroke-linecap="round" pointer-events="stroke"/>';
        }
        partyRings += ringG + '</g>';
        for (var pd = 0; pd < pm.length; pd++) partyDrawn[pm[pd].name] = true;
      }
      var mk = AT.marks[P.id];
      if (mk && AT.icons[mk[0]]) {
        // Your own mark, bottom left corner: the icon in a light circle.
        var ix = px - 0.27, iy = py + 0.27, ic = AT.icons[mk[0]], gl = '';
        for (var gi = 0; gi < ic[1].length; gi++) {
          var part = ic[1][gi];
          gl += part[0] === "s" ? '<path d="' + part[1] + '" fill="none" stroke="#000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'
            : '<path d="' + part[1] + '" fill="' + (part[0] === "w" ? "#ece4d2" : "#000") + '"/>';
        }
        pins += '<g style="cursor:pointer;" onclick="window.loomAtlas&&window.loomAtlas.go(' + P.id + ')"><title>' + esc(ic[0] + (mk[1] ? " — " + mk[1] : "") + " (your mark; ATLAS UNMARK " + P.id + " removes it)") + '</title>' +
          '<circle cx="' + ix.toFixed(2) + '" cy="' + iy.toFixed(2) + '" r="0.2" fill="#ece4d2" stroke="#000" stroke-width="0.045"/>' +
          '<g transform="translate(' + (ix - 0.136).toFixed(3) + ' ' + (iy - 0.136).toFixed(3) + ') scale(0.017)">' + gl + '</g></g>';
      }
      if (qs && qs.length) {
        // The followed quest's GO steps, numbered at the top left corner; the
        // step you're on in amber, the others in blue.
        var now = qs.filter(function (g) { return g.now; })[0], show = now || qs[0];
        var nums = qs.map(function (g) { return g.n; }).join(", ");
        var bx = px - 0.27, by = py - 0.27, r = now ? 0.19 : 0.16;
        pins += '<g style="cursor:pointer;" onclick="window.loomAtlas&&window.loomAtlas.go(' + P.id + ')"><title>' + esc((qm.follow.name || "quest") + ": step " + nums + (now ? " (the step you're on)" : "") + " · GO here") + '</title>' +
          '<circle cx="' + bx.toFixed(2) + '" cy="' + by.toFixed(2) + '" r="' + r + '" fill="' + (now ? AMBER : "#7fb0e8") + '" stroke="#000" stroke-width="0.04"/>' +
          '<text x="' + bx.toFixed(2) + '" y="' + (by + 0.005).toFixed(3) + '" font-size="' + (show.n > 9 ? 0.17 : 0.22) + '" font-family="Consolas,monospace" font-weight="bold" fill="#000" text-anchor="middle" dominant-baseline="central">' + show.n + '</text></g>';
      } else if (ss && ss.length) {
        // A quest you can start now begins here.
        var sx = px - 0.27, sy = py - 0.27;
        pins += '<g style="cursor:pointer;" onclick="window.loomAtlas&&window.loomAtlas.go(' + P.id + ')"><title>' + esc("Ready to start here: " + ss.join(", ")) + '</title>' +
          '<circle cx="' + sx.toFixed(2) + '" cy="' + sy.toFixed(2) + '" r="0.16" fill="#e8c65a" stroke="#000" stroke-width="0.04"/>' +
          '<text x="' + sx.toFixed(2) + '" y="' + (sy + 0.005).toFixed(3) + '" font-size="0.24" font-family="Georgia,serif" font-weight="bold" fill="#000" text-anchor="middle" dominant-baseline="central">!</text></g>';
      }
    }
    var ring = '';
    if (here && here.a === aid) {
      ring = '<g class="loom-atlas-me" transform="translate(' + here.x + ' ' + (-here.y) + ')"' + (here.z !== V.z ? ' opacity="0.35"' : '') + ' pointer-events="none">' +
        '<circle r="0.48" fill="none" stroke="' + AMBER + '" stroke-width="0.09"/></g>';
    }
    html += '<svg class="loom-atlas-svg" xmlns="http://www.w3.org/2000/svg" viewBox="' + AT.viewBox() + '" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;touch-action:none;"' +
      ' onpointerdown="window.loomAtlas&&window.loomAtlas.down(event)" onpointermove="window.loomAtlas&&window.loomAtlas.move(event)" onpointerup="window.loomAtlas&&window.loomAtlas.up(event)" onpointerleave="window.loomAtlas&&window.loomAtlas.up(event)" onwheel="window.loomAtlas&&window.loomAtlas.wheel(event)">';
    html += '<g stroke="' + MUTED + '" stroke-width="0.07" stroke-linecap="round">' + lines + '</g>';
    html += '<g stroke-width="0.07" stroke-linecap="round">' + stubs + '</g>';
    html += '<g stroke="' + BG + '" stroke-width="0.04">' + rooms + '</g>';
    // The arrows outlined in black so they read on light rooms too (Ricardo).
    html += '<g fill="' + TXT + '" stroke="#000" stroke-width="0.06" stroke-linejoin="round" paint-order="stroke" pointer-events="none">' + marks + '</g>';
    html += partyRings + ring + '<g>' + pins + '</g></svg>';   // party rings under yours, markers on top   // markers over the ring, so yours stay visible
    if (!list.length) html += '<div style="position:absolute;left:12px;top:12px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">' + (ids.length ? "Nothing explored on this level yet." : "This area isn't on the community map.") + '</div>';
  }
  html += '</div>';

  // Party members not drawn on the map: where they are, a click shows it.
  var away = party.filter(function (p) { return !partyDrawn[p.name]; });
  if (M && away.length && !WILD) {
    html += '<div style="margin-top:5px;display:flex;flex-wrap:wrap;gap:4px 10px;align-items:baseline;">';
    html += '<span style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:1px;font-size:12px;color:' + MUTED + ';">Party elsewhere</span>';
    for (var aw = 0; aw < away.length; aw++) {
      var Pm = away[aw], Rr = AT.room(Pm.room);
      var where = !Rr ? "room " + Pm.room + ", not on the map"
        : Rr.a !== aid ? areaTitle(Rr.a)
        : Rr.z !== V.z ? "level " + lvl(Rr.z)
        : "somewhere you haven't explored";
      html += '<span' + (Rr ? ' onclick="window.loomAtlas&&window.loomAtlas.showRoom(' + Pm.room + ')" title="show where ' + esc(Pm.name) + ' is"' : '') + ' style="' + (Rr ? 'cursor:pointer;' : '') + 'white-space:nowrap;">' +
        '<span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:' + esc(Pm.colour || AMBER) + ';border:1px solid #000;margin-right:4px;"></span>' +
        '<span style="font-family:' + SERIF + ';font-size:12px;color:' + TXT + ';">' + esc(Pm.name) + '</span> <span style="color:' + MUTED + ';">&middot; ' + esc(where) + '</span></span>';
    }
    html += '</div>';
  }

  // Footer: what's missing, where the map comes from.
  var foot = [];
  if (WILD) foot.push("The game's own map of the wilderness" + (AT.wildStyle === "text" ? "." : ", drawn as tiles: you're ringed, ways out marked."));
  else if (aid === AT.SKETCH) foot.push("Off the map: rooms appear as you walk, dotted exits lead where you haven't been; a new ripple or a portal starts a fresh sketch.");
  else if (H && !here) foot.push("This room (" + H.id + ") isn't on the community map" + (aid ? "; showing its area." : "."));
  if (M && !WILD && aid && aid !== AT.SKETCH && !expl && !AT.uncounted[aid]) foot.push("Fog of war starts once you enter an area: the game sends its explored rooms then.");
  if (AT.state == "loading" && M) foot.push(AT.note);
  if (M && !WILD) foot.push("Community map version " + M.v + "." + (aid === AT.SKETCH ? " Drag to pan." : " Drag to pan, click a room to walk there."));
  html += '<div style="margin-top:5px;font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';">' + foot.map(esc).join(" ") + '</div>';
  html += '</div>';

  // The whole tab in the panel's colour (#355); rooms light up under the mouse.
  try {
    var atSt = document.getElementById("loom-atlas-style");
    if (!atSt) { atSt = document.createElement("style"); atSt.id = "loom-atlas-style"; document.head.appendChild(atSt); }
    var atCss = '.flexlayout__tab:has(#loom-atlas) { background: ' + BG + ' !important; } .flexlayout__tab:has(#loom-atlas) > * { min-height: 100%; height: 100%; } ' +
      '#loom-atlas .loom-atlas-r { cursor: pointer; } #loom-atlas .loom-atlas-r:hover { stroke: ' + HI + '; stroke-width: 0.08; } #loom-atlas svg:active { cursor: grabbing; }';
    if (atSt.textContent !== atCss) atSt.textContent = atCss;
  } catch (e) {}
  try { set_custom_tab_html("Atlas", html); } catch (e) {}
}
