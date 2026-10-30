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
var total = SH.total();
var nItems = SH.list.length;

var html = '<div id="loom-shopping" style="font-family:' + MONO + ';font-size:10px;color:' + TXT + ';background:' + BG + ';border:1px solid ' + RULE + ';padding:7px 8px 8px;min-height:100%;box-sizing:border-box;display:flex;flex-direction:column;">';

// Title.
html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;border-bottom:1px solid ' + DEEP + ';padding-bottom:3px;">';
html += '<span style="font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:2px;font-size:15px;color:' + AMBER + ';">Shopping</span>';
html += '<span style="color:' + MUTED + ';">' + (nItems ? nItems + (nItems === 1 ? ' item' : ' items') + ' &middot; ' + groups.length + (groups.length === 1 ? ' shop' : ' shops') + ' &middot; ' : '') +
  '<span style="color:' + (nItems ? GOLD : MUTED) + ';font-size:12px;" title="at the prices the directory listed; a shopkeeper\'s own policy can change them">~' + esc(SH.sumText(total)) + '</span></span></div>';

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
  html += '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;margin:8px 0 2px;border-top:1px solid ' + RULE + ';padding-top:5px;">';
  html += '<span style="min-width:0;font-family:' + SERIF + ';font-variant:small-caps;letter-spacing:0.1em;font-size:13px;color:' + AMBER + ';"><span style="font-family:' + SYM + ';color:' + DEEP + ';margin-right:4px;">&#9873;</span>' + esc(G.shop) + '</span>';
  html += '<span style="flex:none;white-space:nowrap;color:' + GOLD + ';">' + esc(SH.sumText(G.sum)) +
    '<span onclick="window.loomShopping&&window.loomShopping.walk(' + g + ')" title="walk to ' + esc(G.shop) + ' (' + esc(SH.walkCmd) + ' ' + esc(G.shop) + ')" style="cursor:pointer;margin-left:8px;padding:0 5px;border:1px solid ' + AMBER + ';color:' + AMBER + ';letter-spacing:0.08em;font-size:9px;vertical-align:1px;">WALK</span></span></div>';
  if (G.area) html += '<div style="font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + DIM + ';padding-left:17px;margin-top:-2px;">' + esc(G.area) + '</div>';
  for (var k = 0; k < G.items.length; k++) {
    var it = G.items[k];
    // Hover: every shop the directory listed, cheapest first.
    var others = it.shops.slice().sort(function (a, b) { return a.p - b.p; }).map(function (o) { return (o.s === it.shop ? '• ' : '  ') + o.s + ': ' + SH.money(o.p, o.c) + (o.k >= 0 ? ' (' + SH.n(o.k) + ' in stock)' : ''); });
    var short = it.stock >= 0 && it.stock < it.n;
    var also = (short ? 'only ' + SH.n(it.stock) + ' in stock here\n' : '') + others.join('\n');
    html += '<div class="loom-sh-row" title="' + esc(also) + '" style="display:flex;justify-content:space-between;align-items:baseline;gap:8px;padding:2px 4px 2px 17px;border-bottom:1px dotted ' + RULE + ';">';
    html += '<span style="min-width:0;font-family:' + SERIF + ';font-size:13px;"><span style="font-family:' + MONO + ';font-size:11px;color:' + TXT + ';margin-right:5px;">' + it.n + ' &times;</span>' + esc(it.desc) + (short ? ' <span style="font-family:' + SYM + ';color:#ff9a4c;" title="only ' + SH.n(it.stock) + ' in stock">&#9888;</span>' : '') + '</span>';
    html += '<span style="flex:none;white-space:nowrap;color:' + MUTED + ';">' + (it.n > 1 ? esc(SH.money(it.price, it.cur)) + ' ea &middot; ' : '') + '<span style="color:' + TXT + ';">' + esc(SH.money(it.n * it.price, it.cur)) + '</span>';
    html += '<span onclick="window.loomShopping&&window.loomShopping.buy(' + num + ')" title="' + esc(SH.buyCmd(it)) + ' (you must be in ' + esc(it.shop) + ')" style="cursor:pointer;margin-left:8px;padding:0 4px;border:1px solid ' + DEEP + ';color:' + AMBER + ';letter-spacing:0.08em;font-size:9px;vertical-align:1px;">BUY</span>';
    html += '<span class="loom-sh-x" onclick="window.loomShopping&&window.loomShopping.remove(' + num + ')" title="remove ' + esc(it.desc) + ' from the list" style="cursor:pointer;margin-left:6px;color:#ff9a4c;">&times;</span></span></div>';
    num++;
  }
}
if (!nItems && !C && !SH.q) {
  html += '<div style="margin-top:8px;font-family:' + SERIF + ';font-style:italic;font-size:12px;color:' + MUTED + ';">Nothing on the list. In a city, SHOPPING ADD [n] &lt;item&gt; looks it up in the directory and puts it under its cheapest shop.</div>';
}
html += '<div style="margin-top:auto;padding-top:6px;font-family:' + SERIF + ';font-style:italic;font-size:11px;color:' + MUTED + ';">Prices are the directory\'s: a shopkeeper\'s policy can change them. Hover an item for every shop that sells it; ⚑ in a choice: sold at a shop already on the list; × removes an item.</div>';
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
