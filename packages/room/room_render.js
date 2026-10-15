// room_render -- the Here tab (#158), in the house style shared with Stats,
// Online, Standings: ink panel, serif small-caps headings, monospace rows. The
// accent is a warm lantern amber.
//   - header: room name, area and environment, details as tags, exits, number
//   - description folded to two lines; a click on it unfolds it (a class on the
//     page body, as Online's offline section, so redraws never undo it)
//   - PLAYERS (you left off, full title on hover, a targeted one glowing
//     red), MOBS (one row each, in the room's own order, so the next one a
//     name would hit is the next row down; your target glows yellow in
//     place, with its health; dead ones greyed),
//     ITEMS (things you can take stand out, fixtures are muted), each as a
//     table: quantity when more than one, the name, and a type column the
//     integrations can fill (shrine, plant…)
//   - the plants of the room's environment, under the description: here and
//     stocked, here but low, or missing (#166, from harvesting and patrolling)
// Integrations (0.5: #162 social colours (done), #163 hunting target, #164 shrines (done),
// #165 sigils (done), #166 plants (done)) will mark rows through the display entry point #159.
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
// tint: an explicit row background (a flagged item), else the glow's own.
// icon: html for a mark beside the quantity (a flagged item's icon), so
// names stay aligned in every section.
function row(n, name, title, type, glow, tint, icon) {
  return '<div' + (title ? ' title="' + esc(title) + '"' : '') + ' style="display:flex;align-items:baseline;gap:6px;border-bottom:1px dotted ' + RULE + ';padding:1px 0;cursor:default;' + (tint ? 'background:' + tint + ';' : (glow ? 'background:' + (glow === PGLOW ? 'rgba(255,106,94,0.08)' : 'rgba(255,215,94,0.07)') + ';' : '')) + '">' +
    '<span style="flex:0 0 3.4em;text-align:right;font-size:11px;color:' + MUTED + ';white-space:nowrap;">' + (n > 1 ? n + '&times;' : '') + (icon || '') + '</span>' +
    '<span style="flex:1 1 auto;">' + name + '</span>' +
    (type ? '<span style="flex:0 0 auto;font-size:12px;color:' + (glow || MUTED) + ';font-style:italic;font-family:' + SERIF + ';">' + esc(type) + '</span>' : '') + '</div>';
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

// Your target: whichever changed last decides, alone. Either the game's
// (IRE.Target.Info or IRE.Target.Set, in R.target: an id, or a word such as
// a player's name or "rat"; an empty Set means no target) or the tar
// variable (an id or a word). An id glows that mob; a word glows the player
// of that name, else the first living mob whose name holds it. Info's
// short_desc is the word when its id isn't in the room. The row glows, as in
// the stock tab, with its health in the type column.
var GLOW = "#ffd75e";
var PGLOW = "#ff6a5e";
var tarV = String(get_variable("tar") || "").trim();
var gm = R.target || null;
var useGmcp = !!(gm && (gm.none || gm.id || gm.name) && (!tarV || (gm.at || 0) >= (R.tarAt || 0)));
var tgtSrc = useGmcp ? (gm.none ? "" : String(gm.id || "")) : tarV;
var tgtId = /^\d+$/.test(tgtSrc) ? tgtSrc : "";
var tgtWord = (tgtSrc && !tgtId) ? tgtSrc.toLowerCase() : ((useGmcp && !gm.none && gm.name) ? String(gm.name).toLowerCase() : "");

var I = R.info || {};
var html = '<div id="loom-here" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:#13110e;border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;">';
if (!R.info) {
  html += '<div style="color:' + MUTED + ';font-family:' + SERIF + ';font-style:italic;">Waiting for the room… (move, or LOOK)</div>';
} else {
  var name = String(I.name || "").replace(/\s*\((?:indoors|outdoors)\)\s*$/i, "");
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
  html += '<div style="font-family:' + SERIF + ';color:' + AMBER + ';font-size:15px;letter-spacing:0.06em;">' + esc(name) + '</div>';
  html += '<div style="font-family:' + SERIF + ';font-style:italic;color:' + MUTED + ';font-size:11px;white-space:nowrap;">' + esc(I.area || "") + (I.environment ? ' &middot; ' + esc(I.environment) : '') + '</div></div>';
  // Details as tags, exits, room number.
  var tags = "";
  var det = I.details || [];
  for (var di = 0; di < det.length; di++) tags += '<span style="display:inline-block;margin:0 4px 0 0;padding:0 4px;border:1px solid ' + DEEP + ';color:' + MUTED + ';">' + esc(det[di]) + '</span>';
  // Items flagged through loom's display entry point (item.flags: { label,
  // tone }): shrines and totems of friendly or hostile gods (#164, from
  // patrolling), later monoliths (#165). Worked out here so an alert also
  // shows as a tag beside the details, seen without scrolling.
  var LLi = client.loom.loom;
  var FLAG = { bad: "#ff9a4c", good: "#8fd694", info: "#c8bfae" };
  var flagOf = {}, alerts = {};
  for (var fk in R.items) {
    if (!R.items.hasOwnProperty(fk) || /m/.test(R.items[fk].attrib || "")) continue;
    var fa = (LLi && LLi.answers) ? LLi.answers("room", "item.flags", R.items[fk].name) : [];
    if (fa.length) { flagOf[fk] = fa[0].value; if (fa[0].value.tone === "bad") alerts[fa[0].value.label] = true; }
  }
  // Room-wide warnings (room.alerts: [{ label, tone }]), e.g. a city room
  // without a monolith (#165, from sigils), shown like an item's alert.
  if (LLi && LLi.answers) {
    var rNames = [];
    for (var rk in R.items) { if (R.items.hasOwnProperty(rk) && !/m/.test(R.items[rk].attrib || "")) rNames.push(R.items[rk].name); }
    var ra = LLi.answers("room", "room.alerts", { id: I.num, area: I.area, environment: I.environment, items: rNames });
    for (var ri = 0; ri < ra.length; ri++) {
      var rv = ra[ri].value || [];
      for (var rj = 0; rj < rv.length; rj++) {
        if (rv[rj].tone !== "bad") continue;
        alerts[rv[rj].label] = true;
        // The rows the alert is about (e.g. the monolith itself) turn bad too.
        if (rv[rj].mark) { for (var mk in flagOf) { if (flagOf.hasOwnProperty(mk) && flagOf[mk].label === rv[rj].mark) flagOf[mk] = { label: flagOf[mk].label, tone: "bad", icon: flagOf[mk].icon, title: rv[rj].label }; } }
      }
    }
  }
  // The plants of this environment (room.plants: [{ plant, present, low, stock,
  // min }], #166, from harvesting and patrolling), small, one line (Ricardo):
  // green when here and stocked, yellow when here but under its minimum, red
  // when it isn't here at all, with a warning beside the details. Shown only
  // once patrolling's PLANTS check has seen this room.
  var rp = (LLi && LLi.answer) ? LLi.answer("room", "room.plants", { id: I.num, area: I.area, environment: I.environment }) : undefined;
  var plantsHtml = "";
  if (rp && rp.length) {
    var PCOL = { ok: "#8fd694", low: "#e6c75a", gone: "#ff6a5e" };
    var nfmt = function (v) { return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
    var pbits = [], gone = 0;
    for (var pi = 0; pi < rp.length; pi++) {
      var pp = rp[pi];
      var pk2 = !pp.present ? "gone" : (pp.low ? "low" : "ok");
      if (pk2 === "gone") gone++;
      var ptitle = pp.plant + ": " + (pp.present ? "here" : "not here") + "; " + (pp.stock === null || pp.stock === undefined ? "not seen in your rift yet" : nfmt(pp.stock) + " in the rift") + ", minimum " + nfmt(pp.min);
      pbits.push((pi ? ' ' : '') + '<span title="' + esc(ptitle) + '" style="white-space:nowrap;cursor:default;color:' + PCOL[pk2] + ';">' + esc(pp.plant) + (pi < rp.length - 1 ? '<span style="color:' + DIM + ';"> &middot;</span>' : '') + '</span>');
    }
    if (gone) alerts[gone === 1 ? "1 plant missing" : gone + " plants missing"] = true;
    plantsHtml = '<div style="margin-top:3px;font-size:9px;line-height:1.5;">' + pbits.join('') + '</div>';
  }
  for (var al in alerts) { if (alerts.hasOwnProperty(al)) tags += '<span style="display:inline-block;margin:0 4px 0 0;padding:0 4px;border:1px solid ' + FLAG.bad + ';color:' + FLAG.bad + ';">\u26a0 ' + esc(al) + '</span>'; }
  var ex = [];
  for (var ek in (I.exits || {})) { if (I.exits.hasOwnProperty(ek)) ex.push(ek); }
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-top:3px;">';
  html += '<span>' + tags + '</span>';
  html += '<span style="white-space:nowrap;color:' + MUTED + ';">exits <span style="color:' + AMBER + ';">' + (ex.length ? esc(ex.join("  ")) : "none") + '</span>' + (I.num ? ' &middot; ' + esc(I.num) : '') + '</span></div>';
  if (I.desc) {
    html += '<div onclick="document.body.classList.toggle(\'loom-room-desc-open\')" title="click to unfold or fold" class="loom-room-desc" style="cursor:pointer;margin-top:4px;font-family:' + SERIF + ';font-size:11px;line-height:1.35;color:' + MUTED + ';">' + esc(I.desc) + '</div>';
  }
  html += plantsHtml;

  // Players, you left off. A player you target glows red: the tar name, or
  // the game's target info naming them, whichever changed last. A player
  // match wins over a mob whose name merely contains the word.
  var pl = [];
  for (var pk in R.players) { if (R.players.hasOwnProperty(pk) && pk.toLowerCase() !== String(R.me).toLowerCase()) pl.push(pk); }
  pl.sort();
  var tgtPl = "";
  for (var pt = 0; pt < pl.length; pt++) {
    var plL = pl[pt].toLowerCase();
    if (tgtWord === plL) { tgtPl = pl[pt]; break; }
  }
  if (tgtPl) { tgtWord = ""; tgtId = ""; }
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
    html += row(1, '<span style="font-family:' + SERIF + ';font-size:14px;color:' + (isT ? PGLOW + ';text-shadow:0 0 6px ' + PGLOW + ',0 0 2px ' + PGLOW : (pCol || TXT)) + ';">' + esc(pl[pi]) + '</span>', pTitle, pHp, isT ? PGLOW : false);
  }

  // Mobs and items, in the room's own order (R.order; ids not in it, which
  // shouldn't happen, after them).
  var mobs = [], items = [], seenId = {};
  var ord = (R.order || []).slice();
  for (var ik in R.items) { if (R.items.hasOwnProperty(ik) && ord.indexOf(String(ik)) < 0) ord.push(String(ik)); }
  for (var oi = 0; oi < ord.length; oi++) {
    var it = R.items[ord[oi]];
    if (!it || seenId[ord[oi]]) continue;
    seenId[ord[oi]] = true;
    if (/m/.test(it.attrib || "")) mobs.push(it); else items.push(it);
  }
  // Mobs one row each (Ricardo: merging them, then splitting the target out
  // and lifting it to the top, made it hard to see what comes next). The
  // target glows where it stands: by id, or the first living mob whose name
  // holds the tar word, as the game would pick it.
  var tgtMob = null;
  for (var ti = 0; ti < mobs.length && !tgtMob; ti++) { if (tgtId && String(mobs[ti].id) === tgtId) tgtMob = mobs[ti]; }
  for (var tj = 0; tj < mobs.length && !tgtMob && tgtWord; tj++) { if (!/d/.test(mobs[tj].attrib || "") && mobs[tj].name.toLowerCase().indexOf(tgtWord) >= 0) tgtMob = mobs[tj]; }
  html += caps("mobs", mobs.length);
  for (var mi = 0; mi < mobs.length; mi++) {
    var mob = mobs[mi];
    if (mob === tgtMob) {
      var tHp = (R.target && String(R.target.id) === String(mob.id) && R.target.hp !== "") ? R.target.hp + "%" : "target";
      html += row(1, '<span style="font-family:' + SERIF + ';font-size:14px;color:' + GLOW + ';text-shadow:0 0 6px ' + GLOW + ',0 0 2px ' + GLOW + ';">' + esc(mob.name) + '</span>', "your target", tHp, GLOW);
    } else {
      // Dead ones are greyed out; their name already says "the corpse of…".
      var dead = /d/.test(mob.attrib || "");
      html += row(1, '<span style="font-family:' + SERIF + ';font-size:14px;color:' + (dead ? DIM : TXT) + ';">' + esc(mob.name) + '</span>');
    }
  }
  var im = merge(items);
  html += caps("items", items.length);
  for (var ii = 0; ii < im.length; ii++) {
    var take = /t/.test(im[ii].it.attrib || "");
    var fl = flagOf[im[ii].it.id];
    if (fl) {
      var fc = FLAG[fl.tone] || MUTED;
      // The flag as an icon left of the name, the words on hover (Ricardo).
      var ficon = fl.icon ? '<span style="font-family:\'Segoe UI Symbol\',\'DejaVu Sans\',\'Noto Sans Symbols\',\'Noto Sans Symbols 2\',sans-serif;font-size:13px;color:' + fc + ';margin-left:3px;">' + esc(fl.icon) + '\ufe0e</span>' : '';
      html += row(im[ii].n, '<span style="font-family:' + SERIF + ';font-size:13px;color:' + (fl.tone === "bad" ? fc : (take ? TXT : MUTED)) + ';">' + esc(im[ii].it.name) + '</span>', fl.title || fl.label || "", fl.icon ? "" : fl.label, fc, fl.tone === "bad" ? "rgba(255,154,76,0.09)" : "transparent", ficon);
    } else {
      html += row(im[ii].n, '<span style="font-family:' + SERIF + ';font-size:13px;color:' + (take ? TXT : MUTED) + ';">' + esc(im[ii].it.name) + '</span>', take ? "you can take this" : "");
    }
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
