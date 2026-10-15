// room_render -- the Here tab (#158), in the house style shared with Stats,
// Online, Standings: ink panel, serif small-caps headings, monospace rows. The
// accent is a warm lantern amber.
//   - header: room name, area and environment, details as tags, exits, number
//   - description folded to two lines; a click on it unfolds it (a class on the
//     page body, as Online's offline section, so redraws never undo it)
//   - PLAYERS (you left off, full title on hover), MOBS (duplicates merged,
//     dead ones marked), ITEMS (duplicates merged; things you can take stand
//     out, fixtures are muted)
// Integrations (0.5: #162 social colours, #163 hunting target, #164 shrines,
// #165 sigils, #166 plants) will mark rows through the display entry point #159.
var R = client.loom.room;
var AMBER = "#e0b46c";
var DEEP = "#7a5f33";
var TXT = "#e8e2d6";
var MUTED = "#8f877a";
var DIM = "#6d665b";
var RULE = "#2b2620";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function caps(t, n) { return '<div style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.12em;font-size:11px;color:' + (n ? AMBER : DIM) + ';margin:8px 0 2px;border-top:1px solid ' + RULE + ';padding-top:5px;">' + t + ' <span style="color:' + MUTED + ';">' + n + '</span></div>'; }
function row(inner, title) { return '<div' + (title ? ' title="' + esc(title) + '"' : '') + ' style="border-bottom:1px dotted ' + RULE + ';padding:1px 0;cursor:default;">' + inner + '</div>'; }
// Merge items of the same name, keeping order of first appearance.
function merge(list) {
  var out = [], at = {};
  for (var i = 0; i < list.length; i++) {
    var k = list[i].name + "|" + (list[i].attrib || "");
    if (at[k] === undefined) { at[k] = out.length; out.push({ it: list[i], n: 1 }); } else out[at[k]].n++;
  }
  return out;
}
function many(m) { return (m.n > 1 ? '<span style="color:' + MUTED + ';">' + m.n + '&times; </span>' : ''); }

var I = R.info || {};
var html = '<div style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:#13110e;border:1px solid ' + RULE + ';padding:7px 8px 8px;">';
if (!R.info) {
  html += '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">Waiting for the room… (move, or LOOK)</div>';
} else {
  var name = String(I.name || "").replace(/\s*\((?:indoors|outdoors)\)\s*$/i, "");
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
  html += '<div style="font-family:' + SERIF + ';color:' + AMBER + ';font-size:13px;letter-spacing:0.06em;">' + esc(name) + '</div>';
  html += '<div style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:11px;white-space:nowrap;">' + esc(I.area || "") + (I.environment ? ' &middot; ' + esc(I.environment) : '') + '</div></div>';
  // Details as tags, exits, room number.
  var tags = "";
  var det = I.details || [];
  for (var di = 0; di < det.length; di++) tags += '<span style="display:inline-block;margin:0 4px 0 0;padding:0 4px;border:1px solid ' + DEEP + ';color:' + MUTED + ';">' + esc(det[di]) + '</span>';
  var ex = [];
  for (var ek in (I.exits || {})) { if (I.exits.hasOwnProperty(ek)) ex.push(ek); }
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-top:3px;">';
  html += '<span>' + tags + '</span>';
  html += '<span style="white-space:nowrap;color:' + MUTED + ';">exits <span style="color:' + AMBER + ';">' + (ex.length ? esc(ex.join("  ")) : "none") + '</span>' + (I.num ? ' &middot; ' + esc(I.num) : '') + '</span></div>';
  if (I.desc) {
    html += '<div onclick="document.body.classList.toggle(\'loom-room-desc-open\')" title="click to unfold or fold" class="loom-room-desc" style="cursor:pointer;margin-top:4px;font-family:' + SERIF + ';font-size:11px;line-height:1.35;color:' + MUTED + ';">' + esc(I.desc) + '</div>';
  }

  // Players, you left off.
  var pl = [];
  for (var pk in R.players) { if (R.players.hasOwnProperty(pk) && pk.toLowerCase() !== String(R.me).toLowerCase()) pl.push(pk); }
  pl.sort();
  html += caps("players", pl.length);
  for (var pi = 0; pi < pl.length; pi++) html += row('<span style="font-family:' + SERIF + ';font-size:12px;color:' + TXT + ';">' + esc(pl[pi]) + '</span>', R.players[pl[pi]]);

  // Mobs and items.
  var mobs = [], items = [];
  for (var ik in R.items) {
    if (!R.items.hasOwnProperty(ik)) continue;
    var it = R.items[ik];
    if (/m/.test(it.attrib || "")) mobs.push(it); else items.push(it);
  }
  var mm = merge(mobs);
  html += caps("mobs", mobs.length);
  for (var mi = 0; mi < mm.length; mi++) {
    var dead = /d/.test(mm[mi].it.attrib || "");
    html += row(many(mm[mi]) + '<span style="font-family:' + SERIF + ';font-size:12px;color:' + (dead ? DIM : TXT) + ';' + (dead ? 'text-decoration:line-through;' : '') + '">' + esc(mm[mi].it.name) + '</span>' + (dead ? ' <span style="color:' + DIM + ';font-style:italic;">dead</span>' : ''));
  }
  var im = merge(items);
  html += caps("items", items.length);
  for (var ii = 0; ii < im.length; ii++) {
    var take = /t/.test(im[ii].it.attrib || "");
    html += row(many(im[ii]) + '<span style="font-family:' + SERIF + ';font-size:11px;color:' + (take ? TXT : MUTED) + ';">' + esc(im[ii].it.name) + '</span>', take ? "you can take this" : "");
  }
}
html += '</div>';
// The description's fold: a style once per page, the body class from the setting.
try {
  if (!document.getElementById("loom-room-style")) {
    var rmSt = document.createElement("style");
    rmSt.id = "loom-room-style";
    rmSt.textContent = 'body:not(.loom-room-desc-open) .loom-room-desc { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }';
    document.head.appendChild(rmSt);
    document.body.classList.toggle("loom-room-desc-open", R.descOpen === true);
  }
} catch (e) {}
try { set_custom_tab_html(R.tab, html); } catch (e) {}
