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

// Register an integration. e = { id, src, dst, desc, issue, change, answers }:
// src and dst are package names as in client.loom.registry; change, if
// given, is called with true/false when the player switches the link on or
// off, so the integration can withdraw what it created (the destination is
// redrawn either way). answers, for display integrations, maps a question
// name to a function answering it from the source's `look`, e.g.
//   answers: { "person.colour": function (name) { return client.loom.social.look.colour(name); } }
L.addLink = function (e) {
  if (!e || !e.id) return;
  var id = String(e.id).toLowerCase();
  if (!L.links[id]) L.linkOrder.push(id);
  L.links[id] = { id: id, src: e.src, dst: e.dst, desc: e.desc || "", issue: e.issue || 0, change: e.change, answers: e.answers || {} };
};

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
    if (e.src === src && !seen[e.dst] && L.linkOn(e.id)) { seen[e.dst] = true; L.redraw(e.dst); }
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
// flagged in the Here tab's items. item.flags answers { label, tone }: the
// tab owns the look ("bad" = alert, "good" = reassuring); neutral gods'
// shrines get no flag. Sigils (#165) will answer the same question.
L.addLink({
  id: "patrolling-room", src: "patrolling", dst: "room", issue: 164,
  desc: "Friendly and hostile gods' shrines and totems flagged in Here",
  answers: {
    "item.flags": function (name) {
      var p = client.loom.patrolling;
      var it = p && p.look ? p.look.item(name) : undefined;
      if (!it || it.stance === "neutral") return undefined;
      return { label: it.stance + " " + it.kind, tone: it.stance === "hostile" ? "bad" : "good", title: (it.god ? it.god.charAt(0).toUpperCase() + it.god.slice(1) + ": " : "") + it.stance };
    }
  }
});
