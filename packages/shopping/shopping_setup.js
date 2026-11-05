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
client.loom.registry.shopping = { version: "0.3.0", keyword: "SHOPPING", desc: "{{description}}",
  redraw: function () { run_function("shopping_render", [], "shopping"); },
  busy: function () {
    var S = client.loom.shopping, q = S.q, r = S.r;
    return !!(q && q.sent && Date.now() - q.at < S.giveUpMs) || !!(r && r.sent && Date.now() - r.at < S.riftGiveUpMs) || !!(S.m && S.m.hidden);
  } };

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
//   rift   the rift item it restocks (#440), "" otherwise: INR'd once bought
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
    shops: shOs, shop: String(shE.shop).trim(), price: shPrice, cur: shCur, area: String(shE.area || ""), at: Number(shE.at) || 0,
    rift: String(shE.rift || "").trim().slice(0, 80) });
}
// shopping_skip = [shop, …]: shops you'd rather not visit (SHOPPING SKIP).
SH.skip = {};
var shSk = SH.readList("shopping_skip");
for (var shSi = 0; shSi < shSk.length; shSi++) if (typeof shSk[shSi] == "string" && shSk[shSi].trim()) SH.skip[shSk[shSi].trim()] = true;
// shopping_goal: the gold already made a coffers goal from this list (GOAL).
SH.goalAdded = Math.max(0, Number(get_variable("shopping_goal")) || 0);
SH.q = null;          // the DIRECTORY being read: { word, n, sent, at, prompts, head, rules, rows, descAt, shopAt }
SH.choices = null;    // different items for one word, waiting for PICK: { word, n, area, opts: [{ desc, rows }] }
SH.giveUpMs = 5000;   // a DIRECTORY that never answers
if (SH.here === undefined) SH.here = null;  // { area, id, name } from Room.Info
// shopping_rooms = { shop: room number }: the room each shop was found in,
// learnt when a room's name is the shop's name or set by SHOPPING HERE.
SH.rooms = {};
var shRm = get_variable("shopping_rooms");
if (typeof shRm == "string") { try { shRm = JSON.parse(shRm); } catch (e) { shRm = null; } }
if (shRm && typeof shRm == "object" && !Array.isArray(shRm)) for (var shRk in shRm) if (shRm.hasOwnProperty(shRk) && /^\d+$/.test(String(shRm[shRk]))) SH.rooms[shRk] = String(shRm[shRk]);

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
  if (!SH.list.length && SH.goalAdded) { SH.goalAdded = 0; delete_variable("shopping_goal"); }
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
// Skipped shops (SHOPPING SKIP) are left out while another shop sells the
// item; an item sold only there stays with it.
SH.cands = function (it) {
  var open = it.shops.filter(function (o) { return !SH.skip[o.s]; });
  if (!open.length) open = it.shops;
  var low = null, cur = open.length ? open[0].c : "gp", out = [], enough = [];
  for (var i = 0; i < open.length; i++) if (open[i].c === cur && (low === null || open[i].p < low)) low = open[i].p;
  for (var j = 0; j < open.length; j++) {
    var o = open[j];
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
  if (SH.r && SH.r.sent) return;                // our own rift reading first
  if (SH.othersBusy() && Date.now() - q.at < SH.giveUpMs) return;
  q.sent = true; q.at = Date.now(); q.prompts = 0;
  send_command("directory " + q.word, 1);
  clearTimeout(SH.qT);
  SH.qT = setTimeout(SH.prompt, SH.giveUpMs + 100);   // gives up even with no prompt coming
};
// From onGMCP at each prompt (after its packet's lines). A lookup not sent
// yet goes now; one with no table after two prompts found nothing (the
// game's own answer is left on screen); a table without its closing rule
// is taken as read.
SH.prompt = function () {
  var q = SH.q;
  if (!q) return;
  if (!q.sent) { SH.send(); return; }
  // A prompt within a moment of sending is the packet the lookup went out
  // in (a RESTOCK sends right as the rift reading ends), not the answer's.
  if (!q.head && Date.now() - q.at < 100) return;
  q.prompts++;
  if (q.head && q.prompts >= 1) SH.done();
  // No table yet: given up on time only (#440). Counting prompts gave up
  // while the table was still coming in a busy game, and the late table was
  // then read as the next lookup's.
  else if (!q.head && Date.now() - q.at > SH.giveUpMs) {
    SH.q = null;
    SH.say("the directory lists nothing for " + q.word + " here (DIRECTORY only covers the city or area you're in).", "orange");
    run_function("shopping_render", [], "shopping");
    SH.next();
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

// Whether a directory row is for this lookup: its description holds the
// word or the rift name (articles and plurals aside, or the word with its
// spaces taken out: "purpleink" in "a purple ink").
SH.related = function (desc, q) {
  var d = " " + SH.plain(desc) + " ", ds = d.replace(/\s+/g, "");
  var ws = [SH.plain(q.word)];
  if (q.rift) ws.push(SH.plain(q.rift));
  for (var i = 0; i < ws.length; i++) {
    if (!ws[i]) continue;
    if (d.indexOf(" " + ws[i] + " ") >= 0 || ds.indexOf(ws[i].replace(/\s+/g, "")) >= 0) return true;
  }
  return false;
};
// The table is read: one item → onto the list; several → ask which.
SH.done = function () {
  var q = SH.q;
  if (!q) return;
  // A RESTOCK lookup takes only a table for its own word: one for an earlier
  // word arriving late is left alone, and this lookup keeps waiting.
  if (q.rift && q.rows.length && !q.rows.some(function (r) { return SH.related(r.desc, q); })) {
    q.head = false; q.rules = 0; q.rows = []; q.prompts = 0; q.descAt = -1; q.shopAt = -1;
    return;
  }
  SH.q = null;
  clearTimeout(SH.qT);
  if (!q.rows.length) { SH.say("the directory lists nothing for " + q.word + " here.", "orange"); run_function("shopping_render", [], "shopping"); SH.next(); return; }
  var opts = [], idx = {};
  for (var i = 0; i < q.rows.length; i++) {
    var k = SH.key(q.rows[i].desc);
    if (idx[k] === undefined) { idx[k] = opts.length; opts.push({ desc: q.rows[i].desc, rows: [] }); }
    opts[idx[k]].rows.push(q.rows[i]);
  }
  var area = SH.here ? SH.here.area : "";
  // A restocked item you picked before (#440): the same one again.
  if (q.rift && opts.length > 1 && SH.picks[q.rift]) {
    for (var pi = 0; pi < opts.length; pi++) if (SH.key(opts[pi].desc) === SH.key(SH.picks[q.rift])) { opts = [opts[pi]]; break; }
  }
  if (opts.length === 1) { SH.choices = null; SH.put(q.word, q.n, opts[0], area, q.rift); SH.next(); return; }
  // Cheapest first; at one price, those sold at a shop already on the list.
  opts.sort(function (a, b) { return (SH.cheapest(a).price - SH.cheapest(b).price) || ((SH.optOnList(a) ? 0 : 1) - (SH.optOnList(b) ? 0 : 1)); });
  SH.choices = { word: q.word, n: q.n, area: area, opts: opts, rift: q.rift || "" };
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
  if (C.rift) { SH.picks[C.rift] = o.desc; SH.savePicks(); }
  SH.put(C.word, C.n, o, C.area, C.rift);
  SH.next();
};
SH.cancelPick = function () {
  var C = SH.choices;
  SH.choices = null;
  if (C && C.rift) SH.say("skipped " + C.rift + ".", "cyan");
  run_function("shopping_render", [], "shopping");
  SH.next();
};
// Onto the list with every shop the directory named (place picks one). On
// the list already: the quantity adds up, the shops are the fresh ones.
// A restock (rift set) asks for what's short, so an item already on the list
// is raised to it, not added to (a second RESTOCK doesn't double it).
SH.put = function (word, n, opt, area, rift) {
  var shops = [], seen = {};
  for (var i = 0; i < opt.rows.length; i++) {
    var r = opt.rows[i];
    if (seen[r.shop]) continue;
    seen[r.shop] = 1;
    shops.push({ s: r.shop, p: r.price, c: r.cur, k: r.stock });
  }
  var it = SH.byDesc(opt.desc), was = it ? it.n : 0;
  if (!it) { it = { desc: opt.desc, word: word, n: 0, shops: [], shop: shops[0].s, price: 0, cur: "gp", area: "", at: 0 }; SH.list.push(it); }
  if (rift) it.rift = rift;
  it.n = Math.min(9999, rift ? Math.max(it.n, n) : it.n + n); it.shops = shops; it.word = word; it.area = area || it.area; it.at = Date.now();
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
  if (shop === SH.MKT) { send_command("path find " + SH.mktRoom, 1); SH.say("walking to the commodities market in Delos."); return; }
  // A commodity shop (#473): the game's PATH FIND to the room WARES was read in.
  if (SH.wares[shop]) {
    if (!SH.wares[shop].room) { SH.say("no room known for " + shop + ": walk there and type WARES once.", "orange"); return; }
    send_command("path find " + SH.wares[shop].room, 1);
    SH.say("walking to " + shop + " (room " + SH.wares[shop].room + ").");
    return;
  }
  send_command(SH.walkCmd + " " + shop, 1);
  SH.say("walking to " + shop + ".");
};

// The shop on the list you're standing in, or "": the room whose number is
// known for it, or a room named like it (then its number is learnt).
SH.nameKey = function (s) { return SH.key(s).replace(/^the\s+/, "").replace(/[^a-z0-9 ]/g, ""); };
SH.saveRooms = function () {
  var any = false;
  for (var k in SH.rooms) if (SH.rooms.hasOwnProperty(k)) { any = true; break; }
  if (any) set_variable("shopping_rooms", JSON.stringify(SH.rooms)); else delete_variable("shopping_rooms");
};
SH.shopHere = function () {
  var H = SH.here;
  if (!H || !H.id) return "";
  var shops = {};
  for (var i = 0; i < SH.list.length; i++) shops[SH.list[i].shop] = 1;
  for (var s in shops) if (SH.rooms[s] === H.id) return s;
  for (var t in shops) {
    if (SH.rooms[t] === undefined && SH.nameKey(t) && SH.nameKey(t) === SH.nameKey(H.name)) { SH.rooms[t] = H.id; SH.saveRooms(); return t; }
  }
  return "";
};
// SHOPPING HERE <shop>: this room is that shop (when its name differs).
SH.setHere = function (shop) {
  if (!SH.here || !SH.here.id) { SH.say("no room yet: move or LOOK first.", "orange"); return; }
  SH.rooms[shop] = SH.here.id;
  SH.saveRooms();
  SH.say(shop + " is room " + SH.here.id + " (" + (SH.here.name || "?") + "): BUY shows here for its items.", "lime");
  run_function("shopping_render", [], "shopping");
};

// BUY on an item's line: "buy <n> <word you looked it up by>", once per
// click, shown only in that item's shop. What the game hands over comes
// off the list (received).
SH.buyCmd = function (it) {
  if (it.shop === SH.MKT) return "cm buy " + it.n + " " + it.word + " for " + SH.mktFill(it.word, it.n).max;
  return "buy " + it.n + " " + it.word;
};
SH.buy = function (it) {
  if (SH.paused()) { SH.say("Loom is paused (LOOM PAUSE OFF to buy).", "orange"); return; }
  if (!it.word) { SH.say("no word to buy " + it.desc + " by: add it again.", "orange"); return; }
  if (SH.shopHere() !== it.shop) { SH.say("you're not in " + it.shop + ": WALK there first (or SHOPPING HERE " + it.shop + " if this room is it).", "orange"); return; }
  SH.lastBuy = { it: it, at: Date.now() };
  send_command(SH.buyCmd(it), 1);
};

// "You pay 80 sovereigns and receive a group of 10 cohosh roots.": what
// you received comes off the list, the line going once it's all there.
// Looked for among the items of the shop you're in (any shop when you're
// in none), the last one you clicked BUY for first: its description, the
// same without a bulk "a group of N", or the word you added it by.
// A name without its article and plural endings, for comparing what the game
// hands over with the list ("9 blue inks" ~ "a blue ink").
SH.plain = function (s) {
  return SH.key(s).replace(/^(?:a|an|the|some)\s+/, "").split(" ").map(function (w) { return w.replace(/(?:es|s)$/, ""); }).join(" ");
};
SH.received = function (what) {
  var w = String(what || "").trim().replace(/\s+commodities$/i, ""), got = 1, m;
  if ((m = /^(?:a|an|one) (?:group|bundle|bunch|pile) of ([\d,]+) (.+)$/i.exec(w))) { got = Number(m[1].replace(/,/g, "")); w = m[2]; }
  else if ((m = /^([\d,]+) (.+)$/.exec(w))) { got = Number(m[1].replace(/,/g, "")); w = m[2]; }
  var here = SH.shopHere(), pool = SH.list.filter(function (it) { return !here || it.shop === here; });
  if (SH.lastBuy && Date.now() - SH.lastBuy.at < 30000 && pool.indexOf(SH.lastBuy.it) >= 0) { pool.splice(pool.indexOf(SH.lastBuy.it), 1); pool.unshift(SH.lastBuy.it); }
  var k = SH.key(w), kA = SH.key(String(what || "")), hit = null;
  for (var i = 0; i < pool.length && !hit; i++) if (SH.key(pool[i].desc) === k || SH.key(pool[i].desc) === kA) hit = pool[i];
  // "9 blue inks" for "a blue ink": without articles and plural endings.
  for (var i2 = 0; i2 < pool.length && !hit; i2++) if (SH.plain(pool[i2].desc) === SH.plain(w)) hit = pool[i2];
  for (var j = 0; j < pool.length && !hit; j++) if (pool[j].word && new RegExp("\\b" + pool[j].word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i").test(w)) hit = pool[j];
  // Still nothing: what you clicked BUY for a moment ago.
  if (!hit && SH.lastBuy && Date.now() - SH.lastBuy.at < 30000 && pool.indexOf(SH.lastBuy.it) >= 0) hit = SH.lastBuy.it;
  if (!hit) return;
  SH.lastBuy = null;
  // A rift item goes back into the rift (Ricardo), on balance like harvesting's INR.
  var riftOf = hit.rift || (SH.rift[SH.riftItemOf(hit.word)] ? SH.riftItemOf(hit.word) : "");
  if (hit.shop === SH.MKT) {
    // The market delivers into the rift itself: no INR, the count goes up.
    if (riftOf && SH.rift[riftOf]) { SH.rift[riftOf][0] += got; SH.saveRift(); }
  } else if (riftOf && hit.word && !SH.paused()) send_command("queue add be inr " + hit.word);
  if (got < hit.n) {
    hit.n -= got;
    SH.save();
    SH.say("bought " + got + " × " + hit.desc + "; " + hit.n + " still to buy.", "lime");
    return;
  }
  SH.list.splice(SH.list.indexOf(hit), 1);
  SH.save();
  SH.say("bought " + hit.desc + ": off the list. " + (SH.list.length ? SH.list.length + " left, about " + SH.sumText(SH.total()) + "." : "The list is done."), "lime");
};

// SKIP: move a shop's items to their next cheapest shops; UNSKIP undoes it.
SH.skipList = function () { var out = []; for (var k in SH.skip) if (SH.skip.hasOwnProperty(k) && SH.skip[k]) out.push(k); return out.sort(); };
SH.saveSkip = function () { var l = SH.skipList(); if (l.length) set_variable("shopping_skip", JSON.stringify(l)); else delete_variable("shopping_skip"); };
SH.skipShop = function (shop) {
  var before = {}, items = SH.list.filter(function (it) { return it.shop === shop; });
  for (var i = 0; i < items.length; i++) before[items[i].desc] = items[i].n * items[i].price;
  SH.skip[shop] = true;
  SH.saveSkip();
  SH.save();
  var moved = [], stuck = [], extra = 0;
  for (var j = 0; j < items.length; j++) {
    if (items[j].shop === shop) stuck.push(items[j].desc);
    else { moved.push(items[j].desc + " → " + items[j].shop); extra += items[j].n * items[j].price - before[items[j].desc]; }
  }
  SH.say("skipping " + shop + "." + (moved.length ? " Moved: " + moved.join(", ") + (extra > 0 ? " (" + SH.money(extra) + " more)" : "") + "." : "") +
    (stuck.length ? " Sold only there, so staying: " + stuck.join(", ") + "." : "") + " SHOPPING UNSKIP " + shop + " to undo.", stuck.length ? "orange" : "lime");
};
SH.unskip = function (shop) {
  if (shop === "all") SH.skip = {}; else delete SH.skip[shop];
  SH.saveSkip();
  SH.save();
  SH.say(shop === "all" ? "no shops skipped." : shop + " is back. Total " + SH.sumText(SH.total()) + ".", "lime");
};

// GOAL (with coffers, link coffers-shopping): the list's gold total as a
// coffers goal. Only what wasn't made a goal already is added, so a second
// click after adding items adds just the new part.
SH.goalLink = function () {
  var L = client.loom.loom;
  var a = (L && L.answer) ? L.answer("shopping", "shopping.goal") : undefined;
  return a && typeof a.set == "function" ? a : null;
};
SH.goal = function () {
  var g = SH.goalLink(), gp = SH.total().gp || 0, add = gp - SH.goalAdded;
  if (!g) { SH.say("needs coffers installed (and LOOM LINK coffers-shopping ON).", "orange"); return; }
  if (!gp) { SH.say("nothing in gold on the list.", "orange"); return; }
  if (add <= 0) { SH.say("the list's " + SH.money(gp) + " is in your coffers goal already (" + SH.money(SH.goalAdded) + " added).", "cyan"); return; }
  if (!g.set(add, SH.goalAdded ? "more shopping: the list is now " + SH.money(gp) : "the shopping list: " + SH.list.length + (SH.list.length === 1 ? " item" : " items") + " in " + SH.byShop().length + (SH.byShop().length === 1 ? " shop" : " shops"))) { SH.say("coffers didn't take the goal (COFFERS PROPOSED to see why).", "orange"); return; }
  SH.goalAdded = gp;
  set_variable("shopping_goal", String(gp));
  run_function("shopping_render", [], "shopping");
};

// ---- Minimum stocks (#440) -------------------------------------------
// A minimum for anything in your rift, read with a hidden IR (the whole rift,
// every category, paged with MORE). None by default (Ricardo): only the
// minimums you set count. A category you WATCH also takes another package's
// minimums for its items you haven't set yourself (herbs: harvesting;
// gathered materials: gathering, through links harvesting-shopping and
// gathering-shopping); yours always win, since what you buy needn't be what
// you harvest. RESTOCK puts everything under its minimum on the list,
// minimum less stock, looking each up with DIRECTORY by its rift name; a
// word the directory knows several items for waits for PICK, and the pick is
// kept for next time. The ledger gets one Restock reminder for your own
// minimums (link shopping-ledger).
// Saved:
//   shopping_min   { rift name: n }      your minimums
//   shopping_watch [category, …]         categories taking packages' minimums
//   shopping_rift  { rift name: [n, category] }, the last reading, kept
//                  current by the game's store/remove lines
//   shopping_picks { rift name: directory description } (PICK remembered)
//   shopping_words { rift name: the game's word } where they differ (WORD)
SH.readTable = function (name) {
  var v = get_variable(name);
  if (typeof v == "string") { try { v = JSON.parse(v); } catch (e) { v = null; } }
  return (v && typeof v == "object" && !Array.isArray(v)) ? v : {};
};
SH.saveTable = function (name, t) {
  var any = false;
  for (var k in t) if (t.hasOwnProperty(k)) { any = true; break; }
  if (any) set_variable(name, JSON.stringify(t)); else delete_variable(name);
};
SH.mins = {};
var shMn = SH.readTable("shopping_min");
for (var shMk in shMn) if (shMn.hasOwnProperty(shMk) && Number(shMn[shMk]) > 0) SH.mins[SH.key(shMk)] = Math.min(999999, Math.floor(Number(shMn[shMk])));
SH.rift = {};
var shRf = SH.readTable("shopping_rift");
for (var shRk2 in shRf) if (shRf.hasOwnProperty(shRk2) && Array.isArray(shRf[shRk2]) && Number(shRf[shRk2][0]) >= 0) SH.rift[SH.key(shRk2)] = [Math.floor(Number(shRf[shRk2][0])), String(shRf[shRk2][1] || "").slice(0, 30)];
SH.picks = {};
var shPk = SH.readTable("shopping_picks");
for (var shPkk in shPk) if (shPk.hasOwnProperty(shPkk) && typeof shPk[shPkk] == "string" && shPk[shPkk].trim()) SH.picks[SH.key(shPkk)] = shPk[shPkk].trim().slice(0, 120);
SH.watch = {};
var shWl = SH.readList("shopping_watch");
for (var shWi = 0; shWi < shWl.length; shWi++) if (typeof shWl[shWi] == "string" && shWl[shWi].trim()) SH.watch[SH.key(shWl[shWi])] = true;
SH.saveWatch = function () {
  var l = [];
  for (var k in SH.watch) if (SH.watch.hasOwnProperty(k) && SH.watch[k]) l.push(k);
  if (l.length) set_variable("shopping_watch", JSON.stringify(l.sort())); else delete_variable("shopping_watch");
  if (client.loom.notify) client.loom.notify("shopping");
};
SH.catOf = function (name) { var r = SH.rift[SH.key(name)]; return r ? r[1] : ""; };
// The game's word for a rift item, for DIRECTORY and BUY: yours (SHOPPING
// WORD), else the built-in exceptions, else the rift's own name. Inks: the
// rift says "red ink", the game knows "redink" (Ricardo, 2026-11-05).
SH.words = {};
var shWd = SH.readTable("shopping_words");
for (var shWk in shWd) if (shWd.hasOwnProperty(shWk) && typeof shWd[shWk] == "string" && shWd[shWk].trim()) SH.words[SH.key(shWk)] = shWd[shWk].trim().toLowerCase().slice(0, 60);
SH.wordRules = [[/^(\w+) ink$/, "$1ink"]];
SH.wordOf = function (name) {
  var k = SH.key(name);
  if (SH.words[k]) return SH.words[k];
  for (var i = 0; i < SH.wordRules.length; i++) if (SH.wordRules[i][0].test(k)) return k.replace(SH.wordRules[i][0], SH.wordRules[i][1]);
  return k;
};
// The rift item a game word names (store/remove lines may use either).
SH.riftItemOf = function (word) {
  var k = SH.key(word);
  if (SH.rift[k] || SH.mins[k] !== undefined) return k;
  for (var r in SH.rift) if (SH.rift.hasOwnProperty(r) && SH.wordOf(r) === k) return r;
  for (var m in SH.mins) if (SH.mins.hasOwnProperty(m) && SH.wordOf(m) === k) return m;
  return k;
};
// Rift items whose name holds this word whole: "horn" is in "piece of
// stag's horn", "silver" in "silver bar" (Ricardo, 2026-11-05).
SH.riftHolding = function (word) {
  var k = SH.key(word), out = [];
  if (!k) return out;
  var re = new RegExp("(?:^|[\\s'])" + k.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "(?:$|[\\s'])");
  for (var r in SH.rift) if (SH.rift.hasOwnProperty(r) && r !== k && re.test(r)) out.push(r);
  return out.sort();
};
SH.setWord = function (name, word) {
  var k = SH.riftItemOf(name);
  if (!word) { delete SH.words[k]; SH.say(k + " is looked up as " + SH.wordOf(k) + " again.", "lime"); }
  else { SH.words[k] = SH.key(word); SH.say(k + " is looked up and bought as " + SH.words[k] + ".", "lime"); }
  SH.saveTable("shopping_words", SH.words);
};
SH.saveMins = function () { SH.saveTable("shopping_min", SH.mins); if (client.loom.notify) client.loom.notify("shopping"); };
SH.saveRift = function () { SH.saveTable("shopping_rift", SH.rift); if (client.loom.notify) client.loom.notify("shopping"); };
SH.savePicks = function () { SH.saveTable("shopping_picks", SH.picks); };
SH.have = function (name) { var r = SH.rift[SH.key(name)]; return r ? r[0] : null; };
// Another package's minimum for this item, through loom: { by, min, stock, cmd } or undefined.
SH.owner = function (name) {
  var L = client.loom.loom;
  return (L && L.answer) ? L.answer("shopping", "rift.owner", SH.key(name)) : undefined;
};
// Shopping's own minimums with what the rift holds: [{ item, stock, min }]
// (stock 0 for an item the last reading didn't show: none left).
SH.ownLevels = function () {
  var out = [];
  for (var k in SH.mins) if (SH.mins.hasOwnProperty(k)) out.push({ item: k, stock: SH.riftAt ? (SH.have(k) || 0) : SH.have(k), min: SH.mins[k] });
  out.sort(function (a, b) { return a.item < b.item ? -1 : (a.item > b.item ? 1 : 0); });
  return out;
};
// Everything under its minimum: yours, and in watched categories the other
// packages' for items without one of yours: [{ item, n, by }].
SH.shortList = function () {
  var out = [], seen = {};
  var own = SH.ownLevels();
  for (var i = 0; i < own.length; i++) {
    seen[own[i].item] = 1;
    if (own[i].stock !== null && own[i].stock < own[i].min) out.push({ item: own[i].item, n: own[i].min - own[i].stock, by: "" });
  }
  var L = client.loom.loom, lists = (L && L.answers) ? L.answers("shopping", "rift.short") : [];
  for (var j = 0; j < lists.length; j++) {
    var l = lists[j].value;
    if (!Array.isArray(l)) continue;
    for (var k = 0; k < l.length; k++) {
      var e = l[k], key = e && SH.key(e.item);
      if (!key || seen[key] || !(e.min > e.stock) || !SH.watch[SH.key(SH.catOf(key))]) continue;
      seen[key] = 1;
      out.push({ item: key, n: e.min - e.stock, by: e.by || "" });
    }
  }
  return out;
};
// The read-only look loom reads (link shopping-ledger): shopping's own
// minimums and their stock, only items the rift has been read for.
SH.look = {
  levels: function () { return SH.ownLevels().filter(function (x) { return x.stock !== null; }); }
};

// The rift reading: a hidden IR, sent when no other package waits on an
// answer of its own, at most every few seconds. MORE is sent for each page.
// The reading ends at its closing rule, or two prompts after its last line
// (a MORE on its way keeps it open).
SH.r = null;
SH.riftAt = Number(get_variable("shopping_rift_at")) || 0;
SH.riftGiveUpMs = 15000;
SH.readRift = function (then) {
  if (SH.paused()) { SH.say("Loom is paused (LOOM PAUSE OFF to read the rift).", "orange"); return; }
  if (SH.r) { if (then) SH.r.then = then; return; }
  SH.r = { then: then || "", sent: false, at: Date.now(), head: false, rules: 0, cat: "", rows: {}, prompts: 0, more: false, pages: 1 };
  SH.riftSend();
};
SH.riftSend = function () {
  var r = SH.r;
  if (!r || r.sent) return;
  if (SH.q || (SH.othersBusy() && Date.now() - r.at < SH.riftGiveUpMs)) return;
  r.sent = true; r.at = Date.now(); r.prompts = 0;
  send_command("ir", 1);
  SH.riftTimer(SH.riftGiveUpMs);
};
// A reading also ends on its own a moment after its last line (longer while
// a MORE is on its way), so one left open can't take in a later IR you type.
SH.riftTimer = function (ms) {
  clearTimeout(SH.riftT);
  SH.riftT = setTimeout(function () {
    var r = SH.r;
    if (!r || !r.sent) return;
    if (r.head) SH.riftDone();
    else { SH.r = null; SH.say("the rift didn't answer (IR): try again in a moment.", "orange"); }
  }, ms);
};
// One line while our reading is out; true when it's ours (to hide).
SH.riftLine = function (line) {
  var r = SH.r;
  if (!r || !r.sent) return false;
  if (/^Glancing into your rift, you see:$/.test(line)) { r.head = true; r.prompts = 0; return true; }
  if (!r.head) return false;
  r.prompts = 0;
  // Nexus shows the pager as "[Type MORE if you wish to continue reading. (67% shown)]".
  if (/^\[?Type MORE if you wish to continue/.test(line)) { r.more = true; r.pages++; send_command("more", 1); SH.riftTimer(8000); return true; }
  if (/^\[File continued via MORE\]$/.test(line)) { SH.riftTimer(2500); return true; }
  r.more = false;
  SH.riftTimer(2500);
  if (/^-{20,}$/.test(line)) { r.rules++; if (r.rules >= 2) setTimeout(SH.riftDone, 0); return true; }
  var re = /\[\s*([\d,]+)\]\s+(.+?)(?=\s+\[|\s*$)/g, m, any = false;
  while ((m = re.exec(line)) !== null) { r.rows[SH.key(m[2])] = [Number(m[1].replace(/,/g, "")), r.cat]; any = true; }
  if (any) return true;
  // A category: one capitalised word (Herbs, Minerals, Commodities, Misc).
  if (/^[A-Z][a-z]{2,20}$/.test(line)) { r.cat = line; return true; }
  return false;
};
// At each prompt while the reading is out (from onGMCP).
SH.riftPrompt = function () {
  var r = SH.r;
  if (!r) return;
  if (!r.sent) { SH.riftSend(); return; }
  r.prompts++;
  if (r.more) { if (Date.now() - r.at > SH.riftGiveUpMs) SH.riftDone(); return; }
  if (r.head && r.prompts >= 2) SH.riftDone();
  else if (!r.head && (r.prompts >= 3 || Date.now() - r.at > SH.riftGiveUpMs)) {
    SH.r = null;
    SH.say("the rift didn't answer (IR): try again in a moment.", "orange");
  }
};
SH.riftDone = function () {
  var r = SH.r;
  if (!r) return;
  SH.r = null;
  clearTimeout(SH.riftT);
  var n = 0;
  for (var k in r.rows) if (r.rows.hasOwnProperty(k)) n++;
  if (!n) { SH.say("read your rift but found nothing in it.", "orange"); return; }
  SH.rift = r.rows;
  SH.riftAt = Date.now();
  set_variable("shopping_rift_at", String(SH.riftAt));
  SH.saveRift();
  if (r.then === "min") SH.showMins();
  else if (r.then === "restock") SH.restock();
  run_function("shopping_render", [], "shopping");
};
// "You store 10 kola, bringing the total in the rift to 2,408." and remove:
// the rift's new total for that item, without reading it again.
SH.riftTotal = function (name, total) {
  var k = SH.riftItemOf(name), was = SH.rift[k];
  SH.rift[k] = [Math.max(0, Number(String(total).replace(/,/g, "")) || 0), was ? was[1] : ""];
  SH.saveRift();
  run_function("shopping_render", [], "shopping");
};

// SHOPPING MIN <item> <n|OFF>.
SH.setMin = function (name, n) {
  var k = SH.riftItemOf(name);                  // "blueink" is the rift's "blue ink"
  // Not a rift name: a word in exactly one item's name is that item, and the
  // game's word for it from now on ("horn" → piece of stag's horn).
  if (!SH.rift[k] && SH.mins[k] === undefined && SH.riftAt) {
    var hold = SH.riftHolding(k);
    if (hold.length > 1) { SH.say("'" + k + "' is in several rift items: " + hold.join(", ") + ". Use the full name.", "orange"); return; }
    if (hold.length === 1 && n !== null) {
      // Only for an item with no word yet (red ink keeps redink).
      if (SH.wordOf(hold[0]) === hold[0]) { SH.words[hold[0]] = k; SH.saveTable("shopping_words", SH.words); }
      SH.say(k + " is your rift's " + hold[0] + " (looked up and bought as " + SH.wordOf(hold[0]) + "; SHOPPING WORD " + hold[0] + " = <word> to change).", "cyan");
      k = hold[0];
    }
  }
  if (!k) return;
  var ow = SH.owner(k);
  if (n === null) {
    if (SH.mins[k] === undefined) { SH.say("no minimum set for " + k + ".", "orange"); return; }
    delete SH.mins[k];
    SH.saveMins();
    SH.say("no minimum for " + k + " any more.", "lime");
  } else {
    SH.mins[k] = n;
    SH.saveMins();
    var h = SH.have(k);
    SH.say("minimum for " + k + ": " + SH.n(n) + (h === null ? (SH.riftAt ? " (none in your rift)" : " (rift not read yet: SHOPPING MIN reads it)") : " (" + SH.n(h) + " in your rift" + (h < n ? ", " + SH.n(n - h) + " short" : "") + ")") + "." +
      (ow && ow.by ? " " + ow.by + " keeps its own (" + (ow.min != null ? SH.n(ow.min) : "?") + ") for itself; this one is for buying." : ""), "lime");
    if (h === null && SH.riftAt) SH.say("'" + k + "' isn't in your rift now: check it's the name IR shows.", "orange");
  }
  run_function("shopping_render", [], "shopping");
};
// Bare SHOPPING MIN, after a fresh reading: every minimum and the short ones.
SH.showMins = function () {
  var own = SH.ownLevels(), sh = SH.shortList();
  if (!own.length) SH.say("no minimums of your own yet: SHOPPING MIN <item> <n> for anything in your rift.");
  else {
    SH.say("your minimums (" + own.length + "):");
    for (var i = 0; i < own.length; i++) {
      var o = own[i], low = o.stock !== null && o.stock < o.min;
      SH.say("  " + o.item + ": " + SH.n(o.stock || 0) + " / " + SH.n(o.min) + (low ? "  (" + SH.n(o.min - o.stock) + " short)" : ""), low ? "orange" : "cyan");
    }
  }
  var others = sh.filter(function (x) { return x.by; });
  if (others.length) SH.say("short in watched categories, by other packages' minimums: " + others.map(function (x) { return x.item + " " + SH.n(x.n) + " (" + x.by + ")"; }).join(", ") + ".", "orange");
  SH.say(sh.length ? "SHOPPING RESTOCK puts the " + sh.length + " short " + (sh.length === 1 ? "item" : "items") + " on the list." : "nothing is under its minimum.", sh.length ? "cyan" : "lime");
};

// WATCH: the rift's categories and which take packages' minimums.
SH.cats = function () {
  var c = {};
  for (var k in SH.rift) if (SH.rift.hasOwnProperty(k) && SH.rift[k][1]) c[SH.rift[k][1]] = 1;
  for (var w in SH.watch) if (SH.watch.hasOwnProperty(w) && SH.watch[w]) { var have = false; for (var x in c) if (SH.key(x) === w) have = true; if (!have) c[w.charAt(0).toUpperCase() + w.slice(1)] = 1; }
  return Object.keys(c).sort();
};
SH.setWatch = function (cat, on) {
  var k = SH.key(cat), known = SH.cats().some(function (c) { return SH.key(c) === k; });
  if (on && !known && SH.riftAt) SH.say("'" + cat + "' isn't one of your rift's categories (" + SH.cats().join(", ") + "); watching it anyway.", "orange");
  if (on) SH.watch[k] = true; else delete SH.watch[k];
  SH.saveWatch();
  SH.say(on ? "watching " + k + ": its items without a minimum of yours take their package's (harvesting for herbs, gathering for what it gathers)." : k + " no longer watched: only your own minimums count there.", "lime");
  run_function("shopping_render", [], "shopping");
};
SH.showWatch = function () {
  var c = SH.cats();
  if (!c.length) { SH.say("your rift hasn't been read yet: SHOPPING MIN reads it. SHOPPING WATCH <category> ON|OFF."); return; }
  SH.say("categories (watched ones also take harvesting's and gathering's minimums): " + c.map(function (x) { return x + (SH.watch[SH.key(x)] ? " ON" : " off"); }).join(", ") + ". SHOPPING WATCH <category> ON|OFF.");
};

// RESTOCK: every short item onto the list, one DIRECTORY at a time.
SH.queue = [];
SH.restock = function () {
  var sh = SH.shortList();
  if (!sh.length) { SH.say("nothing is under its minimum: no restocking to do.", "lime"); return; }
  // Commodities come from the commodity shops' WARES, not the directory (#473).
  var dir = [], com = [];
  for (var i = 0; i < sh.length; i++) (SH.key(SH.catOf(sh[i].item)) === "commodities" ? com : dir).push(sh[i]);
  SH.say("restocking " + sh.length + (sh.length === 1 ? " item" : " items") + ": " + sh.map(function (x) { return x.item + " " + SH.n(x.n); }).join(", ") + "." + (dir.length ? " Looking " + (dir.length === 1 ? "it" : "each") + " up in the directory…" : ""));
  var missing = [];
  for (var j = 0; j < com.length; j++) if (!SH.putCommodity(com[j].item, com[j].n)) missing.push(com[j].item);
  if (missing.length) SH.say("not found in any commodity shop you've read WARES in, nor in the market's last listings: " + missing.join(", ") + ". SCAN the market (or CM LIST it) and RESTOCK again.", "orange");
  SH.queue = dir.map(function (x) { return { word: SH.wordOf(x.item), n: x.n, rift: x.item }; });
  SH.next();
};

// ---- Commodity shops (#473) ------------------------------------------
// WARES in a city's commodity shop lists each commodity with what the shop
// pays (We Buy At), its stock, and its price to you (We Sell At, fixed by
// the city). Shopping reads the table whenever you type WARES there, and
// keeps it per shop (the room you were in), so RESTOCK can list rift
// commodities under the cheapest shop that sells them. Buying there is
// "BUY 10 CLOTH" → "You purchase 10 cloth for 450 gold."
// Saved: shopping_wares { shop: { area, room, at, items: { commodity: [price, stock, name, pays] } } }
//   (price 0: the shop doesn't sell it; pays: its We Buy At, 0 when it buys none)
SH.wares = {};
var shWr = SH.readTable("shopping_wares");
for (var shWsk in shWr) {
  if (!shWr.hasOwnProperty(shWsk) || !shWr[shWsk] || typeof shWr[shWsk] != "object") continue;
  var shWo = shWr[shWsk], shWit = {};
  if (shWo.items && typeof shWo.items == "object") for (var shWc in shWo.items) if (shWo.items.hasOwnProperty(shWc) && Array.isArray(shWo.items[shWc])) shWit[SH.key(shWc)] = [Math.max(0, Number(shWo.items[shWc][0]) || 0), Math.max(0, Number(shWo.items[shWc][1]) || 0), String(shWo.items[shWc][2] || shWc).slice(0, 40), Math.max(0, Number(shWo.items[shWc][3]) || 0)];
  SH.wares[String(shWsk).slice(0, 80)] = { area: String(shWo.area || "").slice(0, 80), room: String(shWo.room || ""), at: Number(shWo.at) || 0, items: shWit };
}
SH.saveWares = function () { SH.saveTable("shopping_wares", SH.wares); };
SH.w = null;            // the WARES table being read: { shop, at, head }
// "Proprietor: The Verdant Wilds of Eleusis." starts a table.
SH.waresStart = function (who) {
  var H = SH.here || {}, area = H.area || String(who || "").replace(/^.* of /, "");
  var shop = (area || "a") + " commodity shop";
  SH.w = { shop: shop, at: Date.now(), head: false };
  SH.wares[shop] = { area: area, room: H.id || "", at: Date.now(), items: {} };
  if (H.id) { SH.rooms[shop] = H.id; SH.saveRooms(); }
};
SH.waresLine = function (line) {
  var w = SH.w;
  if (!w || Date.now() - w.at > 5000) { SH.w = null; return; }
  if (/^Commodity\s+We Buy At\s+Stock\s+We Sell At\s*$/.test(line)) { w.head = true; return; }
  if (!w.head) return;
  var m = /^(.+?)\s+(-|[\d,]+\s*gp)\s+([\d,]+)\s+(-|[\d,]+\s*gp)\s*$/.exec(line);
  if (!m) { SH.waresDone(); return; }
  var sell = m[4] === "-" ? 0 : Number(m[4].replace(/[^\d]/g, "")), pays = m[2] === "-" ? 0 : Number(m[2].replace(/[^\d]/g, ""));
  SH.wares[w.shop].items[SH.key(m[1])] = [sell, Number(m[3].replace(/,/g, "")), m[1].trim(), pays];
  w.at = Date.now();
};
SH.waresDone = function () {
  var w = SH.w;
  if (!w) return;
  SH.w = null;
  run_function("shopping_render", [], "shopping");
  var it = SH.wares[w.shop] ? SH.wares[w.shop].items : {}, n = 0, sold = 0;
  for (var k in it) if (it.hasOwnProperty(k)) { n++; if (it[k][0] > 0) sold++; }
  if (!n) { delete SH.wares[w.shop]; return; }
  SH.saveWares();
  SH.say("noted " + w.shop + "'s wares: " + sold + " of " + n + " commodities for sale. RESTOCK lists rift commodities under the cheapest shop that sells them.", "lime");
};
// The commodity a rift item is: built-in names first, then a WARES name
// found whole in the rift name, or the rift name inside a WARES name
// ("silver" in silver bar, "dust" in diamond dust).
SH.comNames = { "silver bar": "silver", "piece of stag's horn": "stag's horn", "dust": "diamond dust" };
SH.commodityOf = function (item) {
  var k = SH.key(item);
  if (SH.comNames[k]) return SH.comNames[k];
  if (SH.words[k]) return SH.words[k];
  var names = {};
  for (var s in SH.wares) if (SH.wares.hasOwnProperty(s)) for (var c in SH.wares[s].items) if (SH.wares[s].items.hasOwnProperty(c)) names[c] = 1;
  if (names[k]) return k;
  var pk = SH.plain(k), best = "";
  for (var n in names) {
    if (!names.hasOwnProperty(n)) continue;
    var pn = SH.plain(n);
    if ((" " + pk + " ").indexOf(" " + pn + " ") >= 0 || (" " + pn + " ").indexOf(" " + pk + " ") >= 0) { if (!best || n.length > best.length) best = n; }
  }
  return best || k;
};
// The tab's price table: open or folded, and BUY (their prices to you) or
// SELL (what they pay you). Saved: shopping_prices = "folded" | "sell" |
// "folded,sell" (absent: open, BUY).
var shPv = String(get_variable("shopping_prices") || "");
SH.pricesFolded = /folded/.test(shPv);
SH.pricesSell = /sell/.test(shPv);
SH.marketFolded = /mfold/.test(shPv);
SH.savePrices = function () {
  var v = [SH.pricesFolded ? "folded" : "", SH.pricesSell ? "sell" : "", SH.marketFolded ? "mfold" : ""].filter(function (x) { return x; }).join(",");
  if (v) set_variable("shopping_prices", v); else delete_variable("shopping_prices");
  run_function("shopping_render", [], "shopping");
};
// The shops in the table's order (by area), and every commodity read.
SH.waresShops = function () {
  return Object.keys(SH.wares).sort(function (a, b) { var x = SH.wares[a].area || a, y = SH.wares[b].area || b; return x < y ? -1 : (x > y ? 1 : 0); });
};
// ↻ on a shop: walk there and read WARES on arrival (one walk, one WARES,
// both from your click); in the shop already, WARES at once.
SH.refresh = function (shop) {
  var W = SH.wares[shop];
  if (!W) return;
  if (SH.paused()) { SH.say("Loom is paused (LOOM PAUSE OFF to walk).", "orange"); return; }
  if (SH.here && W.room && SH.here.id === W.room) { send_command("wares", 1); return; }
  if (!W.room) { SH.say("no room known for " + shop + ": walk there and type WARES.", "orange"); return; }
  SH.waresOnArrival = { room: W.room, at: Date.now() };
  send_command("path find " + W.room, 1);
  SH.say("walking to " + shop + " to read its wares (WARES on arrival).");
};
SH.arrived = function () {
  var A = SH.waresOnArrival;
  if (!A || !SH.here) return;
  if (Date.now() - A.at > 10 * 60000) { SH.waresOnArrival = null; return; }
  if (SH.here.id === A.room) { SH.waresOnArrival = null; if (!SH.paused()) send_command("wares", 1); }
};
// Onto the list from the shops' WARES: the cheapest that sells it (one with
// enough stock first). False when no shop read sells it.
SH.putCommodity = function (item, n) {
  var c = SH.commodityOf(item), shops = [];
  for (var s in SH.wares) {
    if (!SH.wares.hasOwnProperty(s)) continue;
    var e = SH.wares[s].items[c];
    if (e && e[0] > 0) shops.push({ s: s, p: e[0], c: "gp", k: e[1], name: e[2], area: SH.wares[s].area });
  }
  // The market: priced for the whole amount from the depth read (#473).
  var mk = SH.market[c];
  if (mk && mk.asks && mk.asks.length) { var f = SH.mktFill(c, n); shops.push({ s: SH.MKT, p: f.avg, c: "gp", k: f.have, name: mk.name, area: "Delos" }); }
  if (!shops.length) return false;
  shops.sort(function (a, b) { return (a.p - b.p) || ((a.k >= n ? 0 : 1) - (b.k >= n ? 0 : 1)); });
  var desc = shops[0].name || c, it = null;
  for (var i = 0; i < SH.list.length; i++) if (SH.list[i].rift === SH.key(item) || SH.key(SH.list[i].desc) === SH.key(desc)) it = SH.list[i];
  if (!it) { it = { desc: desc, word: c, n: 0, shops: [], shop: shops[0].s, price: 0, cur: "gp", area: shops[0].area, at: 0, rift: SH.key(item) }; SH.list.push(it); }
  it.n = Math.min(9999, Math.max(it.n, n)); it.word = c; it.rift = SH.key(item); it.at = Date.now();
  it.shops = shops.map(function (o) { return { s: o.s, p: o.p, c: "gp", k: o.k }; });
  SH.save();
  SH.say(it.n + " × " + desc + " at " + SH.money(it.price, it.cur) + " (" + SH.money(it.n * it.price, it.cur) + "), from " + it.shop + (it.stock >= 0 && it.stock < it.n ? "; it has only " + it.stock + " in stock" : "") + ".", it.stock >= 0 && it.stock < it.n ? "orange" : "lime");
  return true;
};
// The next queued lookup, once nothing is being read or picked.
SH.next = function () {
  if (SH.q || SH.choices || !SH.queue.length) return;
  var w = SH.queue.shift();
  SH.q = { word: w.word, n: w.n, rift: w.rift, sent: false, at: Date.now(), prompts: 0, head: false, rules: 0, rows: [], descAt: -1, shopAt: -1 };
  SH.send();
  run_function("shopping_render", [], "shopping");
};

// ---- The commodities market in Delos (#473) ----------------------------
// CM LIST <comm> lists the offers to sell, cheapest first, with the amount at
// each price; it works anywhere. Shopping reads one you type (shown), and
// SCAN runs it for every commodity it knows, hidden, one at a time, reading
// only the first page (the cheapest offers). CM BUY works only in the market
// (room 44519): "You are about to purchase N X commodities for a total of G
// gold sovereigns. Type AGREE …", answered with AGREE right after our own
// BUY when the total is within its ceiling; "You pay G gold sovereigns and
// receive N X commodities." The market puts them in the rift itself.
// Saved: shopping_market { comm: { at, name, asks: [[price, qty], …] } } (cheapest first, up to 12)
SH.MKT = "Delos commodities market";
SH.mktRoom = "44519";
SH.rooms[SH.MKT] = SH.mktRoom;
SH.market = {};
var shMk = SH.readTable("shopping_market");
for (var shMc in shMk) {
  if (!shMk.hasOwnProperty(shMc) || !shMk[shMc] || !Array.isArray(shMk[shMc].asks)) continue;
  var shMa = shMk[shMc].asks.filter(function (a) { return Array.isArray(a) && Number(a[0]) > 0 && Number(a[1]) > 0; }).map(function (a) { return [Number(a[0]), Number(a[1])]; }).slice(0, 12);
  SH.market[SH.key(shMc)] = { at: Number(shMk[shMc].at) || 0, name: String(shMk[shMc].name || shMc).slice(0, 40), asks: shMa };
}
SH.saveMarket = function () { SH.saveTable("shopping_market", SH.market); };
// Buying n from the asks read: the ceiling to give CM BUY (the dearest ask
// needed), the average price, and how much the read offers held in all.
SH.mktFill = function (comm, n) {
  var mk = SH.market[SH.key(comm)], need = n, cost = 0, max = 0, have = 0;
  if (!mk || !mk.asks.length) return { max: 0, avg: 0, have: 0 };
  for (var i = 0; i < mk.asks.length; i++) {
    have += mk.asks[i][1];
    if (need > 0) { var t = Math.min(need, mk.asks[i][1]); cost += t * mk.asks[i][0]; need -= t; max = mk.asks[i][0]; }
  }
  if (need > 0) { cost += need * max; }
  return { max: max, avg: Math.round(cost / n), have: have };
};
// Reading a listing: { comm (expected, "" for all), hidden, at, head, rules, rows: { comm: [[p, q]] }, names }
SH.m = null;
SH.mktStart = function (comm) {
  var exp = SH.m && SH.m.expect;
  var hidden = !!(exp && (comm === "" ? false : SH.key(comm) === exp));
  SH.m = { comm: SH.key(comm), hidden: hidden, at: Date.now(), head: false, rules: 0, rows: {}, names: {} };
  SH.mktTimer(4000);
  return hidden;
};
SH.mktTimer = function (ms) {
  clearTimeout(SH.mT);
  SH.mT = setTimeout(function () { if (SH.m) SH.mktDone(); }, ms);
};
// One line; true when it should be hidden (a SCAN's).
SH.mktLine = function (line) {
  var mm = /^Listing all (?:(.+) )?commodities:$/.exec(line);
  if (mm) return SH.mktStart(mm[1] || "");
  var M = SH.m;
  if (!M || M.expect) return false;
  if (/^Commodity\s+Price\s+Quantity Available\s*$/.test(line)) { M.head = true; return M.hidden; }
  if (!M.head) return false;
  if (/^-{20,}$/.test(line)) { M.rules++; if (M.rules >= 2) setTimeout(SH.mktDone, 0); return M.hidden; }
  if (/^\[?Type MORE if you wish to continue/.test(line)) { setTimeout(SH.mktDone, 0); return M.hidden; }
  var r = /^(.+?)\s+([\d,]+)gp\s+([\d,]+)\s*$/.exec(line);
  if (!r) return false;
  var k = SH.key(r[1]);
  (M.rows[k] || (M.rows[k] = [])).push([Number(r[2].replace(/,/g, "")), Number(r[3].replace(/,/g, ""))]);
  M.names[k] = r[1].trim();
  SH.mktTimer(1500);
  return M.hidden;
};
SH.mktDone = function () {
  var M = SH.m;
  if (!M || M.expect) return;
  SH.m = null;
  clearTimeout(SH.mT);
  var got = 0;
  for (var k in M.rows) {
    if (!M.rows.hasOwnProperty(k)) continue;
    var a = M.rows[k].sort(function (x, y) { return x[0] - y[0]; }).slice(0, 12);
    SH.market[k] = { at: Date.now(), name: M.names[k] || k, asks: a };
    got++;
  }
  // A scanned commodity nobody sells now: its old offers go.
  if (M.comm && !M.rows[M.comm] && M.hidden && SH.market[M.comm]) delete SH.market[M.comm];
  if (got || M.hidden) SH.saveMarket();
  if (!M.hidden && got) SH.say("noted the market's offers for " + got + (got === 1 ? " commodity" : " commodities") + ".", "lime");
  run_function("shopping_render", [], "shopping");
  if (SH.scan) setTimeout(SH.scanNext, 300);
};
// SCAN: every commodity known (shops' wares, the market, your rift's
// Commodities), one CM LIST at a time, hidden.
SH.scan = null;
SH.scanNames = function () {
  var n = {};
  for (var s in SH.wares) if (SH.wares.hasOwnProperty(s)) for (var c in SH.wares[s].items) if (SH.wares[s].items.hasOwnProperty(c)) n[c] = 1;
  for (var m in SH.market) if (SH.market.hasOwnProperty(m)) n[m] = 1;
  for (var r in SH.rift) if (SH.rift.hasOwnProperty(r) && SH.key(SH.rift[r][1]) === "commodities") n[SH.commodityOf(r)] = 1;
  return Object.keys(n).sort();
};
SH.scanStart = function () {
  if (SH.paused()) { SH.say("Loom is paused (LOOM PAUSE OFF to scan).", "orange"); return; }
  if (SH.scan) { SH.say("already scanning (" + SH.scan.i + " of " + SH.scan.names.length + ").", "orange"); return; }
  var names = SH.scanNames();
  if (!names.length) { SH.say("no commodities known yet: read WARES in a commodity shop, or CM LIST one.", "orange"); return; }
  SH.scan = { names: names, i: 0, at: Date.now() };
  SH.say("scanning the market for " + names.length + " commodities (CM LIST each, hidden)…");
  SH.scanNext();
};
SH.scanNext = function () {
  var S = SH.scan;
  if (!S) return;
  if (S.i >= S.names.length) { SH.scan = null; SH.say("market scan done: " + S.names.length + " commodities in " + Math.round((Date.now() - S.at) / 1000) + "s.", "lime"); run_function("shopping_render", [], "shopping"); return; }
  if (SH.m || SH.q || SH.r || SH.othersBusy()) { setTimeout(SH.scanNext, 500); return; }
  var c = S.names[S.i++];
  SH.m = { expect: SH.key(c), at: Date.now() };     // its listing is ours to hide
  send_command("cm list " + c, 1);
  clearTimeout(SH.mT);
  SH.mT = setTimeout(function () { if (SH.m && SH.m.expect) { SH.m = null; SH.scanNext(); } }, 5000);
  run_function("shopping_render", [], "shopping");
};
SH.scanStop = function () { if (SH.scan) { SH.scan = null; SH.say("market scan stopped.", "orange"); run_function("shopping_render", [], "shopping"); } };
// AGREE: only for our own CM BUY a moment ago, and within its ceiling.
SH.mktAgree = function (n, comm, total) {
  var b = SH.lastBuy, it = b && b.it;
  if (!it || it.shop !== SH.MKT || Date.now() - b.at > 15000) return;
  var lim = SH.mktFill(it.word, it.n).max * n;
  if (SH.key(comm) !== SH.key(it.word) || n > it.n || total > lim) { SH.say("not agreeing: " + n + " " + comm + " for " + SH.money(total) + " isn't what was asked (" + it.n + " at most " + SH.money(SH.mktFill(it.word, it.n).max) + " each). Type AGREE yourself if it's right.", "orange"); return; }
  send_command("agree", 1);
};
SH.mktMissed = function (comm) {
  SH.say("the market has no " + comm + " at that price any more: SCAN (or CM LIST " + comm + ") and BUY again.", "orange");
};

// The tab's clicks. Its page shares window with the scripts but can't reach
// client.loom in every Nexus, so these closures carry them.
try {
  window.loomShopping = {
    remove: function (i) { var S = client.loom.shopping, it = S.ordered()[i]; if (it) S.remove(it); },
    pick: function (i) { client.loom.shopping.pick(i + 1); },
    buy: function (i) { var S = client.loom.shopping, it = S.ordered()[i]; if (it) S.buy(it); },
    skip: function (i) { var S = client.loom.shopping, g = S.shopsDrawn || []; if (g[i] !== undefined) S.skipShop(g[i]); },
    unskip: function (i) { var S = client.loom.shopping, l = S.skipList(); if (l[i] !== undefined) S.unskip(l[i]); },
    goal: function () { client.loom.shopping.goal(); },
    walk: function (i) { var S = client.loom.shopping, g = S.shopsDrawn || []; if (g[i] !== undefined) S.walk(g[i]); },
    cancel: function () { client.loom.shopping.cancelPick(); },
    restock: function () { client.loom.shopping.readRift("restock"); },
    pricesFold: function () { var S = client.loom.shopping; S.pricesFolded = !S.pricesFolded; S.savePrices(); },
    pricesMode: function () { var S = client.loom.shopping; S.pricesSell = !S.pricesSell; S.savePrices(); },
    refresh: function (i) { var S = client.loom.shopping, l = S.waresShops(); if (l[i] !== undefined) S.refresh(l[i]); },
    scan: function () { var S = client.loom.shopping; if (S.scan) S.scanStop(); else S.scanStart(); },
    market: function () { client.loom.shopping.walk(client.loom.shopping.MKT); },
    marketFold: function () { var S = client.loom.shopping; S.marketFolded = !S.marketFolded; S.savePrices(); }
  };
} catch (e) {}
if (client.loom.notify) client.loom.notify("shopping");
