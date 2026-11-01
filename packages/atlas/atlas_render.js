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
// args.full: draw the whole tab. Otherwise a move inside the same area and
// level only moves the ring and the view (Atlas follows every step).
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
var full = !!(args && args.full);
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
// The community map names areas "Delos, the Isle of"; the game says
// "the Isle of Delos".
function areaTitle(aid) {
  if (AT.here && AT.here.area === aid && AT.here.areaName) return AT.here.areaName;
  var n = AT.areaName(aid), m = /^(.+?), (the(?: .+)?)$/i.exec(n);
  return m ? m[2] + " " + m[1] : n;
}

var H = AT.here, V = AT.view, M = AT.map;
var aid = V.area;
var here = H ? AT.room(H.id) : null;
var expl = aid ? AT.explored[aid] : null;
var fogOn = AT.fog && !!expl;
var nExpl = expl ? Object.keys(expl).length : -1;
var roomLine = H ? esc(H.name || "?") + ' &middot; ' + H.id : "";
var sig = [M ? M.v : "", AT.state, aid, V.z, AT.fog, nExpl, (TH.acc || "") + (TH.bg || ""), here ? "on" : "off"].join("|");

// ---- In place: same area, level and explored rooms -----------------------
if (!full && AT.drawnSig === sig) {
  var svs = AT.svgs();
  if (svs.length) {
    var vb = AT.viewBox();
    for (var si = 0; si < svs.length; si++) {
      svs[si].setAttribute("viewBox", vb);
      var me = svs[si].querySelector(".loom-atlas-me");
      if (me && here) me.setAttribute("transform", "translate(" + here.x + " " + (-here.y) + ")");
    }
    try {
      var rl = document.querySelectorAll("#loom-atlas .loom-atlas-room");
      for (var ri = 0; ri < rl.length; ri++) rl[ri].innerHTML = roomLine;
    } catch (e) {}
    AT.syncSoon();
    full = null;
  }
}

if (full !== null) {
  if (AT.syncT) { clearTimeout(AT.syncT); AT.syncT = null; }
  AT.drawnSig = sig;
  var html = '<div id="loom-atlas" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;height:100%;min-height:300px;box-sizing:border-box;display:flex;flex-direction:column;">';

  // Title: Atlas, the area, the controls.
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
  html += '<span style="display:flex;align-items:baseline;gap:8px;min-width:0;"><span style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:2px;font-size:15px;color:' + AMBER + ';flex:none;">Atlas</span>';
  if (aid) html += '<span style="font-family:' + SERIF + ';font-size:13px;color:' + TXT + ';overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">' + esc(areaTitle(aid)) + '</span>';
  html += '</span><span style="display:flex;align-items:baseline;gap:4px;flex:none;">';
  if (M) {
    html += chip('&minus;', 'zoom(1.25)', 'zoom out (or the mouse wheel)') + chip('+', 'zoom(0.8)', 'zoom in (or the mouse wheel)');
    html += chip('&#8982;', 'centre()', 'back to the room you\'re in');
    html += chip('FOG', 'fog()', AT.fog ? 'fog of war on: only the rooms you\'ve explored (click to show every room)' : 'fog of war off: every room on the map, unexplored ones faint (click to hide them)', AT.fog);
  }
  html += '</span></div>';

  // Line 2: the room, its level, explored.
  if (M && aid) {
    var zs = AT.levels(aid), zi = zs.indexOf(V.z);
    var up = zi >= 0 && zi < zs.length - 1, dn = zi > 0;
    var hereLvl = here && here.a === aid ? here.z : null;
    html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:3px 0 2px;color:' + MUTED + ';">';
    html += '<span class="loom-atlas-room" style="min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-family:' + SERIF + ';font-size:12px;color:' + TXT + ';">' + roomLine + '</span>';
    html += '<span style="flex:none;white-space:nowrap;">';
    if (zs.length > 1) html += arrow('&#9660;', -1, dn, 'the level below') + '<span title="the level shown' + (hereLvl !== null && hereLvl !== V.z ? ' (you\'re on ' + lvl(hereLvl) + ')' : '') + '" style="color:' + (hereLvl !== null && hereLvl !== V.z ? AMBER : MUTED) + ';">level ' + lvl(V.z) + '</span>' + arrow('&#9650;', 1, up, 'the level above') + ' &middot; ';
    var mapped = AT.areaRooms(aid).length;
    html += nExpl >= 0 ? '<span title="rooms you\'ve explored here (the game\'s count) of the rooms in this area on the community map">' + nExpl + ' of ' + mapped + ' explored</span>'
      : '<span title="the game tells which rooms you\'ve explored when you enter an area">' + mapped + ' rooms on the map</span>';
    html += '</span></div>';
  }

  // The map.
  html += '<div style="flex:1 1 auto;position:relative;min-height:240px;margin-top:4px;border:1px solid ' + RULE + ';overflow:hidden;">';
  if (!M) {
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
      for (var d in Q.ex) {
        if (!Q.ex.hasOwnProperty(d)) continue;
        var to = Q.ex[d], T = AT.room(to), v = DIR[d];
        if (T && T.a === aid && T.z === V.z && shown[to]) {
          if (Q.id < to || !(T.ex && Object.keys(T.ex).some(function (kk) { return T.ex[kk] === Q.id; })))
            lines += '<line x1="' + qx + '" y1="' + qy + '" x2="' + T.x + '" y2="' + (-T.y) + '"' + (shown[to] === 2 || shown[Q.id] === 2 ? ' opacity="0.4"' : '') + '/>';
        } else if (v) {
          var len = 0.62, other = T && T.a !== aid;
          var ex2 = qx + v[0] * len, ey2 = qy + v[1] * len;
          stubs += '<line x1="' + qx + '" y1="' + qy + '" x2="' + ex2.toFixed(2) + '" y2="' + ey2.toFixed(2) + '" stroke="' + (other ? AMBER : DIM) + '" stroke-dasharray="' + (other ? '0.12 0.08' : '0.06 0.08') + '">' +
            '<title>' + esc(d + (other ? ' to ' + areaTitle(T.a) : (T && T.z !== V.z ? ' (another level)' : ' (somewhere you haven\'t explored)'))) + '</title></line>';
        }
      }
      var faint = shown[Q.id] === 2;
      rooms += '<rect class="loom-atlas-r" x="' + (qx - 0.3) + '" y="' + (qy - 0.3) + '" width="0.6" height="0.6" rx="0.08" fill="' + col(Q.e) + '"' + (faint ? ' opacity="0.35"' : '') +
        ' onclick="window.loomAtlas&&window.loomAtlas.go(' + Q.id + ')"><title>' + esc((Q.n || "?") + " (" + Q.id + ")" + (faint ? " · not explored" : "") + " · click to walk here") + '</title></rect>';
      // Up and down: small marks inside the room.
      var upx = false, dnx = false;
      for (var e2 in Q.ex) {
        if (!Q.ex.hasOwnProperty(e2)) continue;
        if (e2 === "up") upx = true; else if (e2 === "down") dnx = true;
        else if (!DIR[e2]) { var T2 = AT.room(Q.ex[e2]); if (T2 && T2.z > V.z) upx = true; else if (T2 && T2.z < V.z) dnx = true; }
      }
      if (upx) marks += '<path d="M' + (qx - 0.12) + ' ' + (qy - 0.05) + ' l0.12 -0.16 l0.12 0.16 z"/>';
      if (dnx) marks += '<path d="M' + (qx - 0.12) + ' ' + (qy + 0.05) + ' l0.12 0.16 l0.12 -0.16 z"/>';
    }
    var ring = '';
    if (here && here.a === aid) {
      ring = '<g class="loom-atlas-me" transform="translate(' + here.x + ' ' + (-here.y) + ')"' + (here.z !== V.z ? ' opacity="0.35"' : '') + ' pointer-events="none">' +
        '<circle r="0.48" fill="none" stroke="' + AMBER + '" stroke-width="0.09"/><circle r="0.12" fill="' + HI + '"/></g>';
    }
    html += '<svg class="loom-atlas-svg" xmlns="http://www.w3.org/2000/svg" viewBox="' + AT.viewBox() + '" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%;display:block;cursor:grab;touch-action:none;"' +
      ' onpointerdown="window.loomAtlas&&window.loomAtlas.down(event)" onpointermove="window.loomAtlas&&window.loomAtlas.move(event)" onpointerup="window.loomAtlas&&window.loomAtlas.up(event)" onpointerleave="window.loomAtlas&&window.loomAtlas.up(event)" onwheel="window.loomAtlas&&window.loomAtlas.wheel(event)">';
    html += '<g stroke="' + MUTED + '" stroke-width="0.07" stroke-linecap="round">' + lines + '</g>';
    html += '<g stroke-width="0.07" stroke-linecap="round">' + stubs + '</g>';
    html += '<g stroke="' + BG + '" stroke-width="0.04">' + rooms + '</g>';
    html += '<g fill="' + TXT + '" opacity="0.85" pointer-events="none">' + marks + '</g>';
    html += ring + '</svg>';
    if (!list.length) html += '<div style="position:absolute;left:12px;top:12px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">' + (ids.length ? "Nothing explored on this level yet." : "This area isn't on the community map.") + '</div>';
  }
  html += '</div>';

  // Footer: what's missing, where the map comes from.
  var foot = [];
  if (H && !here) foot.push("This room (" + H.id + ") isn't on the community map" + (aid ? "; showing its area." : "."));
  if (M && aid && !expl) foot.push("Fog of war starts once you enter an area: the game sends its explored rooms then.");
  if (AT.state == "loading" && M) foot.push(AT.note);
  if (M) foot.push("Community map version " + M.v + ". Drag to pan, click a room to walk there.");
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
