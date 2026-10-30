// shopping_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Shopping: a list of what you mean to buy,
// each item priced and placed by the game's DIRECTORY (the cheapest shop in
// the city you're in), grouped by shop in the Shopping tab with a subtotal
// per shop and a likely total. It only keeps the list: nothing walks or buys.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.shopping) client.loom.shopping = {};
var SH = client.loom.shopping;
// busy (#318): true while our DIRECTORY's answer is still coming, so other
// packages' probes don't take its lines (or we theirs).
client.loom.registry.shopping = { version: "0.1.0", keyword: "SHOPPING", desc: "{{description}}",
  redraw: function () { run_function("shopping_render", [], "shopping"); },
  busy: function () { var q = client.loom.shopping.q; return !!(q && q.sent && Date.now() - q.at < client.loom.shopping.giveUpMs); } };

// Saved: shopping_list = [{ desc, word, n, price, cur, shop, cheap, area, at }]
//   desc   the item as DIRECTORY describes it ("a soot-blackened tinderbox")
//   word   what you looked it up by ("tinderbox")
//   n      how many you want
//   price  its price at the cheapest shop, per item, in cur (gp, cr or mc)
//   cheap  every shop selling it at that price, in DIRECTORY's order;
//   shop   the one of them it's listed under (fewest stops: see place)
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
  var shC = [];
  if (Array.isArray(shE.cheap)) for (var shK = 0; shK < shE.cheap.length; shK++) { var shS = String(shE.cheap[shK] || "").trim(); if (shS && shC.indexOf(shS) < 0) shC.push(shS); }
  if (shC.indexOf(String(shE.shop).trim()) < 0) shC.unshift(String(shE.shop).trim());
  SH.list.push({ desc: String(shE.desc).trim(), word: String(shE.word || "").trim(), n: Math.max(1, Math.min(9999, Math.floor(Number(shE.n)) || 1)),
    price: Math.max(0, Number(shE.price) || 0), cur: /^(?:gp|cr|mc)$/.test(shE.cur) ? shE.cur : "gp", shop: String(shE.shop).trim(), cheap: shC,
    area: String(shE.area || ""), at: Number(shE.at) || 0 });
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

// Fewest stops (Ricardo): an item sold at its lowest price by more than one
// shop goes to a shop the list visits anyway. Items with one cheapest shop
// fix their shops first; then the rest, fewest choices first, each to the
// choice already holding the most items (DIRECTORY's order breaks ties).
SH.place = function () {
  var count = {}, items = SH.list.slice();
  function add(s) { count[s] = (count[s] || 0) + 1; }
  for (var i = 0; i < items.length; i++) if (items[i].cheap.length <= 1) { items[i].shop = items[i].cheap[0] || items[i].shop; add(items[i].shop); }
  var rest = items.filter(function (it) { return it.cheap.length > 1; });
  rest.sort(function (a, b) { return a.cheap.length - b.cheap.length; });
  for (var j = 0; j < rest.length; j++) {
    var it = rest[j], best = it.cheap[0];
    for (var k = 1; k < it.cheap.length; k++) if ((count[it.cheap[k]] || 0) > (count[best] || 0)) best = it.cheap[k];
    it.shop = best;
    add(best);
  }
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
// header tells where the description and the shop begin; a row whose text
// splits into exactly three runs (two or more spaces apart) is read that way.
SH.line = function (line) {
  var q = SH.q;
  if (!q || !q.sent) return false;
  if (/^Price\s+Item description\s+Shop\s*$/.test(line)) {
    q.head = true; q.descAt = line.indexOf("Item description"); q.shopAt = line.indexOf("Shop", q.descAt + 16);
    return true;
  }
  if (!q.head) return false;
  if (/^-{20,}$/.test(line)) { q.rules++; if (q.rules >= 2) setTimeout(SH.done, 0); return true; }
  var m = /^\s*([\d,]+)\s*(gp|cr|mc)\b/.exec(line);
  if (!m) return false;
  var desc = "", shop = "", parts = line.trim().split(/\s{2,}/);
  if (parts.length === 3) { desc = parts[1]; shop = parts[2]; }
  else if (q.shopAt > 0 && line.length > q.shopAt) { desc = line.substring(m[0].length, q.shopAt).trim(); shop = line.substring(q.shopAt).trim(); }
  if (!desc || !shop) return false;
  q.rows.push({ price: Number(m[1].replace(/,/g, "")), cur: m[2], desc: desc, shop: shop });
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
  opts.sort(function (a, b) { return SH.cheapest(a).price - SH.cheapest(b).price; });
  SH.choices = { word: q.word, n: q.n, area: area, opts: opts };
  SH.say("the directory has " + opts.length + " different items for " + q.word + ": SHOPPING PICK <number> (or click one in the tab).");
  for (var j = 0; j < opts.length; j++) {
    var c = SH.cheapest(opts[j]);
    SH.say("  " + (j + 1) + ". " + opts[j].desc + ": from " + SH.money(c.price, c.cur) + " (" + opts[j].rows.length + (opts[j].rows.length === 1 ? " shop" : " shops") + ")");
  }
  run_function("shopping_render", [], "shopping");
};
SH.cheapest = function (opt) {
  var best = opt.rows[0];
  for (var i = 1; i < opt.rows.length; i++) if (opt.rows[i].price < best.price) best = opt.rows[i];
  return best;
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
// Onto the list at its lowest price; the shops at that price (in the
// directory's order) are kept for place. On the list already: the quantity
// adds up, the price and shops are the fresh ones.
SH.put = function (word, n, opt, area) {
  var low = SH.cheapest(opt), cheap = [];
  for (var i = 0; i < opt.rows.length; i++) {
    var r = opt.rows[i];
    if (r.price === low.price && r.cur === low.cur && cheap.indexOf(r.shop) < 0) cheap.push(r.shop);
  }
  var it = SH.byDesc(opt.desc), was = it ? it.n : 0;
  if (!it) { it = { desc: opt.desc, word: word, n: 0, price: 0, cur: "gp", shop: cheap[0], cheap: [], area: "", at: 0 }; SH.list.push(it); }
  it.n = Math.min(9999, it.n + n); it.price = low.price; it.cur = low.cur; it.cheap = cheap; it.word = word; it.area = area || it.area; it.at = Date.now();
  SH.save();
  SH.say((was ? "now " + it.n + " × " : it.n + " × ") + it.desc + " at " + SH.money(it.price, it.cur) + (it.n > 1 ? " (" + SH.money(it.n * it.price, it.cur) + ")" : "") +
    ", from " + it.shop + (cheap.length > 1 ? " (also " + (cheap.length - 1) + " other " + (cheap.length > 2 ? "shops" : "shop") + " at that price)" : "") +
    ". Total " + SH.sumText(SH.total()) + ".", "lime");
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

// The tab's clicks. Its page shares window with the scripts but can't reach
// client.loom in every Nexus, so these closures carry them.
try {
  window.loomShopping = {
    remove: function (i) { var S = client.loom.shopping, it = S.ordered()[i]; if (it) S.remove(it); },
    pick: function (i) { client.loom.shopping.pick(i + 1); },
    cancel: function () { client.loom.shopping.cancelPick(); }
  };
} catch (e) {}
if (client.loom.notify) client.loom.notify("shopping");
