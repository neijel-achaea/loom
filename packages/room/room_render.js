// room_render -- the Here tab (#158), in the house style shared with Stats,
// Online, Standings: ink panel, serif small-caps headings, monospace rows. The
// accent is a warm lantern amber.
//   - header: room name, area and environment, details as tags, exits, number
//   - description folded to two lines; a click on it unfolds it (a class on the
//     page body, as Online's offline section, so redraws never undo it)
//   - PLAYERS (you left off, full title on hover, a targeted one glowing
//     red), MOBS (your target first,
//     glowing yellow with its health; dead ones greyed),
//     ITEMS (things you can take stand out, fixtures are muted), each as a
//     table: quantity when more than one, the name, and a type column the
//     integrations can fill (shrine, plant…)
// Integrations (0.5: #162 social colours (done), #163 hunting target, #164 shrines,
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
// A table row: quantity (when more than one), the name indented after it, and
// a type column left empty for now (shrines, plants… from the integrations).
// glow: false, or the colour of a targeted row (yellow mob, red player).
function row(n, name, title, type, glow) {
  return '<div' + (title ? ' title="' + esc(title) + '"' : '') + ' style="display:flex;align-items:baseline;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;cursor:default;' + (glow ? 'background:' + (glow === PGLOW ? 'rgba(255,106,94,0.08)' : 'rgba(255,215,94,0.07)') + ';' : '') + '">' +
    '<span style="flex:0 0 2.6em;text-align:right;color:' + MUTED + ';">' + (n > 1 ? n + '&times;' : '') + '</span>' +
    '<span style="flex:1 1 auto;">' + name + '</span>' +
    (type ? '<span style="flex:0 0 auto;color:' + (glow || MUTED) + ';font-style:italic;font-family:' + SERIF + ';">' + esc(type) + '</span>' : '') + '</div>';
}
// Merge items of the same name, keeping order of first appearance.
function merge(list) {
  var out = [], at = {};
  for (var i = 0; i < list.length; i++) {
    var k = list[i].name + "|" + (list[i].attrib || "");
    if (at[k] === undefined) { at[k] = out.length; out.push({ it: list[i], n: 1 }); } else out[at[k]].n++;
  }
  return out;
}

// Your target: whichever changed last, the id from IRE.Target.Info or the tar
// variable (an id, or a word matched against the living mobs' names, first
// match; also the fallback when the game's id isn't in the room). Its row
// glows, as in the stock tab, with its health in the type column.
var GLOW = "#ffd75e";
var PGLOW = "#ff6a5e";
var tarV = String(get_variable("tar") || "").trim();
var useGmcp = !!(R.target && R.target.id && (!tarV || (R.target.at || 0) >= (R.tarAt || 0)));
var tgtId = useGmcp ? String(R.target.id) : (/^\d+$/.test(tarV) ? tarV : "");
var tgtWord = (tarV && !/^\d+$/.test(tarV)) ? tarV.toLowerCase() : "";

var I = R.info || {};
var html = '<div id="loom-here" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:#13110e;border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;">';
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

  // Players, you left off. A player you target glows red: the tar name, or
  // the game's target info naming them, whichever changed last. A player
  // match wins over a mob whose name merely contains the word.
  var pl = [];
  for (var pk in R.players) { if (R.players.hasOwnProperty(pk) && pk.toLowerCase() !== String(R.me).toLowerCase()) pl.push(pk); }
  pl.sort();
  var tgtPl = "";
  for (var pt = 0; pt < pl.length; pt++) {
    var plL = pl[pt].toLowerCase();
    if (useGmcp ? (String(R.target.id).toLowerCase() === plL || String(R.target.name || "").toLowerCase() === plL) : tgtWord === plL) { tgtPl = pl[pt]; break; }
  }
  if (tgtPl) { tgtWord = ""; if (useGmcp) tgtId = ""; }
  html += caps("players", pl.length);
  // Through loom's display entry point (#159): a player's highlight colour
  // and group from social (#162), when both are installed and the link is
  // on; otherwise plain. The target glow still wins.
  var LL = client.loom.loom;
  var ask = function (q, n) { return (LL && LL.answer) ? LL.answer("room", q, n) : undefined; };
  for (var pi = 0; pi < pl.length; pi++) {
    var isT = pl[pi] === tgtPl;
    var pHp = (isT && useGmcp && R.target.hp !== "") ? R.target.hp + "%" : (isT ? "target" : "");
    var pCol = ask("person.colour", pl[pi]);
    var pGrp = ask("person.group", pl[pi]);
    var pTitle = R.players[pl[pi]] || "";
    if (pGrp) pTitle = (pTitle ? pTitle + " \u00b7 " : "") + pGrp;
    html += row(1, '<span style="font-family:' + SERIF + ';font-size:12px;color:' + (isT ? PGLOW + ';text-shadow:0 0 6px ' + PGLOW + ',0 0 2px ' + PGLOW : (pCol || TXT)) + ';">' + esc(pl[pi]) + '</span>', pTitle, pHp, isT ? PGLOW : false);
  }

  // Mobs and items.
  var mobs = [], items = [];
  for (var ik in R.items) {
    if (!R.items.hasOwnProperty(ik)) continue;
    var it = R.items[ik];
    if (/m/.test(it.attrib || "")) mobs.push(it); else items.push(it);
  }
  // The target is split out of its merged group, so only that one glows.
  var tgtMob = null;
  for (var ti = 0; ti < mobs.length && !tgtMob; ti++) { if (tgtId && String(mobs[ti].id) === tgtId) tgtMob = mobs[ti]; }
  for (var tj = 0; tj < mobs.length && !tgtMob && tgtWord; tj++) { if (!/d/.test(mobs[tj].attrib || "") && mobs[tj].name.toLowerCase().indexOf(tgtWord) >= 0) tgtMob = mobs[tj]; }
  var rest = [];
  for (var tk = 0; tk < mobs.length; tk++) { if (mobs[tk] !== tgtMob) rest.push(mobs[tk]); }
  var mm = merge(rest);
  html += caps("mobs", mobs.length);
  if (tgtMob) {
    var tHp = (R.target && String(R.target.id) === String(tgtMob.id) && R.target.hp !== "") ? R.target.hp + "%" : "target";
    html += row(1, '<span style="font-family:' + SERIF + ';font-size:12px;color:' + GLOW + ';text-shadow:0 0 6px ' + GLOW + ',0 0 2px ' + GLOW + ';">' + esc(tgtMob.name) + '</span>', "your target", tHp, GLOW);
  }
  for (var mi = 0; mi < mm.length; mi++) {
    // Dead ones are greyed out; their name already says "the corpse of…".
    var dead = /d/.test(mm[mi].it.attrib || "");
    html += row(mm[mi].n, '<span style="font-family:' + SERIF + ';font-size:12px;color:' + (dead ? DIM : TXT) + ';">' + esc(mm[mi].it.name) + '</span>');
  }
  var im = merge(items);
  html += caps("items", items.length);
  for (var ii = 0; ii < im.length; ii++) {
    var take = /t/.test(im[ii].it.attrib || "");
    html += row(im[ii].n, '<span style="font-family:' + SERIF + ';font-size:11px;color:' + (take ? TXT : MUTED) + ';">' + esc(im[ii].it.name) + '</span>', take ? "you can take this" : "");
  }
}
html += '</div>';
// The description's fold: a style once per page, the body class from the setting.
try {
  if (!document.getElementById("loom-room-style")) {
    var rmSt = document.createElement("style");
    rmSt.id = "loom-room-style";
    // The fold, and the tab the same size whatever the room holds: the panel
    // fills the tab, and the tab's own container takes the panel's ink in
    // case Nexus doesn't pass its height down.
    rmSt.textContent = 'body:not(.loom-room-desc-open) .loom-room-desc { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; } ' +
      '.flexlayout__tab:has(#loom-here) { background: #13110e !important; } .flexlayout__tab:has(#loom-here) > * { min-height: 100%; }';
    document.head.appendChild(rmSt);
    document.body.classList.toggle("loom-room-desc-open", R.descOpen === true);
  }
} catch (e) {}
try { set_custom_tab_html(R.tab, html); } catch (e) {}
