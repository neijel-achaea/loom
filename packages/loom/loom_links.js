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

// Links whose id changed (old id -> new), so a link switched off under its
// old name stays off: crystalism's became magi's when magi 0.1.0 replaced
// crystalism and artificing.
L.renamedLinks = { "crystalism-ledger": "magi-ledger", "crystalism-room": "magi-room" };

// The switched-off ids, as a set. Read once per load and kept in step by
// L.setLink, so the hot path (L.linkOn) never parses the variable.
L.linksOff = {};
(function () {
  var raw;
  try { raw = JSON.parse(get_variable("loom_links_off") || "[]"); } catch (e) { raw = []; }
  if (!Array.isArray(raw)) raw = [];
  var moved = false;
  for (var i = 0; i < raw.length; i++) {
    var id = String(raw[i]).toLowerCase();
    if (L.renamedLinks[id]) { id = L.renamedLinks[id]; moved = true; }
    L.linksOff[id] = true;
  }
  if (moved) set_variable("loom_links_off", JSON.stringify(Object.keys(L.linksOff).sort()));
})();

// The packages a link still needs, as a list of names (empty when both
// are installed). A package counts as installed when it is in the registry.
L.linkMissing = function (id) {
  var e = L.links[String(id || "").toLowerCase()];
  var out = [];
  if (!e) return out;
  var reg = client.loom.registry || {};
  // Loom itself uninstalled (#137): every link waits, so no tab keeps
  // asking a package that is gone.
  if (!reg.loom) out.push("loom");
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
  // A destination whose redraw already gathers a burst into one draw says so
  // (registry `soon: true`, room): asked at once, it joins the draw already
  // pending instead of adding one 50 ms later (#136).
  var rs = (client.loom.registry || {})[dst];
  if (rs && rs.soon && typeof rs.redraw === "function") {
    try { rs.redraw(); } catch (e) { display_notice("[loom] redraw of " + dst + " failed: " + e, "orange"); }
    return;
  }
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

// A package being uninstalled calls this from its onUninstall (#137): its
// registry entry goes at once, so LOOM stops listing it and every link from
// it turns to waiting, and the tabs that showed its answers are redrawn
// without them. Nothing is withdrawn: a reinstall finds its items as they
// were, as after a reload.
client.loom.gone = function (pkg) {
  var reg = client.loom.registry || {};
  delete reg[pkg];
  var seen = {};
  for (var i = 0; i < L.linkOrder.length; i++) {
    var e = L.links[L.linkOrder[i]];
    if (e.src !== pkg || e.dst === pkg || !reg[e.dst] || seen[e.dst]) continue;
    seen[e.dst] = true;
    L.redraw(e.dst);
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
  desc: "Names in the Comms tab in their highlight colours",
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
// icons for other things later). Neutral gods' shrines get the icon in the
// plain colour, so a shrine still stands out (#277). Sigils
// (#165) will answer the same question.
L.addLink({
  id: "patrolling-room", src: "patrolling", dst: "room", issue: 164,
  desc: "Shrines and totems in Here coloured by their god's stance",
  answers: {
    "item.flags": function (name) {
      var p = client.loom.patrolling;
      var it = p && p.look ? p.look.item(name) : undefined;
      if (!it) return undefined;
      return { label: it.stance + " " + it.kind, tone: it.stance === "hostile" ? "bad" : (it.stance === "friendly" ? "good" : "info"), icon: it.kind === "totem" ? "\u2625" : "\u26ea", title: (it.god ? it.god.charAt(0).toUpperCase() + it.god.slice(1) + ": " : "") + it.stance + " " + it.kind };
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

// #44 magi -> ledger (crystalism's until magi 0.1.0): one "collect pearls"
// reminder, as harvesting's
// (Ricardo): it appears when any shape falls below 90% of its minimum, goes
// when all are back at it, and says how many pearls to fetch: the crystals
// short in all (each low shape up to its minimum), 9 facets to a pearl
// folded into the master crystal, one crystal refined from each facet.
// Nothing happens until the rift has been read (MAGI REFINE).
L.addLink({
  id: "magi-ledger", src: "magi", dst: "ledger", issue: 44,
  desc: "A collect pearls reminder in the ledger when crystals run low",
  update: function () {
    var c = client.loom.magi, lg = client.loom.ledger;
    if (!c || !c.look || !lg || !lg.entry) return;
    // The reminder used to come from crystalism: withdraw that one once, so
    // magi's takes its place instead of sitting next to it.
    if (!L.crystalismGone) { L.crystalismGone = true; lg.entry.withdraw("crystalism"); }
    var lv = c.look.levels();
    if (!lv.length) return;
    var under = [], urgent = false, short = 0;
    for (var i = 0; i < lv.length; i++) {
      if (lv[i].have < lv[i].min) { under.push(lv[i]); short += lv[i].min - lv[i].have; }
      if (lv[i].have < lv[i].min * L.harvestTrigger) urgent = true;
    }
    if (!under.length) { lg.entry.withdraw("magi", "pearls"); return; }
    if (!urgent && !lg.entry.get("magi", "pearls")) return;
    // Just the pearls (Ricardo: REFINE fills the shapes evenly, so they top
    // up together; the shapes' detail is in MAGI MIN).
    var pearls = Math.ceil(short / (c.facetsPerPearl || 9));
    lg.entry.upsert({ source: "magi", key: "pearls", text: "Collect " + pearls + " pearl" + (pearls === 1 ? "" : "s") });
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
// reading, as the tab's. The item stays until you DONE or DROP it (Ricardo),
// even when the rank recovers or the page reloads. Once it's gone and the
// rank is no longer down, its dismissal is cleared (withdraw), so the next
// drop brings a new one: one reminder per drop.
L.addLink({
  id: "self-ledger", src: "self", dst: "ledger", issue: 47,
  desc: "Explore a new area, when your explorer rank drops while you play",
  update: function () {
    var sf = client.loom.self, lg = client.loom.ledger;
    if (!sf || !sf.look || !sf.look.explorer || !lg || !lg.entry) return;
    var e = sf.look.explorer();
    if (!e || !e.dropped) { if (!lg.entry.get("self", "explore")) lg.entry.withdraw("self", "explore"); return; }
    lg.entry.upsert({ source: "self", key: "explore", text: "Explore a new area (explorer rank " + e.base + " \u2192 " + e.rank + ")" });
  }
});

// #59 dmgchart -> huntstats (Ricardo): the damage a hunt took. dmgchart keeps
// a rolling record of fights in memory; huntstats asks at filing (and while
// the Stats tab shows the hunt under way) for the stretch since the hunt's
// first experience, the fight that brought it included. Per area: incoming
// damage per combat second and the biggest hit, coloured by HUNTSTATS TANK.
L.addLink({
  id: "dmgchart-huntstats", src: "dmgchart", dst: "huntstats", issue: 59,
  desc: "Damage taken per combat second and the biggest hit, per hunt and per area",
  answers: {
    "hunt.damage": function (arg) {
      var dc = client.loom.dmgchart;
      if (!dc || !dc.look || !dc.look.since || !arg) return undefined;
      return dc.look.since(arg.from);
    }
  }
});

// #197 ledger -> social (with #49): open ledger items that name someone, as
// a capitalised whole word ("pay back Ana 5k"). Online (ledger-online): a
// quill on their row, with the count, in the ledger's warning colours. The
// "has awoken" notice (ledger-login): the items after it. Two links, two
// questions, so each switches on its own.
function ledgerAbout(n) { var lg = client.loom.ledger; return (lg && lg.look && lg.look.about) ? lg.look.about(n) : undefined; }
L.addLink({
  id: "ledger-online", src: "ledger", dst: "social", issue: 197,
  desc: "A quill in the Online tab on people your open ledger items name",
  answers: { "person.ledger": function (n) { var a = ledgerAbout(n); return a && a.length ? a : undefined; } }
});
L.addLink({
  id: "ledger-login", src: "ledger", dst: "social", issue: 197,
  desc: "Your open ledger items about someone in their 'has awoken' notice",
  answers: { "notice.ledger": function (n) { var a = ledgerAbout(n); return a && a.length ? a : undefined; } }
});

// #40 huntstats -> standings (Ricardo): a hunt of 30 minutes or more with
// someone in the party suggests the smallest friendly dealing (+) with each
// of them, to review (STANDINGS OK / SKIP). Acted on only right after the
// hunt is filed (within a minute) and once per hunt, so a reload or a later
// notice never brings it back. The party is huntstats' own (HUNTSTATS PARTY,
// later filled from follow lines, #188). A newer hunt with the same person
// replaces their pending suggestion.
L.huntNudgeMs = 30 * 60000;
L.addLink({
  id: "huntstats-standings", src: "huntstats", dst: "standings", issue: 40,
  desc: "A small friendly dealing to review with people you hunted with for 30 minutes or more",
  update: function () {
    var hs = client.loom.huntstats, st = client.loom.standings;
    if (!hs || !hs.look || !hs.look.filed || !st || !st.entry) return;
    var f = hs.look.filed();
    if (!f || !f.at || f.at === L.huntNudged || Date.now() - f.at > 60000) return;
    L.huntNudged = f.at;
    if (!(f.ms >= L.huntNudgeMs) || !f.players || !f.players.length) return;
    var mins = Math.round(f.ms / 60000);
    var len = mins >= 60 ? Math.floor(mins / 60) + "h " + (mins % 60) + "m" : mins + "m";
    for (var i = 0; i < f.players.length; i++) {
      st.entry.suggest({ who: f.players[i], step: 1, why: "hunted together in " + f.area + " for " + len, source: "huntstats" });
    }
  }
});

// #176 defcon -> self (Ricardo): the Self tab watches what DEFCON keeps up
// at its level, every defence of the effective table with a tier >= it, as
// its own layer next to SELF WANT (never written into it). DEFCON's missing
// defences show amber, yours red; DEFCON's losses only in the tab (its
// curing puts them back); the Defences title and SELF's summary name the
// level. A defence DEFCON relaxes on purpose isn't watched at that level.
L.addLink({
  id: "defcon-self", src: "defcon", dst: "self", issue: 176,
  desc: "The Self tab watches the defences DEFCON keeps up at its level",
  answers: {
    "defences.wanted": function () { var d = client.loom.defcon; return (d && d.look && d.look.wanted) ? d.look.wanted() : undefined; }
  }
});

// #53 coffers -> standings (Ricardo): gold given to you, 5,000 or more at
// once, suggests the smallest friendly dealing (+) with the giver, to review.
// Gold from someone in your huntstats party is the split being settled, not
// a gift, so it's skipped (read from huntstats' look when it's installed).
// Gifts are kept in memory only and each is looked at once, so a reload or
// a SKIP never brings one back. A newer gift replaces that person's pending
// suggestion.
L.giftMin = 5000;
L.addLink({
  id: "coffers-standings", src: "coffers", dst: "standings", issue: 53,
  desc: "A small friendly dealing to review with whoever gives you 5,000 gold or more (party skipped, via huntstats)",
  update: function () {
    var co = client.loom.coffers, st = client.loom.standings, hs = client.loom.huntstats;
    if (!co || !co.look || !co.look.gifts || !st || !st.entry) return;
    var gifts = co.look.gifts(L.giftSeen || 0);
    if (!gifts.length) return;
    L.giftSeen = gifts[gifts.length - 1].t;
    var party = (hs && hs.look && hs.look.party) ? hs.look.party() : [];
    var inParty = {};
    for (var p = 0; p < party.length; p++) inParty[String(party[p]).toLowerCase()] = true;
    var fmt = function (n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ","); };
    for (var i = 0; i < gifts.length; i++) {
      var g = gifts[i];
      if (g.amount < L.giftMin || inParty[g.who.toLowerCase()]) continue;
      st.entry.suggest({ who: g.who, step: 1, why: "gave you " + fmt(g.amount) + " gold", source: "coffers" });
    }
  }
});

// #242 room -> social, comms (Ricardo): a green leaf on newbies, players
// whose full name carries Uaithne, Ithin or Tuqad. Here reads the title
// live (room's own); Online and Comms see no titles, so they ask for the
// title someone was last seen with in a room (remembered by room).
function roomNewbie(n) { var r = client.loom.room; return (r && r.look && r.look.newbie) ? r.look.newbie(n) : undefined; }
L.addLink({
  id: "room-social", src: "room", dst: "social", issue: 242,
  desc: "A green leaf in the Online tab on people last seen with a newbie title",
  answers: { "person.newbie": roomNewbie }
});
L.addLink({
  id: "room-comms", src: "room", dst: "comms", issue: 242,
  desc: "A green leaf on newbies' names in the Comms tab",
  answers: { "person.newbie": roomNewbie }
});

// #122 social -> basher: an enemy arriving during a run makes the fight in
// progress the last one (Ricardo: it finishes, nothing new starts; you can
// always move by hand). The basher asks about each arrival.
L.addLink({
  id: "social-basher", src: "social", dst: "basher", issue: 122,
  desc: "An enemy arriving ends the basher's run after the current fight",
  answers: {
    // The enemies list itself, not look.group (that gives only the first
    // group in priority order, so family would hide an enemy).
    "person.enemy": function (n) { var s = client.loom.social; var k = String(n || "").trim().toLowerCase(); return s && s.lists && s.lists.enemies && s.lists.enemies[k] ? true : undefined; }
  }
});

// #163 basher -> room: Here shows the basher's kill order (Ricardo: as
// visual as possible what happens next): each mob's place in the queue, the
// next one, ignored types dimmed, the basher's state in the header. Answers
// room's question room.queue (arg { area }); the basher notifies loom when
// its queue or state changes, so Here redraws as mobs come and go.
L.addLink({
  id: "basher-room", src: "basher", dst: "room", issue: 163,
  desc: "Here shows the basher's kill order and state",
  answers: {
    "room.queue": function () { var b = client.loom.basher; return b && b.look && b.look.queue ? b.look.queue() : undefined; }
  }
});

// #299 magi -> room (crystalism's until magi 0.1.0; Ricardo): the oysters
// that drop pearls and the pearls themselves stand out in Here, always, as a
// green name with a green pearl icon. Pearls answer item.flags like shrines
// and monoliths; oysters answer mob.flags, the same shape for the mobs list.
// Corpses don't count, and your target's glow still wins.
L.addLink({
  id: "magi-room", src: "magi", dst: "room", issue: 299,
  desc: "Pearl-dropping oysters and pearls shown green in Here",
  answers: {
    "item.flags": function (name) {
      var c = client.loom.magi;
      return (c && c.look && c.look.pearl && c.look.pearl(name)) ? { label: "pearl", tone: "good", icon: "\u25c9", title: "a pearl: refine it into crystals (magi)" } : undefined;
    },
    "mob.flags": function (name) {
      var c = client.loom.magi;
      return (c && c.look && c.look.pearlMob && c.look.pearlMob(name)) ? { label: "pearls", tone: "good", icon: "\u25c9", title: "drops pearls (magi)" } : undefined;
    }
  }
});

// #256 partycomms -> room (Ricardo): each mob row in Here names the party
// members whose latest report (under 30 s old) targets it, so you see who's
// on what. Answers mob.party (arg: the mob's id) -> [names], you left out.
L.addLink({
  id: "partycomms-room", src: "partycomms", dst: "room", issue: 256,
  desc: "Party members' targets shown on the mobs in Here",
  answers: {
    "mob.party": function (id) {
      var p = client.loom.partycomms;
      var a = (p && p.look && p.look.targeting) ? p.look.targeting(id) : [];
      return a.length ? a : undefined;
    }
  }
});

// Loyals (Ricardo) room -> basher: room probes each new mob once and learns
// whose loyal it is ("He is loyal to Falau."). The basher never queues or
// auto-targets someone's loyal, even when its name is active in the area.
// Answers mob.loyal (arg: the mob's id) -> the owner, or undefined.
L.addLink({
  id: "room-basher", src: "room", dst: "basher",
  desc: "The basher skips mobs that are someone's loyal (found by Here's probe)",
  answers: {
    "mob.loyal": function (id) {
      var r = client.loom.room;
      var o = (r && r.look && r.look.loyal) ? r.look.loyal(id) : undefined;
      return o ? o : undefined;
    }
  }
});
