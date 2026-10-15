// loom_links -- the integrations catalogue and its on/off switches (#37),
// and the display entry point (#159): tabs ask loom questions, links answer
// them from their source's read-only `look`, sources announce changes.
// Run from onLoad and onInstall. Every integration lives in this package
// and registers here with L.addLink; it is on as soon as both of its
// packages are installed, unless the player switched it off. Only the
// switched-off ids are stored (loom_links_off, a JSON list), so an
// integration added in a later version starts on.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.loom) client.loom.loom = {};
var L = client.loom.loom;

// The catalogue: id -> { id, src, dst, desc, issue, change, answers }, plus the ids
// in the order they were added (the order LOOM LINKS lists them in).
// Rebuilt on every load, so a removed integration leaves nothing behind.
L.links = {};
L.linkOrder = [];

// Register an integration. e = { id, src, dst, desc, issue, change, answers, update }:
// src and dst are package names as in client.loom.registry; change, if
// given, is called with true/false when the player switches the link on or
// off, so the integration can withdraw what it created (the destination is
// redrawn either way). answers, for display integrations, maps a question
// name to a function answering it from the source's `look`, e.g.
//   answers: { "person.colour": function (name) { return client.loom.social.look.colour(name); } }
// update, for integrations that write to their destination (a ledger item,
// a coffers proposal): run when the source notifies, when the link is
// switched on, and once at load; debounced, so a burst of changes (a whole
// IR listing) runs it once. It reads the source's look and calls the
// destination's entry; switching off withdraws on its own (setLink).
L.addLink = function (e) {
  if (!e || !e.id) return;
  var id = String(e.id).toLowerCase();
  if (!L.links[id]) L.linkOrder.push(id);
  L.links[id] = { id: id, src: e.src, dst: e.dst, desc: e.desc || "", issue: e.issue || 0, change: e.change, answers: e.answers || {}, update: e.update };
};
L.updateT = L.updateT || {};
L.runUpdate = function (id) {
  var e = L.links[id];
  if (!e || typeof e.update !== "function") return;
  if (L.updateT[id]) clearTimeout(L.updateT[id]);
  L.updateT[id] = setTimeout(function () {
    L.updateT[id] = null;
    if (!L.linkOn(id)) return;
    try { L.links[id].update(); } catch (err) { display_notice("[loom] link " + id + " failed to update: " + err, "orange"); }
  }, 200);
};
L.updateAll = function () { for (var i = 0; i < L.linkOrder.length; i++) L.runUpdate(L.linkOrder[i]); };

// The switched-off ids, as a set. Read once per load and kept in step by
// L.setLink, so the hot path (L.linkOn) never parses the variable.
L.linksOff = {};
(function () {
  var raw;
  try { raw = JSON.parse(get_variable("loom_links_off") || "[]"); } catch (e) { raw = []; }
  if (!Array.isArray(raw)) raw = [];
  for (var i = 0; i < raw.length; i++) L.linksOff[String(raw[i]).toLowerCase()] = true;
})();

// The packages a link still needs, as a list of names (empty when both
// are installed). A package counts as installed when it is in the registry.
L.linkMissing = function (id) {
  var e = L.links[String(id || "").toLowerCase()];
  var out = [];
  if (!e) return out;
  var reg = client.loom.registry || {};
  if (e.src && !reg[e.src]) out.push(e.src);
  if (e.dst && e.dst !== e.src && !reg[e.dst]) out.push(e.dst);
  return out;
};

// "on", "off" (switched off by the player), "waiting" (a package missing)
// or "" for an unknown id. Switched off wins over waiting.
L.linkState = function (id) {
  id = String(id || "").toLowerCase();
  if (!L.links[id]) return "";
  if (L.linksOff[id]) return "off";
  if (L.linkMissing(id).length) return "waiting";
  return "on";
};

// The one question integrations ask before doing anything.
L.linkOn = function (id) { return L.linkState(id) === "on"; };

// Switch a link on or off. Stores only the switched-off ids, and tells the
// integration when its effective state changed. Returns false for an
// unknown id.
L.setLink = function (id, on) {
  id = String(id || "").toLowerCase();
  if (!L.links[id]) return false;
  var was = L.linkOn(id);
  if (on) delete L.linksOff[id]; else L.linksOff[id] = true;
  var off = Object.keys(L.linksOff).sort();
  if (off.length) set_variable("loom_links_off", JSON.stringify(off));
  else delete_variable("loom_links_off");
  var now = L.linkOn(id);
  var ch = L.links[id].change;
  if (was !== now && typeof ch === "function") {
    try { ch(now); } catch (e) { display_notice("[loom] link " + id + " failed to switch: " + e, "orange"); }
  }
  // Switched off: whatever the link created in its destination goes, for
  // every destination with a write-side entry point (standings #36, ledger
  // #34, coffers #35), so no integration can forget to clean up.
  if (was && !now) {
    var dn = client.loom[L.links[id].dst];
    if (dn && dn.entry && typeof dn.entry.withdraw === "function") {
      try { dn.entry.withdraw(L.links[id].src); } catch (e) { display_notice("[loom] link " + id + " could not take back its items: " + e, "orange"); }
    }
  }
  if (!was && now) L.runUpdate(id);
  if (was !== now) L.redraw(L.links[id].dst);
  return true;
};

// ---- The display entry point (#159) ----------------------------------
// Questions are named by what the tab needs, dotted (person.colour,
// item.flags, room.plants, target), never by who answers, so a later source
// can answer the same question without the tab changing. A tab asks as its
// own package (dst), so only links into that package answer: switching off
// social-room takes the colours out of Here but not out of Comms. Answers
// come only from links that are on; a link that throws or answers
// undefined/null/"" is skipped. With no answer the tab renders plainly.

// Every answer, in link order, as [{ link, value }]. For questions where
// several sources may speak at once (flags on an item row).
L.answers = function (dst, q, arg) {
  var out = [];
  for (var i = 0; i < L.linkOrder.length; i++) {
    var e = L.links[L.linkOrder[i]];
    var f = e && e.answers && e.answers[q];
    if (typeof f !== "function" || e.dst !== dst || !L.linkOn(e.id)) continue;
    var v;
    try { v = f(arg); } catch (err) { v = undefined; }
    if (v !== undefined && v !== null && v !== "") out.push({ link: e.id, value: v });
  }
  return out;
};

// The first answer, or undefined. For questions with one answer (a colour).
L.answer = function (dst, q, arg) {
  var a = L.answers(dst, q, arg);
  return a.length ? a[0].value : undefined;
};

// Redraw a destination package's display, debounced per package (a burst of
// changes is one draw). Destinations say how in their registry entry:
// client.loom.registry.<pkg>.redraw.
L.redrawT = L.redrawT || {};
L.redraw = function (dst) {
  if (!dst) return;
  if (L.redrawT[dst]) clearTimeout(L.redrawT[dst]);
  L.redrawT[dst] = setTimeout(function () {
    L.redrawT[dst] = null;
    var r = (client.loom.registry || {})[dst];
    if (r && typeof r.redraw === "function") {
      try { r.redraw(); } catch (e) { display_notice("[loom] redraw of " + dst + " failed: " + e, "orange"); }
    }
  }, 50);
};

// Sources call this when state their `look` reports has changed, guarded so
// they work without loom:  if (client.loom.notify) client.loom.notify("social");
// Every destination of a link from that source that is on is redrawn.
client.loom.notify = function (src) {
  var seen = {};
  for (var i = 0; i < L.linkOrder.length; i++) {
    var e = L.links[L.linkOrder[i]];
    if (e.src !== src || !L.linkOn(e.id)) continue;
    if (typeof e.update === "function") L.runUpdate(e.id);
    if (!seen[e.dst]) { seen[e.dst] = true; L.redraw(e.dst); }
  }
};

// Integrations register below, one L.addLink each, as they land in 0.5.

// #162 social -> room: players in the Here tab in their highlight colours.
L.addLink({
  id: "social-room", src: "social", dst: "room", issue: 162,
  desc: "Players in the Here tab in their highlight colours",
  answers: {
    "person.colour": function (n) { var s = client.loom.social; return s && s.look ? s.look.colour(n) : undefined; },
    "person.group": function (n) { var s = client.loom.social; return s && s.look ? s.look.group(n) : undefined; }
  }
});

// #160 social -> comms: talkers and Tells in their highlight colours.
L.addLink({
  id: "social-comms", src: "social", dst: "comms", issue: 160,
  desc: "Talkers in the Comms tab in their highlight colours",
  answers: {
    "person.colour": function (n) { var s = client.loom.social; return s && s.look ? s.look.colour(n) : undefined; },
    "person.group": function (n) { var s = client.loom.social; return s && s.look ? s.look.group(n) : undefined; }
  }
});

// #196 standings -> social: your standing with each watched person in the
// Online tab.
L.addLink({
  id: "standings-online", src: "standings", dst: "social", issue: 196,
  desc: "Your standing with each person in the Online tab",
  answers: {
    "person.standing": function (n) { var s = client.loom.standings; return s && s.look ? s.look.standing(n) : undefined; }
  }
});

// #161 standings -> comms: your standing with a talker, on hover.
L.addLink({
  id: "standings-comms", src: "standings", dst: "comms", issue: 161,
  desc: "Your standing with a talker, on hover in the Comms tab",
  answers: {
    "person.standing": function (n) { var s = client.loom.standings; return s && s.look ? s.look.standing(n) : undefined; }
  }
});

// #50 standings -> social: your standing with someone, as its icon, in the
// "has awoken" notice ("Ana \u2665 has awoken"). Its own question, so it
// switches off apart from the Online column (standings-online).
L.addLink({
  id: "standings-login", src: "standings", dst: "social", issue: 50,
  desc: "Your standing's icon in the 'has awoken' notice",
  answers: {
    "notice.standing": function (n) { var s = client.loom.standings; return s && s.look ? s.look.standing(n) : undefined; }
  }
});

// #164 patrolling -> room: shrines and totems of friendly and hostile gods
// flagged in the Here tab's items. item.flags answers { label, tone, icon,
// title }: the tab owns the colours ("bad" = alert, "good" = reassuring),
// the icon says what the thing is (Ricardo: an icon left of the name, other
// icons for other things later). Neutral gods' shrines get no flag. Sigils
// (#165) will answer the same question.
L.addLink({
  id: "patrolling-room", src: "patrolling", dst: "room", issue: 164,
  desc: "Friendly and hostile gods' shrines and totems flagged in Here",
  answers: {
    "item.flags": function (name) {
      var p = client.loom.patrolling;
      var it = p && p.look ? p.look.item(name) : undefined;
      if (!it || it.stance === "neutral") return undefined;
      return { label: it.stance + " " + it.kind, tone: it.stance === "hostile" ? "bad" : "good", icon: it.kind === "totem" ? "\u2625" : "\u26ea", title: (it.god ? it.god.charAt(0).toUpperCase() + it.god.slice(1) + ": " : "") + it.stance + " " + it.kind };
    }
  }
});

// #46 harvesting -> ledger: one standing "Harvest run" reminder (Ricardo:
// one per plant would be spam). It appears when any plant falls below 90%
// of its minimum, lists every plant under its minimum while it stands, and
// goes away only when all are back at their minimum: the gap between the
// two keeps a plant hovering near one line from making reminders "like
// sausages".
L.harvestTrigger = 0.9;
L.addLink({
  id: "harvesting-ledger", src: "harvesting", dst: "ledger", issue: 46,
  desc: "A harvest run reminder in the ledger when plant stock runs low",
  update: function () {
    var h = client.loom.harvesting, lg = client.loom.ledger;
    if (!h || !h.look || !lg || !lg.entry) return;
    var lv = h.look.levels(), under = [], urgent = false;
    for (var i = 0; i < lv.length; i++) {
      if (lv[i].stock < lv[i].min) under.push(lv[i]);
      if (lv[i].stock < lv[i].min * L.harvestTrigger) urgent = true;
    }
    if (!under.length) { lg.entry.withdraw("harvesting", "run"); return; }
    if (!urgent && !lg.entry.get("harvesting", "run")) return;
    under.sort(function (a, b) { return a.stock / a.min - b.stock / b.min; });
    var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
    var bits = [];
    for (var j = 0; j < under.length; j++) bits.push(under[j].plant + " " + fmt(under[j].stock) + "/" + fmt(under[j].min));
    lg.entry.upsert({ source: "harvesting", key: "run", text: "Harvest run: " + bits.join(", ") });
  }
});

// #54 talpieces -> ledger: a reminder per colour whose set is complete (all
// seven commons and its rare), and one standing reminder of spare pieces to
// trade away (Ricardo), with a buffer so a single extra piece doesn't make
// one: it appears at L.talSpareOn spare pieces in all and goes below
// L.talSpareOff. Spares are counted in level-1 pieces, as the goal counts.
L.talSpareOn = 16;
L.talSpareOff = 8;
L.addLink({
  id: "talpieces-ledger", src: "talpieces", dst: "ledger", issue: 54,
  desc: "Ledger reminders for complete talisman sets and spare pieces",
  update: function () {
    var t = client.loom.talpieces, lg = client.loom.ledger;
    if (!t || !t.look || !lg || !lg.entry) return;
    var cs = t.look.colours(), spare = [], total = 0;
    for (var i = 0; i < cs.length; i++) {
      var done = true;
      for (var j = 0; j < cs[i].types.length; j++) {
        var x = cs[i].types[j];
        if (x.have < x.need) done = false;
        if (x.have > x.need) { spare.push({ name: cs[i].colour + " " + x.type, n: x.have - x.need }); total += x.have - x.need; }
      }
      var cap = cs[i].colour.charAt(0).toUpperCase() + cs[i].colour.slice(1);
      if (done) lg.entry.upsert({ source: "talpieces", key: "set:" + cs[i].colour, text: cap + " talisman set complete: turn it in" });
      else lg.entry.withdraw("talpieces", "set:" + cs[i].colour);
    }
    var standing = !!lg.entry.get("talpieces", "spares");
    // Below the lower line it goes (and a dismissal of it ends); between the
    // lines a standing reminder stays, and none is made.
    if (total < L.talSpareOff) { lg.entry.withdraw("talpieces", "spares"); return; }
    if (!standing && total < L.talSpareOn) return;
    spare.sort(function (a, b) { return b.n - a.n; });
    var bits = [];
    for (var k = 0; k < spare.length; k++) bits.push(spare[k].name + " +" + spare[k].n);
    lg.entry.upsert({ source: "talpieces", key: "spares", text: "Spare talisman pieces to trade (" + total + "): " + bits.join(", ") });
  }
});

// #44 crystalism -> ledger: one "collect pearls" reminder, as harvesting's
// (Ricardo): it appears when any shape falls below 90% of its minimum, goes
// when all are back at it, and says how many pearls to fetch: the crystals
// short in all (each low shape up to its minimum), 9 facets to a pearl
// folded into the master crystal, one crystal refined from each facet.
// Nothing happens until the rift has been read (CRYSTALISM REFINE).
L.addLink({
  id: "crystalism-ledger", src: "crystalism", dst: "ledger", issue: 44,
  desc: "A collect pearls reminder in the ledger when crystals run low",
  update: function () {
    var c = client.loom.crystalism, lg = client.loom.ledger;
    if (!c || !c.look || !lg || !lg.entry) return;
    var lv = c.look.levels();
    if (!lv.length) return;
    var under = [], urgent = false, short = 0;
    for (var i = 0; i < lv.length; i++) {
      if (lv[i].have < lv[i].min) { under.push(lv[i]); short += lv[i].min - lv[i].have; }
      if (lv[i].have < lv[i].min * L.harvestTrigger) urgent = true;
    }
    if (!under.length) { lg.entry.withdraw("crystalism", "pearls"); return; }
    if (!urgent && !lg.entry.get("crystalism", "pearls")) return;
    // Just the pearls (Ricardo: REFINE fills the shapes evenly, so they top
    // up together; the shapes' detail is in CRYSTALISM MIN).
    var pearls = Math.ceil(short / (c.facetsPerPearl || 9));
    lg.entry.upsert({ source: "crystalism", key: "pearls", text: "Collect " + pearls + " pearl" + (pearls === 1 ? "" : "s") });
  }
});

// The cities: a room is in one when its GMCP area IS the city's name, exactly
// (case aside). Ricardo: by area, not environment (a city holds rooms of many
// environments), and exactly, so "The Cyrene Road" isn't Cyrene.
L.cityAreas = ["Targossas", "Cyrene", "Hashan", "Ashtan", "Mhaldor", "Eleusis"];

// #165 sigils -> room (Ricardo): monoliths shown in Here with their own icon,
// and two warnings by the room's area: a city room without a monolith
// (unless SIGILS IGNORE skips it), and a monolith outside the cities.
// room.alerts answers [{ label, tone, mark }] for the whole room, given
// { id, area, environment, items: [names] }; Here shows them as header tags, and
// turns the rows flagged with `mark` (an item flag's label) to the alert.
L.addLink({
  id: "sigils-room", src: "sigils", dst: "room", issue: 165,
  desc: "Monoliths in Here; warns of a city room without one, or one outside the city",
  answers: {
    "item.flags": function (name) {
      var s = client.loom.sigils;
      return (s && s.look && s.look.isMonolith(name)) ? { label: "monolith", tone: "info", icon: "\u25ae", title: "monolith" } : undefined;
    },
    "room.alerts": function (ctx) {
      var s = client.loom.sigils;
      if (!s || !s.look || !ctx) return undefined;
      var mono = false;
      for (var i = 0; i < (ctx.items || []).length; i++) { if (s.look.isMonolith(ctx.items[i])) { mono = true; break; } }
      var area = String(ctx.area || "").trim().toLowerCase(), urban = false;
      for (var ci = 0; ci < L.cityAreas.length; ci++) { if (L.cityAreas[ci].toLowerCase() === area) { urban = true; break; } }
      if (urban && !mono && !s.look.ignored(ctx.id)) return [{ label: "no monolith", tone: "bad" }];
      if (!urban && mono) return [{ label: "monolith outside the city", tone: "bad", mark: "monolith" }];
      return undefined;
    }
  }
});

// #42 sigils -> ledger (Ricardo): one "Sigil patrol" item, due the Achaean
// day the earliest flagged monolith runs out (monoliths only; a room with
// none is due at once). Withdrawn when nothing is flagged. A sigil month is
// an Achaean month, 25 Achaean days; an Achaean day is about a real hour,
// so a reading taken at real time t is dated back by the hours since then.
// Each reading's day is worked out once and kept, so the due date doesn't
// jitter as the hour turns. Waits until the ledger knows today's date.
L.sigilDue = L.sigilDue || {};
L.addLink({
  id: "sigils-ledger", src: "sigils", dst: "ledger", issue: 42,
  desc: "A sigil patrol in the ledger, due when the first flagged monolith runs out",
  update: function () {
    var s = client.loom.sigils, lg = client.loom.ledger;
    if (!s || !s.look || !s.look.expiring || !lg || !lg.entry) return;
    var rows = s.look.expiring();
    if (!rows.length) { lg.entry.withdraw("sigils", "patrol"); return; }
    if (!(lg.day > 0)) return;
    var now = Date.now(), due = null, first = null, none = 0, seen = {};
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i], ck = r.id + "|" + r.t + "|" + r.months;
      seen[ck] = true;
      if (L.sigilDue[ck] === undefined) {
        var read = lg.day - (r.t ? Math.max(0, Math.floor((now - r.t) / 3600000)) : 0);
        L.sigilDue[ck] = read + Math.max(0, r.months) * 25;
      }
      if (r.months < 0) none++;
      if (due === null || L.sigilDue[ck] < due) { due = L.sigilDue[ck]; first = r; }
    }
    for (var k in L.sigilDue) { if (L.sigilDue.hasOwnProperty(k) && !seen[k]) delete L.sigilDue[k]; }
    var n = rows.length;
    var text = "Sigil patrol: " + n + " monolith" + (n === 1 ? "" : "s") + " to renew" + (none ? " (" + none + " missing)" : "") + ", first " + first.name + " (" + first.id + ")";
    lg.entry.upsert({ source: "sigils", key: "patrol", text: text, due: due });
  }
});

// #60 standings -> social (Ricardo): a switch, SOCIAL COLOURS GROUPS|STANDINGS
// (social's own setting, default groups). In standings mode social asks this
// link for a name's colour: the band's colour for anyone on the books, groups
// ignored, plain for everyone else (Ricardo). Social
// passes it on to everything that shows its colours: game lines, Online,
// Here and Comms. Its own question, so it switches apart from standings-online.
L.addLink({
  id: "standings-social", src: "standings", dst: "social", issue: 60,
  desc: "Names coloured by standing band, when SOCIAL COLOURS STANDINGS is chosen",
  answers: {
    "person.colour": function (name) {
      var st = client.loom.standings;
      var r = st && st.look && st.look.standing ? st.look.standing(name) : undefined;
      return r ? r.colour : undefined;
    }
  }
});

// #166 harvesting -> room (Ricardo): the plants that should grow in the
// room's environment, in Here: green when here and stocked, yellow when here
// but under the minimum (stock not seen counts as none, as harvesting does),
// red when missing. The list and which plants are here come from patrolling
// (its expected table, learnt from real PLANTS output, and its silent PLANTS
// check with PATROLLING ON); stock and minimum from harvesting. Plants
// harvesting doesn't track (fruit, grain…) are green when here. Until
// patrolling has checked this room, nothing is shown. Display only.
L.addLink({
  id: "harvesting-room", src: "harvesting", dst: "room", issue: 166,
  desc: "The environment's plants in Here: stocked, low or missing (needs PATROLLING ON)",
  answers: {
    "room.plants": function (ctx) {
      var h = client.loom.harvesting, p = client.loom.patrolling;
      if (!h || !h.look || !h.look.plant || !p || !p.look || !p.look.plants || !p.look.expected || !ctx) return undefined;
      var here = p.look.plants(ctx.id), exp = p.look.expected(ctx.environment);
      if (!here || !exp || !exp.length) return undefined;
      var out = [];
      for (var i = 0; i < exp.length; i++) {
        var hp = h.look.plant(exp[i]);
        out.push({ plant: exp[i], present: here.indexOf(exp[i]) >= 0, stock: hp.stock, min: hp.min, low: hp.tracked && (hp.stock === null ? 0 : hp.stock) < hp.min, tracked: hp.tracked });
      }
      return out;
    }
  }
});

// #39 huntstats -> coffers (Ricardo: realistic, a little better each time):
// when a hunt starts in an area you've hunted before, propose a gold goal of
// your average hunt there +10% (average gold/hr x average hunt length is just
// total gold / hunts), rounded up to 100. Withdrawn when the hunt ends
// (filed, or you leave the area); an accepted goal stays yours.
L.huntGoalStretch = 1.1;
L.addLink({
  id: "huntstats-coffers", src: "huntstats", dst: "coffers", issue: 39,
  desc: "A gold goal 10% over your average hunt in an area, when you start hunting there",
  update: function () {
    var hs = client.loom.huntstats, co = client.loom.coffers;
    if (!hs || !hs.look || !hs.look.hunt || !hs.look.average || !co || !co.entry) return;
    var h = hs.look.hunt();
    var avg = h ? hs.look.average(h.area) : undefined;
    if (!h || !avg) { co.entry.withdraw("huntstats", "hunt"); return; }
    var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
    co.entry.propose({ source: "huntstats", key: "hunt", amount: Math.ceil(avg.gold * L.huntGoalStretch / 100) * 100, why: "10% over your average hunt in " + h.area + " (" + fmt(avg.gold) + " gold over " + avg.hunts + " hunt" + (avg.hunts === 1 ? "" : "s") + ")" });
  }
});

// #47 self -> ledger (Ricardo): when your explorer rank drops while you're
// logged in (the red arrow in the Self tab), the ledger gets "Explore a new
// area"; nothing stored, the starting point is this page load's first
// reading, as the tab's. Withdrawn when the rank is back at or above it.
L.addLink({
  id: "self-ledger", src: "self", dst: "ledger", issue: 47,
  desc: "Explore a new area, when your explorer rank drops while you play",
  update: function () {
    var sf = client.loom.self, lg = client.loom.ledger;
    if (!sf || !sf.look || !sf.look.explorer || !lg || !lg.entry) return;
    var e = sf.look.explorer();
    if (!e || !e.dropped) { lg.entry.withdraw("self", "explore"); return; }
    lg.entry.upsert({ source: "self", key: "explore", text: "Explore a new area (explorer rank " + e.base + " \u2192 " + e.rank + ")" });
  }
});
