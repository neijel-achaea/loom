// shopping_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Shopping: a list of what you mean to buy,
// each item priced and placed by the game's DIRECTORY (the cheapest shop in
// the city you're in), grouped by shop in the Shopping tab with a subtotal
// per shop and a likely total. It only keeps the list: WALK and BUY send the game's WALKTO and BUY once per click.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.shopping) client.loom.shopping = {};
var SH = client.loom.shopping;
// busy (#318): true while our DIRECTORY's answer is still coming, so other
// packages' probes don't take its lines (or we theirs).
client.loom.registry.shopping = { version: "0.1.3", keyword: "SHOPPING", desc: "{{description}}",
  redraw: function () { run_function("shopping_render", [], "shopping"); },
  busy: function () { var q = client.loom.shopping.q; return !!(q && q.sent && Date.now() - q.at < client.loom.shopping.giveUpMs); } };

// Saved: shopping_list = [{ desc, word, n, shops, shop, price, cur, area, at }]
//   desc   the item as DIRECTORY describes it ("a soot-blackened tinderbox");
//          a bulk item ("10gp ea") without the shop's stock count in front
//   word   what you looked it up by ("tinderbox")
//   n      how many you want
//   shops  every shop the directory listed it in, in its order:
//          [{ s: shop, p: price of one, c: gp|cr|mc, k: stock (-1 unknown) }]
//   shop   the one it's listed under, price and cur its price there
//          (cheapest, then fewest stops: see place)
//   area   the area you were in when it was looked up; at: when
// A variable that isn't readable starts afresh (#135).
SH.readList = function (name) {
  var v = get_variable(name);
  if (typeof v == "string") { try { v = JSON.parse(v); } catch (e) { v = null; } }
  return Array.isArray(v) ? v : [];
};
SH.list = [];
var shRaw = SH.readList("shopping_list");
for (var shI = 0; shI < shRaw.length; shI++) {
  var shE = shRaw[shI];
  if (!shE || typeof shE != "object" || !String(shE.desc || "").trim() || !String(shE.shop || "").trim()) continue;
  var shPrice = Math.max(0, Number(shE.price) || 0), shCur = /^(?:gp|cr|mc)$/.test(shE.cur) ? shE.cur : "gp";
  var shOs = [], shSeen = {};
  if (Array.isArray(shE.shops)) for (var shK = 0; shK < shE.shops.length; shK++) {
    var shO = shE.shops[shK];
    if (!shO || typeof shO != "object" || !String(shO.s || "").trim() || shSeen[String(shO.s).trim()]) continue;
    shSeen[String(shO.s).trim()] = 1;
    shOs.push({ s: String(shO.s).trim(), p: Math.max(0, Number(shO.p) || 0), c: /^(?:gp|cr|mc)$/.test(shO.c) ? shO.c : "gp", k: Number(shO.k) >= 0 ? Math.floor(Number(shO.k)) : -1 });
  }
  // 0.1.0 kept only the shops at the lowest price, as names.
  if (!shOs.length && Array.isArray(shE.cheap)) for (var shL = 0; shL < shE.cheap.length; shL++) { var shS = String(shE.cheap[shL] || "").trim(); if (shS && !shSeen[shS]) { shSeen[shS] = 1; shOs.push({ s: shS, p: shPrice, c: shCur, k: -1 }); } }
  if (!shSeen[String(shE.shop).trim()]) shOs.unshift({ s: String(shE.shop).trim(), p: shPrice, c: shCur, k: -1 });
  SH.list.push({ desc: String(shE.desc).trim(), word: String(shE.word || "").trim(), n: Math.max(1, Math.min(9999, Math.floor(Number(shE.n)) || 1)),
    shops: shOs, shop: String(shE.shop).trim(), price: shPrice, cur: shCur, area: String(shE.area || ""), at: Number(shE.at) || 0 });
}
SH.q = null;          // the DIRECTORY being read: { word, n, sent, at, prompts, head, rules, rows, descAt, shopAt }
SH.choices = null;    // different items for one word, waiting for PICK: { word, n, area, opts: [{ desc, rows }] }
SH.giveUpMs = 5000;   // a DIRECTORY that never answers
if (SH.here === undefined) SH.here = null;  // { area } from Room.Info

SH.say = function (msg, col) { display_notice("[shopping] " + msg, col || "cyan"); };
SH.n = function (x) { return String(Math.round(x)).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
SH.money = function (x, cur) { return SH.n(x) + (cur || "gp"); };
SH.key = function (s) { return String(s || "").trim().toLowerCase().replace(/\s+/g, " "); };
SH.byDesc = function (desc) {
  var k = SH.key(desc);
  for (var i = 0; i < SH.list.length; i++) if (SH.key(SH.list[i].desc) === k) return SH.list[i];
  return null;
};

SH.save = function () {
  SH.place();
  if (SH.list.length) set_variable("shopping_list", JSON.stringify(SH.list)); else delete_variable("shopping_list");
  if (client.loom.notify) client.loom.notify("shopping");
  run_function("shopping_render", [], "shopping");
};

// Where each item is bought. Cheapest first (Ricardo: save gold), among
// those the shops with enough stock when one has it; then fewest stops:
// an item sold at its lowest price by more than one shop goes to a shop
// the list visits anyway. Items with one choice fix their shops first; then
// the rest, fewest choices first, each to the choice already holding the
// most items (the directory's order breaks ties). Run on every change, so
// an earlier item moves when a later one makes a shop worth the stop.
SH.cands = function (it) {
  var low = null, cur = it.shops.length ? it.shops[0].c : "gp", out = [], enough = [];
  for (var i = 0; i < it.shops.length; i++) if (it.shops[i].c === cur && (low === null || it.shops[i].p < low)) low = it.shops[i].p;
  for (var j = 0; j < it.shops.length; j++) {
    var o = it.shops[j];
    if (o.c !== cur || o.p !== low) continue;
    out.push(o);
    if (o.k < 0 || o.k >= it.n) enough.push(o);
  }
  return enough.length ? enough : out;
};
SH.place = function () {
  var count = {}, todo = [];
  function add(s) { count[s] = (count[s] || 0) + 1; }
  function set(it, o) { it.shop = o.s; it.price = o.p; it.cur = o.c; it.stock = o.k; add(o.s); }
  for (var i = 0; i < SH.list.length; i++) {
    var it = SH.list[i], c = SH.cands(it);
    if (!c.length) { add(it.shop); continue; }
    if (c.length === 1) set(it, c[0]); else todo.push({ it: it, c: c });
  }
  todo.sort(function (a, b) { return a.c.length - b.c.length; });
  for (var j = 0; j < todo.length; j++) {
    var best = todo[j].c[0];
    for (var k = 1; k < todo[j].c.length; k++) if ((count[todo[j].c[k].s] || 0) > (count[best.s] || 0)) best = todo[j].c[k];
    set(todo[j].it, best);
  }
};
// The shops on the list (for marking choices).
SH.onList = function (shop) {
  for (var i = 0; i < SH.list.length; i++) if (SH.list[i].shop === shop) return true;
  return false;
};

// The list by shop, in the order the tab and SHOPPING show it: shops by
// name, items by description; each shop with its subtotal per currency.
SH.byShop = function () {
  var by = {}, order = [];
  for (var i = 0; i < SH.list.length; i++) {
    var it = SH.list[i];
    if (!by[it.shop]) { by[it.shop] = { shop: it.shop, area: it.area, items: [], sum: {} }; order.push(it.shop); }
    by[it.shop].items.push(it);
    by[it.shop].sum[it.cur] = (by[it.shop].sum[it.cur] || 0) + it.n * it.price;
  }
  order.sort(function (a, b) { a = a.toLowerCase(); b = b.toLowerCase(); return a < b ? -1 : (a > b ? 1 : 0); });
  var out = [];
  for (var j = 0; j < order.length; j++) {
    var g = by[order[j]];
    g.items.sort(function (a, b) { var x = SH.key(a.desc), y = SH.key(b.desc); return x < y ? -1 : (x > y ? 1 : 0); });
    out.push(g);
  }
  return out;
};
// Items in that order, numbered from 1 (REMOVE <number>).
SH.ordered = function () {
  var g = SH.byShop(), out = [];
  for (var i = 0; i < g.length; i++) for (var j = 0; j < g[i].items.length; j++) out.push(g[i].items[j]);
  return out;
};
// Sums per currency, as "4,200gp" or "4,200gp + 30cr".
SH.sumText = function (sum) {
  var parts = [];
  for (var c in { gp: 1, cr: 1, mc: 1 }) if (sum[c]) parts.push(SH.money(sum[c], c));
  return parts.length ? parts.join(" + ") : "0gp";
};
SH.total = function () {
  var t = {};
  for (var i = 0; i < SH.list.length; i++) t[SH.list[i].cur] = (t[SH.list[i].cur] || 0) + SH.list[i].n * SH.list[i].price;
  return t;
};
// An item by its number in SHOPPING's list, or by words in its description
// or the word you looked it up by (one match only).
SH.find = function (q) {
  q = String(q || "").trim();
  var o = SH.ordered();
  if (/^\d+$/.test(q)) return o[Number(q) - 1] || null;
  var k = SH.key(q), hits = [];
  for (var i = 0; i < o.length; i++) if (SH.key(o[i].desc) === k) return o[i];
  for (var j = 0; j < o.length; j++) if (SH.key(o[j].desc).indexOf(k) >= 0 || SH.key(o[j].word) === k) hits.push(o[j]);
  return hits.length === 1 ? hits[0] : (hits.length ? hits : null);
};

// ADD: look the word up with DIRECTORY, hidden. One lookup at a time.
SH.paused = function () { return get_variable("pauseTriggers") == "on"; };
SH.add = function (n, word) {
  if (SH.paused()) { SH.say("Loom is paused (LOOM PAUSE OFF to look things up).", "orange"); return; }
  if (SH.q) { SH.say("still reading the directory for " + SH.q.word + ": a moment.", "orange"); return; }
  SH.q = { word: word, n: n, sent: false, at: Date.now(), prompts: 0, head: false, rules: 0, rows: [], descAt: -1, shopAt: -1 };
  SH.send();
  run_function("shopping_render", [], "shopping");
};
// Another package waiting on an answer of its own: wait for the next prompt.
SH.othersBusy = function () {
  var r = client.loom.registry || {};
  for (var k in r) {
    if (!r.hasOwnProperty(k) || k == "shopping" || !r[k] || typeof r[k].busy != "function") continue;
    try { if (r[k].busy()) return k; } catch (e) {}
  }
  return "";
};
SH.send = function () {
  var q = SH.q;
  if (!q || q.sent) return;
  if (SH.othersBusy() && Date.now() - q.at < SH.giveUpMs) return;
  q.sent = true; q.at = Date.now(); q.prompts = 0;
  send_command("directory " + q.word, 1);
};
// From onGMCP at each prompt (after its packet's lines). A lookup not sent
// yet goes now; one with no table after two prompts found nothing (the
// game's own answer is left on screen); a table without its closing rule
// is taken as read.
SH.prompt = function () {
  var q = SH.q;
  if (!q) return;
  if (!q.sent) { SH.send(); return; }
  q.prompts++;
  if (q.head && q.prompts >= 1) SH.done();
  else if (!q.head && (q.prompts >= 2 || Date.now() - q.at > SH.giveUpMs)) {
    SH.q = null;
    SH.say("the directory lists nothing for " + q.word + " here (DIRECTORY only covers the city or area you're in).", "orange");
    run_function("shopping_render", [], "shopping");
  }
};

// The table's lines, while our lookup is out. Columns are padded, so the
// header tells where the description and the shop begin; when a row doesn't
// fit them, its runs two or more spaces apart are read instead. A bulk
// item's price is for one ("10gp ea") and its description starts with the
// shop's stock ("74 echinacea roots"): the count is taken off and kept.
SH.line = function (line) {
  var q = SH.q;
  if (!q || !q.sent) return false;
  if (/^Price\s+Item description\s+Shop\s*$/.test(line)) {
    q.head = true; q.descAt = line.indexOf("Item description"); q.shopAt = line.indexOf("Shop", q.descAt + 16);
    return true;
  }
  if (!q.head) return false;
  if (/^-{20,}$/.test(line)) { q.rules++; if (q.rules >= 2) setTimeout(SH.done, 0); return true; }
  var m = /^\s*([\d,]+)\s*(gp|cr|mc)(\s+ea\b)?/.exec(line);
  if (!m) return false;
  var desc = "", shop = "", stock = -1;
  if (q.shopAt > m[0].length && line.length > q.shopAt && /\s/.test(line.charAt(q.shopAt - 1)) && /\S/.test(line.charAt(q.shopAt))) {
    desc = line.substring(m[0].length, q.shopAt).trim(); shop = line.substring(q.shopAt).trim();
  }
  if (!desc || !shop) {
    var parts = line.substring(m[0].length).trim().split(/\s{2,}/);
    if (parts.length === 2) { desc = parts[0]; shop = parts[1]; }
  }
  if (!desc || !shop) return false;
  var b = m[3] ? /^([\d,]+)\s+(.+)$/.exec(desc) : null;
  if (b) { stock = Number(b[1].replace(/,/g, "")); desc = b[2]; }
  q.rows.push({ price: Number(m[1].replace(/,/g, "")), cur: m[2], desc: desc, shop: shop, stock: stock });
  return true;
};

// The table is read: one item → onto the list; several → ask which.
SH.done = function () {
  var q = SH.q;
  if (!q) return;
  SH.q = null;
  if (!q.rows.length) { SH.say("the directory lists nothing for " + q.word + " here.", "orange"); run_function("shopping_render", [], "shopping"); return; }
  var opts = [], idx = {};
  for (var i = 0; i < q.rows.length; i++) {
    var k = SH.key(q.rows[i].desc);
    if (idx[k] === undefined) { idx[k] = opts.length; opts.push({ desc: q.rows[i].desc, rows: [] }); }
    opts[idx[k]].rows.push(q.rows[i]);
  }
  var area = SH.here ? SH.here.area : "";
  if (opts.length === 1) { SH.choices = null; SH.put(q.word, q.n, opts[0], area); return; }
  // Cheapest first; at one price, those sold at a shop already on the list.
  opts.sort(function (a, b) { return (SH.cheapest(a).price - SH.cheapest(b).price) || ((SH.optOnList(a) ? 0 : 1) - (SH.optOnList(b) ? 0 : 1)); });
  SH.choices = { word: q.word, n: q.n, area: area, opts: opts };
  SH.say("the directory has " + opts.length + " different items for " + q.word + ": SHOPPING PICK <number> (or click one in the tab).");
  for (var j = 0; j < opts.length; j++) {
    var c = SH.cheapest(opts[j]), on = SH.optOnList(opts[j]);
    SH.say("  " + (j + 1) + ". " + opts[j].desc + ": from " + SH.money(c.price, c.cur) + " (" + opts[j].rows.length + (opts[j].rows.length === 1 ? " shop" : " shops") + (on ? "; at " + on + ", already on your list" : "") + ")");
  }
  run_function("shopping_render", [], "shopping");
};
SH.cheapest = function (opt) {
  var best = opt.rows[0];
  for (var i = 1; i < opt.rows.length; i++) if (opt.rows[i].price < best.price) best = opt.rows[i];
  return best;
};
// A shop on the list selling this choice at its lowest price, if any.
SH.optOnList = function (opt) {
  var low = SH.cheapest(opt);
  for (var i = 0; i < opt.rows.length; i++) if (opt.rows[i].price === low.price && SH.onList(opt.rows[i].shop)) return opt.rows[i].shop;
  return "";
};
SH.pick = function (i) {
  var C = SH.choices;
  if (!C) { SH.say("nothing to pick from: SHOPPING ADD [n] <word> first.", "orange"); return; }
  var o = C.opts[i - 1];
  if (!o) { SH.say("pick 1 to " + C.opts.length + ".", "orange"); return; }
  SH.choices = null;
  SH.put(C.word, C.n, o, C.area);
};
SH.cancelPick = function () { SH.choices = null; run_function("shopping_render", [], "shopping"); };
// Onto the list with every shop the directory named (place picks one). On
// the list already: the quantity adds up, the shops are the fresh ones.
SH.put = function (word, n, opt, area) {
  var shops = [], seen = {};
  for (var i = 0; i < opt.rows.length; i++) {
    var r = opt.rows[i];
    if (seen[r.shop]) continue;
    seen[r.shop] = 1;
    shops.push({ s: r.shop, p: r.price, c: r.cur, k: r.stock });
  }
  var it = SH.byDesc(opt.desc), was = it ? it.n : 0;
  if (!it) { it = { desc: opt.desc, word: word, n: 0, shops: [], shop: shops[0].s, price: 0, cur: "gp", area: "", at: 0 }; SH.list.push(it); }
  it.n = Math.min(9999, it.n + n); it.shops = shops; it.word = word; it.area = area || it.area; it.at = Date.now();
  SH.save();
  var ties = SH.cands(it).length - 1;
  SH.say((was ? "now " + it.n + " × " : it.n + " × ") + it.desc + " at " + SH.money(it.price, it.cur) + (it.n > 1 ? " (" + SH.money(it.n * it.price, it.cur) + ")" : "") +
    ", from " + it.shop + (ties > 0 ? " (also " + ties + " other " + (ties > 1 ? "shops" : "shop") + " at that price)" : "") +
    (it.stock >= 0 && it.stock < it.n ? "; it has only " + it.stock + " in stock" : "") +
    ". Total " + SH.sumText(SH.total()) + ".", it.stock >= 0 && it.stock < it.n ? "orange" : "lime");
};
SH.remove = function (it, n) {
  if (n && n < it.n) { it.n -= n; SH.save(); SH.say("now " + it.n + " × " + it.desc + ". Total " + SH.sumText(SH.total()) + ".", "lime"); return; }
  var k = SH.list.indexOf(it);
  if (k >= 0) SH.list.splice(k, 1);
  SH.save();
  SH.say("removed " + it.desc + ". " + (SH.list.length ? "Total " + SH.sumText(SH.total()) + "." : "The list is empty."), "lime");
};
SH.clear = function () {
  SH.list = []; SH.choices = null;
  SH.save();
  SH.say("the shopping list is wiped.", "orange");
};

SH.place();

// WALK on a shop's line: the game's own walking, sent once per click; the
// game stops it at a closed door or anything else in the way.
SH.walkCmd = "walkto";
SH.walk = function (shop) {
  if (SH.paused()) { SH.say("Loom is paused (LOOM PAUSE OFF to walk).", "orange"); return; }
  send_command(SH.walkCmd + " " + shop, 1);
  SH.say("walking to " + shop + ".");
};

// BUY on an item's line: "buy <n> <word you looked it up by>", once per
// click, in whichever shop you're standing in. The list isn't changed.
SH.buyCmd = function (it) { return "buy " + it.n + " " + it.word; };
SH.buy = function (it) {
  if (SH.paused()) { SH.say("Loom is paused (LOOM PAUSE OFF to buy).", "orange"); return; }
  if (!it.word) { SH.say("no word to buy " + it.desc + " by: add it again.", "orange"); return; }
  send_command(SH.buyCmd(it), 1);
};

// The tab's clicks. Its page shares window with the scripts but can't reach
// client.loom in every Nexus, so these closures carry them.
try {
  window.loomShopping = {
    remove: function (i) { var S = client.loom.shopping, it = S.ordered()[i]; if (it) S.remove(it); },
    pick: function (i) { client.loom.shopping.pick(i + 1); },
    buy: function (i) { var S = client.loom.shopping, it = S.ordered()[i]; if (it) S.buy(it); },
    walk: function (i) { var S = client.loom.shopping, g = S.shopsDrawn || []; if (g[i] !== undefined) S.walk(g[i]); },
    cancel: function () { client.loom.shopping.cancelPick(); }
  };
} catch (e) {}
if (client.loom.notify) client.loom.notify("shopping");
