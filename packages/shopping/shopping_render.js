// shopping_render -- the Shopping tab, in the house style shared with Here
// and Waypoints: ink panel, serif small-caps headings, monospace rows.
//   - title: items, shops and the likely total
//   - a "which one?" box while DIRECTORY found different items for a word
//   - the list by shop: shop name and subtotal, then each item with its
//     quantity, unit price and line total; × on hover removes the item
if (!client.loom || !client.loom.shopping || !client.loom.shopping.list) run_function("shopping_setup", [], "shopping");
var SH = client.loom.shopping;
var TH = (client.loom && client.loom.theme) || {};
var AMBER = TH.acc || "#e0b46c";
var DEEP = TH.deep || "#7a5f33";
var TXT = TH.txt || "#e8e2d6";
var MUTED = TH.muted || "#8f877a";
var DIM = TH.dim || "#6d665b";
var RULE = TH.rule || "#2b2620";
var BG = TH.bg || "#13110e";
var GOLD = "#e8c65a";
var SERIF = "Georgia,'Palatino Linotype','Book Antiqua',serif";
var MONO = "Consolas,'DejaVu Sans Mono',monospace";
var SYM = "'Segoe UI Symbol','DejaVu Sans',sans-serif";
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

var groups = SH.byShop();
SH.shopsDrawn = groups.map(function (x) { return x.shop; });
var inShop = SH.shopHere();
var total = SH.total();
var nItems = SH.list.length;
// GOAL: with coffers (link coffers-shopping), the gold not yet a goal.
var goalChip = '';
if ((total.gp || 0) > 0 && SH.goalLink()) {
  var goalNew = total.gp - SH.goalAdded;
  goalChip = goalNew > 0
    ? '<span onclick="window.loomShopping&&window.loomShopping.goal()" title="make ' + esc(SH.money(goalNew)) + ' a goal in coffers' + (SH.goalAdded ? ' (' + esc(SH.money(SH.goalAdded)) + ' added already)' : '') + '" style="cursor:pointer;margin-left:8px;padding:0 5px;border:1px solid ' + GOLD + ';color:' + GOLD + ';letter-spacing:0.08em;font-size:9px;vertical-align:1px;">GOAL</span>'
    : '<span title="the list\'s gold is in your coffers goal" style="margin-left:8px;padding:0 5px;border:1px solid ' + DEEP + ';color:' + DIM + ';letter-spacing:0.08em;font-size:9px;vertical-align:1px;">&#10003; GOAL</span>';
}

var html = '<div id="loom-shopping" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;display:flex;flex-direction:column;">';

// Title.
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
html += '<span style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:2px;font-size:15px;color:' + AMBER + ';">Shopping</span>';
html += '<span style="color:' + MUTED + ';">' + (nItems ? nItems + (nItems === 1 ? ' item' : ' items') + ' &middot; ' + groups.length + (groups.length === 1 ? ' shop' : ' shops') + ' &middot; ' : '') +
  '<span style="color:' + (nItems ? GOLD : MUTED) + ';font-size:12px;" title="at the prices the directory listed; a shopkeeper\'s own policy can change them">~' + esc(SH.sumText(total)) + '</span>' + goalChip + '</span></div>';

// Under its minimum (#440): a RESTOCK chip, from the last rift reading.
var shortN = SH.riftAt ? SH.shortList().length : 0, hasMins = false;
for (var mk in SH.mins) if (SH.mins.hasOwnProperty(mk)) { hasMins = true; break; }
if (shortN || hasMins || SH.queue.length) {
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin-top:5px;font-family:' + SERIF + ';font-size:12px;color:' + MUTED + ';">';
  html += '<span>' + (SH.r ? '<i>Reading your rift…</i>' : SH.queue.length ? '<i>Restocking: ' + SH.queue.length + ' more to look up…</i>' : shortN ? '<span style="color:#ff9a4c;">' + shortN + (shortN === 1 ? ' item' : ' items') + ' under minimum</span>' : 'Everything at its minimum') + '</span>';
  html += '<span onclick="window.loomShopping&&window.loomShopping.restock()" title="read your rift and put everything under its minimum on the list (SHOPPING RESTOCK)" style="cursor:pointer;padding:0 5px;border:1px solid ' + AMBER + ';color:' + AMBER + ';letter-spacing:0.08em;font-family:' + MONO + ';font-size:9px;">RESTOCK</span></div>';
}

// Looking something up.
if (SH.q) {
  html += '<div style="margin-top:6px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">Reading the directory for ' + esc(SH.q.word) + '…</div>';
}

// Different items for one word: pick one.
var C = SH.choices;
if (C) {
  html += '<div style="margin-top:6px;padding:4px 6px;border:1px dotted ' + AMBER + ';">';
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;"><span style="font-family:' + SERIF + ';font-size:13px;color:' + TXT + ';">Which ' + esc(C.word) + '? <span style="color:' + MUTED + ';font-size:11px;font-style:italic;">' + C.n + ' wanted</span></span>';
  html += '<span onclick="window.loomShopping&&window.loomShopping.cancel()" title="never mind" style="cursor:pointer;padding:0 5px;border:1px solid ' + DEEP + ';color:' + DIM + ';letter-spacing:0.08em;">CANCEL</span></div>';
  for (var c = 0; c < C.opts.length; c++) {
    var o = C.opts[c], low = SH.cheapest(o);
    html += '<div class="loom-sh-pick" onclick="window.loomShopping&&window.loomShopping.pick(' + c + ')" title="put ' + esc(o.desc) + ' on the list (SHOPPING PICK ' + (c + 1) + ')" style="cursor:pointer;display:flex;justify-content:space-between;gap:8px;padding:2px 2px;border-bottom:1px dotted ' + RULE + ';">';
    var onl = SH.optOnList(o);
    html += '<span style="min-width:0;font-family:' + SERIF + ';font-size:13px;"><span style="color:' + MUTED + ';font-family:' + MONO + ';font-size:10px;margin-right:5px;">' + (c + 1) + '.</span>' + esc(o.desc) + (onl ? ' <span style="font-family:' + SYM + ';color:' + AMBER + ';" title="sold at ' + esc(onl) + ', already on your list">&#9873;</span>' : '') + '</span>';
    html += '<span style="flex:none;white-space:nowrap;color:' + MUTED + ';">' + o.rows.length + (o.rows.length === 1 ? ' shop' : ' shops') + ' &middot; from <span style="color:' + GOLD + ';">' + esc(SH.money(low.price, low.cur)) + '</span></span></div>';
  }
  html += '</div>';
}

// The list, by shop.
var num = 0;
for (var g = 0; g < groups.length; g++) {
  var G = groups[g];
  html += '<div class="loom-sh-row" style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:8px 0 2px;border-top:1px solid ' + RULE + ';padding-top:5px;">';
  html += '<span style="min-width:0;font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;font-size:13px;color:' + AMBER + ';"><span style="font-family:' + SYM + ';color:' + DEEP + ';margin-right:4px;">&#9873;</span>' + esc(G.shop) + (G.shop === inShop ? ' <span style="font-family:' + MONO + ';font-variant:normal;letter-spacing:0.08em;font-size:9px;color:' + AMBER + ';">&#9673; HERE</span>' : '') + '</span>';
  html += '<span style="flex:none;white-space:nowrap;color:' + GOLD + ';">' + esc(SH.sumText(G.sum)) + (G.shop === inShop ? '' :
    '<span onclick="window.loomShopping&&window.loomShopping.walk(' + g + ')" title="walk to ' + esc(G.shop) + ' (' + esc(SH.walkCmd) + ' ' + esc(G.shop) + ')" style="cursor:pointer;margin-left:8px;padding:0 5px;border:1px solid ' + AMBER + ';color:' + AMBER + ';letter-spacing:0.08em;font-size:9px;vertical-align:1px;">WALK</span>') +
    '<span class="loom-sh-x" onclick="window.loomShopping&&window.loomShopping.skip(' + g + ')" title="skip ' + esc(G.shop) + ': its items move to their next cheapest shops (SHOPPING UNSKIP to undo)" style="cursor:pointer;margin-left:6px;color:#ff9a4c;">&times;</span></span></div>';
  if (G.area) html += '<div style="font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + DIM + ';padding-left:17px;margin-top:-2px;">' + esc(G.area) + '</div>';
  if (SH.skip[G.shop]) html += '<div style="font-family:' + SERIF + ';font-style:italic;font-size:11px;color:#ff9a4c;padding-left:17px;">skipped, but these are sold nowhere else</div>';
  for (var k = 0; k < G.items.length; k++) {
    var it = G.items[k];
    // Hover: every shop the directory listed, cheapest first.
    var others = it.shops.slice().sort(function (a, b) { return a.p - b.p; }).map(function (o) { return (o.s === it.shop ? '• ' : '  ') + o.s + ': ' + SH.money(o.p, o.c) + (o.k >= 0 ? ' (' + SH.n(o.k) + ' in stock)' : ''); });
    var short = it.stock >= 0 && it.stock < it.n;
    var also = (short ? 'only ' + SH.n(it.stock) + ' in stock here\n' : '') + others.join('\n');
    html += '<div class="loom-sh-row" title="' + esc(also) + '" style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:2px 4px 2px 17px;border-bottom:1px dotted ' + RULE + ';">';
    html += '<span style="min-width:0;font-family:' + SERIF + ';font-size:13px;"><span style="font-family:' + MONO + ';font-size:11px;color:' + TXT + ';margin-right:5px;">' + it.n + ' &times;</span>' + esc(it.desc) + (short ? ' <span style="font-family:' + SYM + ';color:#ff9a4c;" title="only ' + SH.n(it.stock) + ' in stock">&#9888;</span>' : '') + '</span>';
    html += '<span style="flex:none;white-space:nowrap;color:' + MUTED + ';">' + (it.n > 1 ? esc(SH.money(it.price, it.cur)) + ' ea &middot; ' : '') + '<span style="color:' + TXT + ';">' + esc(SH.money(it.n * it.price, it.cur)) + '</span>';
    if (G.shop === inShop) html += '<span onclick="window.loomShopping&&window.loomShopping.buy(' + num + ')" title="' + esc(SH.buyCmd(it)) + '" style="cursor:pointer;margin-left:8px;padding:0 4px;border:1px solid ' + DEEP + ';color:' + AMBER + ';letter-spacing:0.08em;font-size:9px;vertical-align:1px;">BUY</span>';
    html += '<span class="loom-sh-x" onclick="window.loomShopping&&window.loomShopping.remove(' + num + ')" title="remove ' + esc(it.desc) + ' from the list" style="cursor:pointer;margin-left:6px;color:#ff9a4c;">&times;</span></span></div>';
    num++;
  }
}
if (!nItems && !C && !SH.q) {
  html += '<div style="margin-top:8px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">Nothing on the list. In a city, SHOPPING ADD [n] &lt;item&gt; looks it up in the directory and puts it under its cheapest shop.</div>';
}
// Commodity prices (#473): every commodity shop read with WARES, side by
// side. BUY: their prices to you, cheapest green, dearest orange; SELL: what
// they pay you, highest green. Hover a cell for stock and when it was read;
// ↻ walks to a shop and reads its WARES again.
var wShops = SH.waresShops();
if (wShops.length) {
  var GREEN = "#8fd18f", ORANGE = "#ff9a4c";
  var ago = function (t) { var m = Math.round((Date.now() - t) / 60000); return m < 60 ? m + "m" : (m < 2880 ? Math.round(m / 60) + "h" : Math.round(m / 1440) + "d"); };
  html += '<div style="margin-top:10px;border-top:1px solid ' + DEEP + ';padding-top:5px;display:flex;justify-content:space-between;align-items:baseline;gap:8px;">';
  html += '<span onclick="window.loomShopping&&window.loomShopping.pricesFold()" title="' + (SH.pricesFolded ? 'show' : 'fold') + ' the commodity prices" style="cursor:pointer;font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;font-size:13px;color:' + AMBER + ';">' + (SH.pricesFolded ? '&#9656;' : '&#9662;') + ' Commodity prices <span style="font-family:' + MONO + ';font-size:10px;color:' + MUTED + ';font-variant:normal;letter-spacing:0;">' + wShops.length + (wShops.length === 1 ? ' shop' : ' shops') + '</span></span>';
  if (!SH.pricesFolded) {
    var modeChip = function (on, label, tip) { return '<span onclick="' + (on ? '' : 'window.loomShopping&&window.loomShopping.pricesMode()') + '" title="' + tip + '" style="cursor:' + (on ? 'default' : 'pointer') + ';padding:0 5px;border:1px solid ' + (on ? AMBER : DEEP) + ';color:' + (on ? AMBER : DIM) + ';letter-spacing:0.08em;font-size:9px;">' + label + '</span>'; };
    html += '<span style="white-space:nowrap;">' + modeChip(!SH.pricesSell, 'BUY', 'their prices to you (We Sell At)') + ' ' + modeChip(SH.pricesSell, 'SELL', 'what they pay you (We Buy At)') + '</span>';
  }
  html += '</div>';
  if (!SH.pricesFolded) {
    var comm = {}, order = [];
    for (var ws = 0; ws < wShops.length; ws++) { var Wi = SH.wares[wShops[ws]].items; for (var ck in Wi) if (Wi.hasOwnProperty(ck) && !comm[ck]) { comm[ck] = Wi[ck][2] || ck; order.push(ck); } }
    order.sort();
    var watched = {};
    for (var mi in SH.mins) if (SH.mins.hasOwnProperty(mi)) watched[SH.commodityOf(mi)] = mi;
    html += '<div style="overflow-x:auto;margin-top:4px;"><table style="border-collapse:collapse;width:100%;font-family:' + MONO + ';font-size:10px;">';
    html += '<tr><th style="text-align:left;font-weight:normal;color:' + MUTED + ';padding:2px 4px;border-bottom:1px solid ' + RULE + ';">' + (SH.pricesSell ? 'they pay' : 'they sell') + '</th>';
    for (var hs = 0; hs < wShops.length; hs++) {
      var WS = SH.wares[wShops[hs]], here = SH.here && WS.room && SH.here.id === WS.room;
      html += '<th style="text-align:right;font-weight:normal;padding:2px 4px;border-bottom:1px solid ' + RULE + ';white-space:nowrap;"><span style="font-family:' + SERIF + ';font-size:12px;color:' + TXT + ';">' + esc(WS.area || wShops[hs]) + '</span>' +
        ' <span title="read ' + esc(ago(WS.at)) + ' ago" style="color:' + DIM + ';">' + esc(ago(WS.at)) + '</span>' +
        ' <span onclick="window.loomShopping&&window.loomShopping.refresh(' + hs + ')" title="' + (here ? 'read its WARES again' : 'walk to ' + esc(wShops[hs]) + ' and read its WARES on arrival') + '" style="cursor:pointer;color:' + AMBER + ';font-family:' + SYM + ';">&#8635;</span></th>';
    }
    html += '</tr>';
    for (var oi = 0; oi < order.length; oi++) {
      var k = order[oi], vals = [];
      for (var vs = 0; vs < wShops.length; vs++) { var e = SH.wares[wShops[vs]].items[k]; var v = e ? (SH.pricesSell ? e[3] : e[0]) : 0; vals.push({ v: v, k: e ? e[1] : -1 }); }
      var live = vals.filter(function (x) { return x.v > 0 && (SH.pricesSell || x.k !== 0); }).map(function (x) { return x.v; });
      var best = live.length ? (SH.pricesSell ? Math.max.apply(null, live) : Math.min.apply(null, live)) : 0;
      var worst = live.length > 1 ? (SH.pricesSell ? Math.min.apply(null, live) : Math.max.apply(null, live)) : -1;
      // A row nobody sells (BUY) or buys (SELL) is left out; equal prices everywhere aren't coloured.
      if (!vals.some(function (x) { return x.v > 0; })) continue;
      if (best === worst) { best = -1; worst = -1; }
      var mine = watched[k];
      html += '<tr class="loom-sh-row"><td style="padding:2px 4px;border-bottom:1px dotted ' + RULE + ';font-family:' + SERIF + ';font-size:12px;color:' + (mine ? TXT : MUTED) + ';"' + (mine ? ' title="you keep a minimum of ' + esc(mine) + '"' : '') + '>' + esc(comm[k]) + (mine ? ' <span style="color:' + AMBER + ';">&bull;</span>' : '') + '</td>';
      for (var c2 = 0; c2 < vals.length; c2++) {
        var x = vals[c2], out = !SH.pricesSell && x.v > 0 && x.k === 0;
        var col = !x.v || out ? DIM : (live.length > 1 && x.v === best ? GREEN : (x.v === worst ? ORANGE : TXT));
        var tip = x.v ? (SH.pricesSell ? 'pays ' : 'sells at ') + SH.money(x.v) + (x.k >= 0 ? ' · stock ' + SH.n(x.k) : '') : (SH.pricesSell ? 'doesn\'t buy it' : 'doesn\'t sell it');
        html += '<td title="' + esc(tip) + '" style="text-align:right;padding:2px 4px;border-bottom:1px dotted ' + RULE + ';color:' + col + ';white-space:nowrap;' + (out ? 'text-decoration:line-through;' : '') + '">' + (x.v ? SH.n(x.v) : '&mdash;') + '</td>';
      }
      html += '</tr>';
    }
    html += '</table></div>';
    html += '<div style="margin-top:3px;font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';">Prices in gold, from each shop\'s last WARES. ' + (SH.pricesSell ? 'Green: pays the most; orange: the least.' : 'Green: cheapest; orange: dearest; struck out: none in stock.') + ' Commodities no shop ' + (SH.pricesSell ? 'buys' : 'sells') + ' aren\'t listed.' + ' &bull; a commodity you keep a minimum of. ↻ walks there and reads WARES again.</div>';
  }
}

var skipped = SH.skipList();
if (skipped.length) {
  html += '<div style="margin-top:8px;font-family:' + SERIF + ';font-size:11px;color:' + MUTED + ';">Skipped: ';
  for (var sk = 0; sk < skipped.length; sk++) html += (sk ? ', ' : '') + '<span onclick="window.loomShopping&&window.loomShopping.unskip(' + sk + ')" title="click to use ' + esc(skipped[sk]) + ' again" style="cursor:pointer;text-decoration:line-through;color:' + DIM + ';">' + esc(skipped[sk]) + '</span>';
  html += ' <span style="font-style:italic;">(click one to use it again)</span></div>';
}
html += '<div style="margin-top:auto;padding-top:6px;font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';">Prices are the directory\'s: a shopkeeper\'s policy can change them. Hover an item for every shop that sells it; ⚑ in a choice: sold at a shop already on the list; × removes an item, or on a shop\'s line skips that shop.</div>';
html += '</div>';

// The whole tab in the panel's colour (#355); the × shows on a row's hover.
try {
  var shSt = document.getElementById("loom-shopping-style");
  if (!shSt) { shSt = document.createElement("style"); shSt.id = "loom-shopping-style"; document.head.appendChild(shSt); }
  var shCss = '.flexlayout__tab:has(#loom-shopping) { background: ' + BG + ' !important; } .flexlayout__tab:has(#loom-shopping) > * { min-height: 100%; } ' +
    '#loom-shopping .loom-sh-x { visibility: hidden; } #loom-shopping .loom-sh-row:hover .loom-sh-x { visibility: visible; } #loom-shopping .loom-sh-row:hover, #loom-shopping .loom-sh-pick:hover { background: rgba(224,180,108,0.06); }';
  if (shSt.textContent !== shCss) shSt.textContent = shCss;
} catch (e) {}
try { set_custom_tab_html("Shopping", html); } catch (e) {}
