// atlas_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Atlas (#451): a map of our own, drawn from the
// community-maintained Achaea crowdmap (the map Mudlet's IRE mapper uses),
// with the game's own record of the rooms you've explored as fog of war.
//
// Where things come from:
//   - the map: https://ire-mudlet-mapping.github.io/AchaeaCrowdmap/Map/
//     (mapExport.json, colors.json, version.txt). Downloaded only, never
//     sent anything; kept in this browser's IndexedDB and downloaded again
//     only when version.txt changes (or ATLAS RELOAD).
//   - where you are: GMCP Room.Info (num; coords "areaid,x,y,z").
//   - what you've explored: Room.Info's `explored`, the ids of every room
//     you've explored in an area, sent when you enter the area; Nexus keeps
//     the same lists in GMCP.Explored, read once at load for the areas
//     entered before Atlas was.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.atlas) client.loom.atlas = {};
client.loom.registry.atlas = { version: "0.16.0", keyword: "ATLAS", desc: "{{description}}",
  redraw: function () { run_function("atlas_render", { full: true }, "atlas"); run_function("atlas_areas_render", [], "atlas"); } };
var AT = client.loom.atlas;

AT.base = "https://ire-mudlet-mapping.github.io/AchaeaCrowdmap/Map/";
// Saved (per character, as every Nexus variable):
//   atlas_fog = "off" while fog of war is off (absent: on);
//   atlas_walk = "custom" while clicks walk Atlas's own route (absent: the
//     game's PATH FIND; opt in while the pathfinder is new, Ricardo);
//   atlas_exits = "off" while routes leave the crowdmap's other special exits out (absent: used);
//   atlas_veil = "off" while routes leave PIERCE THE VEIL out (absent: used in dragonform);
//   atlas_worms = "on" while Atlas's routes take wormholes (absent: left out);
//   atlas_wild = "off" while the wilderness map stays in the main window
//     (absent: Atlas shows it);
//   atlas_wild_style = "text" for the game's letters as sent (absent: tiles);
//   atlas_counts = { area: rooms explored there that are on the map },
//     updated whenever the game sends an area's list or you explore a room;
//   atlas_tags = { area: [tag, …] }, your own groups for the Areas tab;
//   atlas_hidden = [area, …], areas kept out of the Areas tab and totals;
//   atlas_folded = { group key: true|false }, Areas tab folding (absent:
//     open, except "unvisited", "uncounted" and "hidden", folded);
//   atlas_uncounted = [area, …], areas you walked into whose room
//     information came without an explored list: the game keeps no record of
//     exploring them (inns and the like), so they stay out of the totals.
// A variable that isn't readable starts afresh (#135).
AT.fog = get_variable("atlas_fog") !== "off";
AT.ownWalk = get_variable("atlas_walk") === "custom" || get_variable("atlas_walk") === "atlas";   // "atlas": test builds before the rename
AT.wildOn = get_variable("atlas_wild") !== "off";
AT.wildStyle = get_variable("atlas_wild_style") === "text" ? "text" : "tiles";
AT.readJson = function (name) {
  var v = get_variable(name);
  if (typeof v == "string") { try { v = JSON.parse(v); } catch (e) { v = null; } }
  return v;
};
AT.counts = {};
var atC = AT.readJson("atlas_counts");
if (atC && typeof atC == "object" && !Array.isArray(atC)) for (var atK in atC) if (atC.hasOwnProperty(atK) && atNum(atK) > 0 && atNum(atC[atK]) >= 0) AT.counts[atNum(atK)] = atNum(atC[atK]);
AT.tags = {};
var atT = AT.readJson("atlas_tags");
if (atT && typeof atT == "object" && !Array.isArray(atT)) for (var atA in atT) {
  if (!atT.hasOwnProperty(atA) || !(atNum(atA) > 0) || !Array.isArray(atT[atA])) continue;
  var atL = [];
  for (var atI = 0; atI < atT[atA].length; atI++) { var atW = String(atT[atA][atI] || "").toLowerCase(); if (/^[a-z0-9][a-z0-9_-]*$/.test(atW) && atL.indexOf(atW) < 0) atL.push(atW); }
  if (atL.length) AT.tags[atNum(atA)] = atL;
}
AT.hidden = {};
var atH = AT.readJson("atlas_hidden");
if (Array.isArray(atH)) for (var atJ = 0; atJ < atH.length; atJ++) if (atNum(atH[atJ]) > 0) AT.hidden[atNum(atH[atJ])] = true;
// Your own marks on rooms (Ricardo): one icon from the list below per room,
// with an optional note, in the room's bottom left corner. Saved per
// character: atlas_marks = { room: [icon, note] }.
// The icons: key -> [label, parts], drawn in a 16x16 box; a part is
// [kind, path]: "f" filled black, "s" a black stroke, "w" filled white.
AT.icons = {
  fishing: ["fishing spot", [["f", "M1.5 8 Q6.5 2.5 11.5 8 Q6.5 13.5 1.5 8 Z M11 8 L15 4.5 V11.5 Z"], ["w", "M4.2 7.3 a0.9 0.9 0 1 0 0.01 0 Z"]]],
  shrine: ["shrine", [["f", "M2.5 6 L8 2 L13.5 6 Z M3.5 7h9v1.2h-9z M4.6 9h1.8v4H4.6z M9.6 9h1.8v4H9.6z M2.8 13.6h10.4v1.6H2.8z"]]],
  sleep: ["a place to sleep", [["f", "M10.5 2 A6.2 6.2 0 1 0 14.2 11.3 A5 5 0 1 1 10.5 2 Z"]]],
  bank: ["bank", [["f", "M2.5 11.5h11v2.6h-11z M3.5 7.8h9v2.6h-9z M4.8 4.1h6.4v2.6H4.8z"]]],
  shop: ["shop", [["f", "M2.5 7.6h11V14h-11z M2 5h12v2.2H2z"], ["w", "M7.3 5h1.4v9H7.3z"], ["s", "M8 4.8 C6.2 1.2 3.4 2.8 5.6 4.8 M8 4.8 C9.8 1.2 12.6 2.8 10.4 4.8"]]],
  craft: ["crafting", [["f", "M2.5 3.5h8.5v3.5H2.5z M5.6 7h2.4v7.5H5.6z M11 4.3h2.5v1.9H11z"]]],
  harvest: ["harvesting", [["f", "M2.5 13.5 Q2.5 2.5 13.5 2.5 Q13.5 13.5 2.5 13.5 Z"], ["w", "M3.6 13.2 L11.5 5.3 L12.1 5.9 L4.2 13.8 Z"]]],
  hunt: ["hunting", [["f", "M11.6 1.8 H14.2 V4.4 L6.6 12 L4 9.4 Z"], ["s", "M2.6 9.6 L6.4 13.4 M2.2 13.8 L4.4 11.6"]]],
  danger: ["danger", [["f", "M8 1.8 L14.8 14 H1.2 Z"], ["w", "M7.2 5.8h1.6v4.6H7.2z M7.2 11.4h1.6v1.6H7.2z"]]],
  star: ["favourite", [["f", "M8 1.2 L10.1 5.8 L15 6.2 L11.2 9.4 L12.4 14.4 L8 11.7 L3.6 14.4 L4.8 9.4 L1 6.2 L5.9 5.8 Z"]]],
  secret: ["secret", [["s", "M5 5.2 a2.8 2.8 0 1 0 0.01 0 Z M7.8 8 H14.5 M12.3 8 V10.8 M14.5 8 V10.4"]]]
};
// Other words that pick an icon: what a player might type.
AT.iconAlias = { fish: "fishing", fishing: "fishing", temple: "shrine", altar: "shrine", inn: "sleep", bed: "sleep", rest: "sleep", gold: "bank", money: "bank",
  store: "shop", buy: "shop", forge: "craft", crafting: "craft", plants: "harvest", herbs: "harvest", gather: "harvest", hunting: "hunt", bash: "hunt",
  warning: "danger", skull: "danger", fav: "star", favourite: "star", favorite: "star", hidden: "secret", key: "secret" };
// The crowdmap's room features (#468), shown in the bottom right corner of
// their room, in the order of this list when a room has several (all of
// them on hover). Same 16x16 drawing as the icons above.
AT.CACHE_F = 4;        // 3: rooms carry doors (index 10) for walking; 4: saved untouched by the game's files
AT.features = {
  bank: ["bank", AT.icons.bank[1]],
  postoffice: ["post office", [["f", "M1.8 4h12.4v8.5H1.8z"], ["w", "M2.6 4.8 L8 9 L13.4 4.8 V5.9 L8 10.1 L2.6 5.9 Z"]]],
  news: ["news room", [["f", "M2.5 3h9.5v10.5H2.5z M12 6h1.8v6.3a0.9 0.9 0 0 1 -1.8 0z"], ["w", "M4 5h6.5v2H4z M4 8.5h6.5v1H4z M4 10.7h6.5v1H4z"]]],
  commodityshop: ["commodities market", [["f", "M2.2 4.5h11.6v9.5H2.2z"], ["w", "M3.3 5.6h9.4v1.1H3.3z M3.3 11.8h9.4v1.1H3.3z M7.4 6.7h1.2v5.1H7.4z"]]],
  locksmith: ["locksmith", AT.icons.secret[1]],
  shop: ["shop", AT.icons.shop[1]],
  harbour: ["harbour", [["f", "M6.5 3 a1.5 1.5 0 1 0 3 0 a1.5 1.5 0 1 0 -3 0 Z"], ["s", "M8 4.5 V13.6 M5 7 H11 M2.8 9.6 Q3.4 13.6 8 13.6 Q12.6 13.6 13.2 9.6"]]],
  ferry: ["ferry", [["f", "M1.5 9.5h13l-2.2 3.8H3.7Z M7.4 2.5h1.2v6.5H7.4Z M8.6 3 L12.5 8.4 H8.6Z"]]],
  wilderness: ["way into the wilderness", [["f", "M8 1.5 L12.5 7.5 H10 L13.5 12 H9 V14.5 H7 V12 H2.5 L6 7.5 H3.5 Z"]]],
  subdivision: ["way into a subdivision", [["f", "M8 1.5 L9.6 6.4 L14.5 8 L9.6 9.6 L8 14.5 L6.4 9.6 L1.5 8 L6.4 6.4 Z"]]],
  arena: ["arena", [["s", "M3 3 L13 13 M13 3 L3 13 M2.2 10.6 L5.4 13.8 M10.6 13.8 L13.8 10.6"]]],
  stronghold: ["stronghold", [["f", "M3.5 2h2v1.8H7V2h2v1.8h1.5V2h2v4.5L11 8v6H5V8L3.5 6.5Z"], ["w", "M7 10.5h2V14H7z"]]],
  grate: ["grate", [["f", "M2 2h12v12H2z"], ["w", "M4 3.5h1.4v9H4z M7.3 3.5h1.4v9H7.3z M10.6 3.5h1.4v9h-1.4z"]]]
};
AT.iconOf = function (w) { w = String(w || "").toLowerCase(); return AT.icons[w] ? w : (AT.iconAlias[w] || ""); };
AT.marks = {};
var atMk = AT.readJson("atlas_marks");
if (atMk && typeof atMk == "object" && !Array.isArray(atMk)) for (var atMi in atMk) {
  if (!atMk.hasOwnProperty(atMi) || !(atNum(atMi) > 0) || !Array.isArray(atMk[atMi]) || !AT.icons[atMk[atMi][0]]) continue;
  AT.marks[atNum(atMi)] = [atMk[atMi][0], String(atMk[atMi][1] || "").slice(0, 120)];
}
AT.saveMarks = function () {
  var any = false;
  for (var a in AT.marks) if (AT.marks.hasOwnProperty(a)) { any = true; break; }
  if (any) set_variable("atlas_marks", JSON.stringify(AT.marks)); else delete_variable("atlas_marks");
  if (client.loom.notify) client.loom.notify("atlas");
  run_function("atlas_render", { full: true }, "atlas");
};
AT.mark = function (id, icon, note) {
  AT.marks[id] = [icon, String(note || "").slice(0, 120)];
  AT.saveMarks();
  var R = AT.room(id);
  display_notice("[atlas] " + (R && R.n ? R.n + " " : "") + "(" + id + ") marked " + AT.icons[icon][0] + (note ? ": " + note : "") + ".", "lime");
};
AT.unmark = function (id) {
  var R = AT.room(id), label = (R && R.n ? R.n + " " : "") + "(" + id + ")";
  if (!AT.marks[id]) { display_notice("[atlas] " + label + " has no mark.", "orange"); return; }
  delete AT.marks[id];
  AT.saveMarks();
  display_notice("[atlas] " + label + ": mark removed.", "lime");
};
AT.uncounted = {};
var atU = AT.readJson("atlas_uncounted");
if (Array.isArray(atU)) for (var atV = 0; atV < atU.length; atV++) if (atNum(atU[atV]) > 0) AT.uncounted[atNum(atU[atV])] = true;
AT.saveUncounted = function () {
  var out = [];
  for (var a in AT.uncounted) if (AT.uncounted.hasOwnProperty(a)) out.push(atNum(a));
  if (out.length) set_variable("atlas_uncounted", JSON.stringify(out)); else delete_variable("atlas_uncounted");
};
AT.folded = {};
var atF = AT.readJson("atlas_folded");
if (atF && typeof atF == "object" && !Array.isArray(atF)) for (var atG in atF) if (atF.hasOwnProperty(atG) && typeof atF[atG] == "boolean") AT.folded[atG] = atF[atG];
// Kept across a rerun of setup (a reimport): the map in memory, where you
// are, the explored lists, the view.
if (AT.map === undefined) AT.map = null;
if (!AT.state) AT.state = "idle";          // idle | loading | ready | failed
if (AT.note === undefined) AT.note = "";
if (AT.here === undefined) AT.here = null;
// Explored lists as the game sends them, keyed by the GAME's area number
// (Room.Info's coords). The crowdmap groups rooms into its own areas, which
// don't always match the game's (Pash Valley (East) holds rooms the game
// files elsewhere, Ricardo), so lists are merged into AT.exAll (every room
// explored, from any list) and a crowdmap area is "known" (AT.known) once a
// list has covered any of its rooms.
if (!AT.explored || typeof AT.explored != "object") AT.explored = {};
if (!AT.exAll || typeof AT.exAll != "object") AT.exAll = {};
if (!AT.known || typeof AT.known != "object") AT.known = {};
if (!AT.view || typeof AT.view != "object") AT.view = { area: null, z: 0, cx: 0, cy: 0, span: 18 };
AT.spanMin = 6;
AT.spanMax = 160;

function atNum(v) { var n = parseInt(v, 10); return isFinite(n) ? n : 0; }
function atFloat(v) { var n = Number(v); return isFinite(n) ? n : 0; }

// ---- The map ---------------------------------------------------------
// In memory and in the cache, the crowdmap is kept compact:
//   { v: version, at: ms, areas: { id: name },
//     rooms: { id: [area, x, y, z, name, env, exits, specials, fromGame, features] },
//     (fromGame 1: a room the game's own map added, see "The game's own map";
//     features: the crowdmap's feature tags, e.g. ["bank"], or 0)
//     f: AT.CACHE_F, the shape of this cache (an older shape is downloaded again)
//     env: { envId: [r, g, b] } }
// exits = { direction: room id }; specials = { command: room id } or 0.
// Everything from the download is treated as data and checked as it's
// copied: ids are positive whole numbers, names are strings, capped.
AT.compact = function (src, colors, v) {
  if (!Array.isArray(src)) return null;
  var out = { v: String(v || ""), f: AT.CACHE_F, at: Date.now(), areas: {}, rooms: {}, env: {}, n: 0 };
  for (var i = 0; i < src.length; i++) {
    var A = src[i];
    if (!A || typeof A != "object") continue;
    var aid = atNum(A.areaId);
    if (!(aid > 0)) continue;
    out.areas[aid] = String(A.areaName || ("area " + aid)).slice(0, 80);
    var rs = Array.isArray(A.rooms) ? A.rooms : [];
    for (var j = 0; j < rs.length; j++) {
      var r = rs[j];
      if (!r || typeof r != "object") continue;
      var id = atNum(r.id);
      if (!(id > 0)) continue;
      var ex = {}, sp = 0, d, t;
      if (r.exits && typeof r.exits == "object") for (d in r.exits) {
        if (!r.exits.hasOwnProperty(d)) continue;
        t = atNum(r.exits[d]);
        if (t > 0 && /^[a-z]{1,10}$/.test(d)) ex[d] = t;
      }
      if (r.specialExits && typeof r.specialExits == "object") for (d in r.specialExits) {
        if (!r.specialExits.hasOwnProperty(d)) continue;
        t = atNum(r.specialExits[d]);
        if (t > 0) { if (!sp) sp = {}; sp[String(d).slice(0, 60)] = t; }
      }
      // Features the mappers tagged (userData "feature-bank": "true"), only
      // the kinds Atlas has a picture for (#468).
      var ft = 0;
      if (r.userData && typeof r.userData == "object") for (d in r.userData) {
        if (!r.userData.hasOwnProperty(d) || String(r.userData[d]) !== "true" || d.indexOf("feature-") !== 0) continue;
        var fk = d.slice(8);
        if (AT.features[fk]) { if (!ft) ft = []; ft.push(fk); }
      }
      // Doors the mappers marked closed (2) or locked (3), by long direction:
      // a walk opens a closed one and goes around a locked one.
      var dr = 0;
      if (r.doors && typeof r.doors == "object") for (d in r.doors) {
        if (!r.doors.hasOwnProperty(d)) continue;
        var ds = atNum(r.doors[d]), dl = AT.LONG[String(d).toLowerCase()] || String(d).toLowerCase();
        if ((ds === 2 || ds === 3) && /^[a-z]{1,10}$/.test(dl)) { if (!dr) dr = {}; dr[dl] = ds; }
      }
      out.rooms[id] = [aid, atFloat(r.x), atFloat(r.y), atFloat(r.z), String(r.name || "").slice(0, 120), atNum(r.env), ex, sp, 0, ft, dr];
      out.n++;
    }
  }
  if (Array.isArray(colors)) for (var k = 0; k < colors.length; k++) {
    var c = colors[k];
    if (!c || !Array.isArray(c.colors) || c.colors.length < 3) continue;
    var e = atNum(c.envId);
    out.env[e] = [0, 1, 2].map(function (q) { var x = atNum(c.colors[q]); return x < 0 ? 0 : (x > 255 ? 255 : x); });
  }
  return out.n ? out : null;
};

// A room by number: { id, a, x, y, z, n, e, ex, sp } or null.
AT.room = function (id) {
  var R = AT.map && AT.map.rooms[id];
  if (!R) return null;
  return { id: atNum(id), a: R[0], x: R[1], y: R[2], z: R[3], n: R[4], e: R[5], ex: R[6] || {}, sp: R[7] || {}, ft: R[9] || null };
};
// The room numbers of an area, built once per map.
AT.areaRooms = function (aid) {
  if (!AT.map) return [];
  if (!AT.map.byArea) {
    var by = {};
    for (var id in AT.map.rooms) {
      if (!AT.map.rooms.hasOwnProperty(id)) continue;
      var a = AT.map.rooms[id][0];
      (by[a] || (by[a] = [])).push(atNum(id));
    }
    AT.map.byArea = by;
  }
  return AT.map.byArea[aid] || [];
};
AT.areaName = function (aid) { return (AT.map && AT.map.areas[aid]) || (AT.here && AT.here.area === aid && AT.here.areaName) || ("area " + aid); };

// ---- Loading ---------------------------------------------------------
AT.fetchText = function (url) {
  return fetch(url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); });
};
AT.fetchJson = function (url) {
  return fetch(url, { cache: "no-cache" }).then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); });
};
// The cache: one IndexedDB database of this page's (play.achaea.com's),
// shared by every character on this browser (the map is the same for all).
// Any failure reads as "no cache": the map is then downloaded.
AT.idb = function (mode, key, value) {
  return new Promise(function (resolve) {
    var done = false;
    function end(v) { if (!done) { done = true; resolve(v); } }
    try {
      if (typeof indexedDB == "undefined" || !indexedDB) return end(null);
      setTimeout(function () { end(null); }, 8000);
      var req = indexedDB.open("loom-atlas", 1);
      req.onupgradeneeded = function () { try { req.result.createObjectStore("kv"); } catch (e) {} };
      req.onerror = function () { end(null); };
      req.onsuccess = function () {
        try {
          var db = req.result, tx = db.transaction("kv", mode), st = tx.objectStore("kv");
          if (mode == "readonly") {
            var g = st.get(key);
            g.onsuccess = function () { var v = g.result; end(v && typeof v == "object" ? v : null); };
            g.onerror = function () { end(null); };
            tx.oncomplete = function () { try { db.close(); } catch (e) {} };
          } else {
            st.put(value, key);
            tx.oncomplete = function () { try { db.close(); } catch (e) {} end(true); };
            tx.onerror = function () { end(false); };
          }
        } catch (e) { end(null); }
      };
    } catch (e) { end(null); }
  });
};
AT.useMap = function (m, source) {
  m.byArea = null;
  // Rooms added from the official files (flag at index 8) can be in the
  // cached map, saved after they were laid over it: take them out and lay
  // the files again, so a placement rule fixed later fixes old caches too.
  for (var rid in m.rooms) if (m.rooms.hasOwnProperty(rid) && m.rooms[rid] && m.rooms[rid][8] === 1) delete m.rooms[rid];
  AT.map = m;
  for (var og in AT.official) if (AT.official.hasOwnProperty(og)) AT.officialApply(atNum(og));
  AT.source = source;
  AT.state = "ready";
  AT.note = "";
  if (AT.here) AT.placeView();
  AT.rebuildKnown();
  for (var a in AT.known) if (AT.known.hasOwnProperty(a)) AT.recount(atNum(a));
  if (client.loom.notify) client.loom.notify("atlas");
  run_function("atlas_render", { full: true }, "atlas");
  run_function("atlas_areas_render", [], "atlas");
};
// Load the map: from the cache when its version is the latest (or the
// latest can't be read), else downloaded. `force` downloads anyway.
AT.load = function (force) {
  if (AT.state == "loading") return;
  if (typeof fetch != "function") { AT.state = "failed"; AT.note = "this browser can't download"; return; }
  AT.state = "loading";
  AT.note = force ? "downloading the community map…" : "loading the community map…";
  var gen = AT.gen = (AT.gen || 0) + 1;
  run_function("atlas_render", { full: true }, "atlas");
  AT.idb("readonly", "crowdmap").then(function (cached) {
    if (cached && !(cached.rooms && cached.areas && typeof cached.rooms == "object")) cached = null;
    return AT.fetchText(AT.base + "version.txt").then(function (t) { return String(t).trim().slice(0, 20); }, function () { return null; }).then(function (v) {
      if (gen !== AT.gen) return;
      // A cache from before features (#468) is downloaded again once, unless
      // the community map can't be reached.
      if (cached && !force && (v === null || (v === cached.v && cached.f === AT.CACHE_F))) {
        AT.useMap(cached, v === null ? "cache (the community map couldn't be checked for updates)" : "cache");
        return;
      }
      if (v === null) throw new Error("the community map can't be reached");
      return Promise.all([AT.fetchJson(AT.base + "mapExport.json"), AT.fetchJson(AT.base + "colors.json").catch(function () { return null; })]).then(function (r) {
        if (gen !== AT.gen) return;
        var m = AT.compact(r[0], r[1], v);
        if (!m) throw new Error("the community map came in a shape Atlas doesn't know");
        // Saved before the game's files are laid over it (useMap changes the
        // map in place; a save still pending would keep their exits for good,
        // as an event's exit at New Thera stayed after the event, Ricardo).
        var was = cached ? cached.v : "";
        return AT.idb("readwrite", "crowdmap", m).then(function () {
        if (gen !== AT.gen) return;
        AT.useMap(m, "download");
        display_notice("[atlas] community map " + (was && was !== m.v ? "updated to version " + m.v + " (was " + was + ")" : "version " + m.v + " loaded") + ": " + m.n.toLocaleString("en-US") + " rooms in " + Object.keys(m.areas).length + " areas.", "lime");
        });
      });
    });
  }).catch(function (e) {
    if (gen !== AT.gen) return;
    AT.state = AT.map ? "ready" : "failed";
    AT.note = String((e && e.message) || e);
    display_notice("[atlas] couldn't load the community map: " + AT.note + ". ATLAS RELOAD to try again.", "orange");
    run_function("atlas_render", { full: true }, "atlas");
  });
};

// ---- Environments: the game's names and colours ------------------------------
// Each area's official map file (the one the stock map fetches when you
// enter an area, the same for everyone) ends with the environments used in
// it: <environment id="9" name="Hills" ... htmlcolor="#2d7720" />. Atlas
// reads it once per area per session and keeps what it learns in the
// browser (key "envs"): { id: { n: name, c: "#rrggbb" } }.
AT.envUrl = "https://www.achaea.com/maps/v2/";
if (!AT.envs || typeof AT.envs != "object") AT.envs = {};
if (!AT.envAsked) AT.envAsked = {};
AT.envRead = function (xml) {
  var re = /<environment\b([^>]*)>/gi, m, got = 0;
  while ((m = re.exec(String(xml))) !== null) {
    var at = m[1], id = /\bid="(\d+)"/.exec(at), n = /\bname="([^"]{1,60})"/.exec(at), c = /\bhtmlcolor="(#[0-9a-fA-F]{6})"/.exec(at);
    if (!id) continue;
    var e = { n: n ? n[1].replace(/&amp;/g, "&").replace(/&[a-z#0-9]+;/gi, "") : "", c: c ? c[1].toLowerCase() : "" };
    var was = AT.envs[id[1]];
    if (!was || was.n !== e.n || was.c !== e.c) { AT.envs[id[1]] = e; got++; }
  }
  return got;
};
AT.envFetch = function (aid) {
  if (!(aid > 0) || AT.envAsked[aid] || typeof fetch != "function") return;
  AT.envAsked[aid] = true;
  fetch(AT.envUrl + aid + ".xml").then(function (r) { if (!r.ok) throw new Error("HTTP " + r.status); return r.text(); }).then(function (t) {
    var envs = AT.envRead(t);
    if (envs) AT.idb("readwrite", "envs", AT.envs);
    var rooms = AT.officialRead(aid, t);
    if (rooms) {
      if (AT.map) AT.officialUndo(aid);
      AT.official[aid] = { at: Date.now(), rooms: rooms };
      AT.idb("readwrite", "official", AT.official);
    }
    var changed = rooms && AT.map ? AT.officialApply(aid) : false;
    if (envs || changed) {
      run_function("atlas_render", { full: true }, "atlas");
      if (changed) run_function("atlas_areas_render", [], "atlas");
    }
  }).catch(function () {});
};

// ---- The game's own map fills the crowdmap's gaps ------------------------------
// The same file lists every room of the game area, with coordinates and
// exits. It's always current but has no hidden exits or special paths; the
// crowdmap has those but can lag behind changes to the game (Delos: room
// 13927 missing, 14001 east leading past it, Ricardo). So, for each game area
// you enter:
//   - a room the crowdmap lacks is added, placed with the offset between the
//     two maps' coordinates for that area (rooms in both tell it);
//   - an exit the game lists replaces the crowdmap's in that direction (the
//     game's is the current one); exits only the crowdmap has are kept.
// Kept in the browser (key "official": { game area: { at, rooms } }) and laid
// over the map again at each load.
if (!AT.official || typeof AT.official != "object") AT.official = {};
// The game's exits per room (from the official files read so far): no hidden
// exits in them, so under fog they're safe to show (Ricardo: an explored
// room should show its exits even when they lead somewhere unexplored).
AT.offEx = {};
// rooms: { id: [x, y, z, name, env, exits] } from the file, checked as read.
AT.officialRead = function (gaid, xml) {
  var out = {}, n = 0, re = /<room\b([^>]*)>([\s\S]*?)<\/room>/gi, m;
  function attr(a, k) { var x = new RegExp("\\b" + k + "=\"([^\"]*)\"").exec(a); return x ? x[1] : ""; }
  function txt(v) { return String(v).replace(/&amp;/g, "&").replace(/&apos;|&#0*39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&[a-z#0-9]+;/gi, "").slice(0, 120); }
  while ((m = re.exec(String(xml))) !== null) {
    var id = atNum(attr(m[1], "id"));
    if (!(id > 0)) continue;
    var c = /<coord\b([^>]*)\/?>/i.exec(m[2]);
    if (!c) continue;
    var ex = {}, er = /<exit\b([^>]*)\/?>/gi, e;
    while ((e = er.exec(m[2])) !== null) {
      var d = attr(e[1], "direction").toLowerCase(), t = atNum(attr(e[1], "target"));
      if (t > 0 && /^[a-z]{1,10}$/.test(d)) ex[d] = t;
    }
    out[id] = [atFloat(attr(c[1], "x")), atFloat(attr(c[1], "y")), atFloat(attr(c[1], "z")), txt(attr(m[1], "title")), atNum(attr(m[1], "environment")), ex];
    n++;
  }
  return n ? out : null;
};
// The crowdmap area most of a file's known rooms are in (off from
// officialApply: { crowdmap area: { n } }), or 0 when it shares none.
AT.officialHome = function (off) {
  var home = 0, most = 0;
  for (var k in off) if (off.hasOwnProperty(k) && off[k].n > most) { most = off[k].n; home = atNum(k); }
  return home;
};
// Lay one game area's rooms over the map. True when anything changed.
AT.officialApply = function (gaid) {
  var O = AT.official[gaid], M = AT.map;
  if (!O || !O.rooms || !M) return false;
  var rooms = O.rooms, id, dx = [], dy = [], dz = [], added = 0, exits = 0;
  // The offset between the two maps, per crowdmap area, from rooms in both.
  var off = {};
  for (id in rooms) {
    if (!rooms.hasOwnProperty(id) || !M.rooms[id]) continue;
    var C = M.rooms[id], G = rooms[id], k = C[0];
    var o = off[k] || (off[k] = { x: [], y: [], z: [] });
    o.x.push(C[1] - G[0]); o.y.push(C[2] - G[1]); o.z.push(C[3] - G[2]);
  }
  function median(a) { if (!a.length) return 0; a = a.slice().sort(function (p, q) { return p - q; }); return a[Math.floor(a.length / 2)]; }
  for (var ka in off) if (off.hasOwnProperty(ka)) off[ka] = { x: median(off[ka].x), y: median(off[ka].y), z: median(off[ka].z), n: off[ka].x.length };
  for (id in rooms) {
    if (!rooms.hasOwnProperty(id)) continue;
    var G2 = rooms[id], C2 = M.rooms[id];
    AT.offEx[id] = G2[5];
    if (C2) {
      // Exits: the game's win in their direction. The crowdmap's own are kept
      // (index 11) so a newer file can be laid over them instead (officialUndo).
      if (!C2[11]) C2[11] = JSON.parse(JSON.stringify(C2[6] || {}));
      var ex = C2[6] || (C2[6] = {});
      for (var d in G2[5]) if (G2[5].hasOwnProperty(d) && ex[d] !== G2[5][d]) { ex[d] = G2[5][d]; exits++; }
      continue;
    }
    // A room the crowdmap lacks: in the crowdmap area of its neighbours
    // (the one most of them are in), else the crowdmap area sharing most
    // rooms with this file, else nowhere. Never the crowdmap area with the
    // game area's number: the two numberings differ (Lake Xulighae is game
    // area 172, crowdmap area 283; game area 283 is the Valley of Nidh, which
    // the crowdmap doesn't have, and it was drawn as a level under the lake).
    var votes = {}, best = 0, area = AT.officialHome(off);
    for (var d2 in G2[5]) if (G2[5].hasOwnProperty(d2)) { var N = M.rooms[G2[5][d2]]; if (N) votes[N[0]] = (votes[N[0]] || 0) + 1; }
    for (var va in votes) if (votes.hasOwnProperty(va) && votes[va] > best) { best = votes[va]; area = atNum(va); }
    if (!area) continue;
    var o2 = off[area] || { x: 0, y: 0, z: 0 };
    M.rooms[id] = [area, G2[0] + o2.x, G2[1] + o2.y, G2[2] + o2.z, G2[3], G2[4], JSON.parse(JSON.stringify(G2[5])), 0, 1];
    added++;
  }
  if (added || exits) {
    M.byArea = null;
    M.patched = M.patched || {};
    M.patched[gaid] = { rooms: added, exits: exits };
    if (added) AT.rebuildKnown();
  }
  return !!(added || exits);
};
// Take one game area's file back off the map: its exits back to the
// crowdmap's, its added rooms gone. Before a newer file of it is laid on
// (exits that are gone from the game go from the map too).
AT.officialUndo = function (gaid) {
  var O = AT.official[gaid], M = AT.map;
  if (!O || !O.rooms || !M) return;
  for (var id in O.rooms) {
    if (!O.rooms.hasOwnProperty(id)) continue;
    var R = M.rooms[id];
    delete AT.offEx[id];
    if (!R) continue;
    if (R[8] === 1) delete M.rooms[id];
    else if (R[11]) { R[6] = JSON.parse(JSON.stringify(R[11])); delete R[11]; }
  }
  M.byArea = null;
};
AT.officialLoad = function () {
  AT.idb("readonly", "official").then(function (v) {
    if (!v || typeof v != "object") return;
    var any = false;
    for (var g in v) {
      if (!v.hasOwnProperty(g) || !(atNum(g) > 0) || !v[g] || typeof v[g].rooms != "object" || AT.official[g]) continue;
      AT.official[g] = { at: atNum(v[g].at), rooms: v[g].rooms };
      if (AT.map && AT.officialApply(atNum(g))) any = true;
    }
    if (any) { run_function("atlas_render", { full: true }, "atlas"); run_function("atlas_areas_render", [], "atlas"); }
  });
};
AT.envLoad = function () {
  AT.idb("readonly", "envs").then(function (v) {
    if (!v) return;
    var n = 0;
    for (var id in v) if (v.hasOwnProperty(id) && /^\d+$/.test(id) && v[id] && typeof v[id] == "object" && !AT.envs[id]) {
      AT.envs[id] = { n: String(v[id].n || "").slice(0, 60), c: /^#[0-9a-f]{6}$/.test(v[id].c) ? v[id].c : "" };
      n++;
    }
    if (n) run_function("atlas_render", { full: true }, "atlas");
  });
};

// ---- Where you are, what you've explored ------------------------------
// Explored lists Nexus already holds (areas entered before Atlas loaded).
AT.seedExplored = function () {
  try {
    var NC = (typeof nexusclient != "undefined" && nexusclient) ? nexusclient : client;
    var E = NC && NC._datahandler && NC._datahandler.GMCP && NC._datahandler.GMCP.Explored;
    if (!E || typeof E != "object") return;
    for (var a in E) {
      if (!E.hasOwnProperty(a) || !E[a] || typeof E[a] != "object" || !(atNum(a) > 0)) continue;
      var ids = [];
      for (var r in E[a]) if (E[a].hasOwnProperty(r) && atNum(r) > 0) ids.push(atNum(r));
      AT.addList(atNum(a), ids);
    }
  } catch (e) {}
};
// One game area's explored list: kept, merged, and the crowdmap areas it
// covers become known (a list arriving for one marked "no exploration
// record" takes the mark off).
AT.addList = function (gaid, ids) {
  var s = AT.explored[gaid] || (AT.explored[gaid] = {});
  for (var i = 0; i < ids.length; i++) { s[ids[i]] = true; AT.exAll[ids[i]] = true; }
  AT.markKnown(ids);
};
AT.markKnown = function (ids) {
  if (!AT.map) return;
  var gone = false;
  for (var i = 0; i < ids.length; i++) {
    var R = AT.map.rooms[ids[i]];
    if (!R || AT.known[R[0]]) continue;
    AT.known[R[0]] = true;
    if (AT.uncounted[R[0]]) { delete AT.uncounted[R[0]]; gone = true; }
  }
  if (gone) AT.saveUncounted();
};
// After the map loads: what the lists cover.
AT.rebuildKnown = function () {
  AT.known = {};
  AT.markKnown(Object.keys(AT.exAll).map(atNum));
};
// Room.Info: where you are; an area's explored list when it comes with it.
AT.roomInfo = function (g) {
  var id = atNum(g.num);
  // The wilderness (a Room.Info with `ohmap`, as nexMap tells it): millions
  // of rooms on no map; the game draws its own, which Atlas shows. Checked
  // before the room number: aboard a vessel the game sends num -2 (the ship
  // moves, so its rooms have no fixed place) with the ohmap of the water it
  // floats on, and the stock Map tab shows the wilderness there too (#466).
  if (g.ohmap !== undefined && g.ohmap !== null && String(g.ohmap) !== "") { AT.wildRoom(id, g); return; }
  if (!(id > 0)) return;
  if (AT.here && AT.here.wild) { AT.wildMap = null; AT.wildPrev = null; AT.wildUnder = null; }     // left the wilderness
  var co = String(g.coords || "").split(",");
  var aid = atNum(co[0]);
  var R = AT.room(id);
  if (R && R.a === AT.SKETCH) R = null;
  var gaid = aid > 0 ? aid : (R ? R.a : 0);      // the game's area: whose list this is
  if (R) aid = R.a;                             // the crowdmap's area: what's drawn
  // A room on no map, outside any mapped area (the Mnemosyne's ripples, an
  // instance; a brand-new place): sketched as you walk (#451, Ricardo).
  if (!R && AT.map && !(aid > 0 && AT.map.areas[aid] && AT.areaRooms(aid).length)) {
    AT.sketchStep(id, g);
    R = AT.room(id);
    aid = AT.SKETCH;
  } else if (AT.sketch) AT.sketchClear();
  var wasG = AT.hereGame || null;
  AT.hereGame = gaid || null;
  AT.here = { id: id, area: aid > 0 ? aid : null, name: String(g.name || "").replace(/\s*\((?:indoors|outdoors|road)\)\s*$/i, "").slice(0, 120),
    areaName: String(g.area || "").slice(0, 80), onMap: !!R && R.a !== AT.SKETCH, exits: {} };
  // The exits the game shows for this room: { destination: true }.
  // And by direction (long names), for walks: an exit the game doesn't list.
  AT.here.dirs = {};
  if (g.exits && typeof g.exits == "object") for (var ex in g.exits) if (g.exits.hasOwnProperty(ex) && atNum(g.exits[ex]) > 0) {
    AT.here.exits[atNum(g.exits[ex])] = true;
    AT.here.dirs[AT.LONG[String(ex).toLowerCase()] || String(ex).toLowerCase()] = true;
  }
  if (Array.isArray(g.explored) && gaid) {
    var ids = [];
    for (var i = 0; i < g.explored.length; i++) { var x = atNum(g.explored[i]); if (x > 0) ids.push(x); }
    AT.addList(gaid, ids);
  } else if (gaid && wasG && wasG !== gaid && !AT.explored[gaid] && AT.here.area && !AT.known[AT.here.area] && !AT.counts.hasOwnProperty(AT.here.area) && !AT.uncounted[AT.here.area]) {
    // Walked into a game area, and no explored list came with it, nor ever
    // has: the game keeps no record of exploring it.
    AT.uncounted[AT.here.area] = true;
    AT.saveUncounted();
    AT.areasHere = null;
  }
  // As Nexus does: the room you're in is explored (once its area's list is known).
  if (gaid && AT.explored[gaid]) AT.addList(gaid, [id]);
  // The official file is per game area: only asked for by the number the game
  // sent, never a crowdmap area's number standing in for it.
  if (atNum(co[0]) > 0) AT.envFetch(atNum(co[0]));
  AT.placeView();
  if (AT.walk) AT.walkArrive(id);
  run_function("atlas_render", {}, "atlas");
  // The Areas tab: when a count changed, or you crossed into another area.
  var counted = AT.here.area ? AT.recount(AT.here.area) : false;
  if (counted || AT.areasHere !== AT.here.area) { AT.areasHere = AT.here.area; run_function("atlas_areas_render", [], "atlas"); }
};

// ---- The wilderness: the game's own map ------------------------------
// Each step there, the game sends IRE.Display.Ohmap "start", the map as
// coloured text lines, then "stop". Nexus itself diverts those lines out of
// the main window only while its stock Map tab is the active one: its GMCP
// handler then returns {display: "ohmap", start}, and at the end calls
// datahandler.on_special_display("ohmap", lines), lines being
// [{line, parsed_line: {chunks: [{_fg, _bg} | {_txt}]}}] (Ricardo's probes,
// 2026-11-03). Atlas asks for the same diversion whether or not the Map tab
// is showing, and keeps the lines. ATLAS WILDERNESS OFF leaves Nexus alone
// (the map goes to the main window again, unless the Map tab is active).
// Both are wrappers on the datahandler, marked __loomAtlas, put back on
// uninstall and checked again at every Room.Info (LOOM PERF's sample
// restores handle_GMCP as it found it).
AT.dh = function () {
  try { var NC = (typeof nexusclient != "undefined" && nexusclient) ? nexusclient : client; return (NC && NC._datahandler) || null; } catch (e) { return null; }
};
AT.wildHook = function () {
  var D = AT.dh();
  if (!D || typeof D.handle_GMCP != "function" || typeof D.on_special_display != "function") return false;
  if (!D.handle_GMCP.__loomAtlas) {
    var hg = D.handle_GMCP;
    var w = function (method, a) {
      var r = hg.apply(this, arguments);
      if (method === "IRE.Display.Ohmap" && r === undefined) {
        var A = client.loom && client.loom.atlas;
        if (A && A.wildOn) {
          var v = a;
          if (typeof v == "string") { try { v = JSON.parse(v); } catch (e) { v = v.replace(/"/g, "").trim(); } }
          return { display: "ohmap", start: v === "start" };
        }
      }
      return r;
    };
    w.__loomAtlas = hg;
    D.handle_GMCP = w;
  }
  if (!D.on_special_display.__loomAtlas) {
    var sd = D.on_special_display;
    var w2 = function (kind, lines) {
      if (kind === "ohmap") { try { var A = client.loom && client.loom.atlas; if (A && A.wildLines) A.wildLines(lines); } catch (e) {} }
      return sd.apply(this, arguments);
    };
    w2.__loomAtlas = sd;
    D.on_special_display = w2;
  }
  return true;
};
AT.wildUnhook = function () {
  var D = AT.dh();
  if (!D) return;
  if (D.handle_GMCP && D.handle_GMCP.__loomAtlas) D.handle_GMCP = D.handle_GMCP.__loomAtlas;
  if (D.on_special_display && D.on_special_display.__loomAtlas) D.on_special_display = D.on_special_display.__loomAtlas;
};
AT.setWildStyle = function (st) {
  AT.wildStyle = st === "text" ? "text" : "tiles";
  if (AT.wildStyle === "text") set_variable("atlas_wild_style", "text"); else delete_variable("atlas_wild_style");
  run_function("atlas_render", { full: true }, "atlas");
};
AT.setWild = function (on) {
  AT.wildOn = !!on;
  if (AT.wildOn) delete_variable("atlas_wild"); else set_variable("atlas_wild", "off");
  run_function("atlas_render", { full: true }, "atlas");
};
// The map's lines as HTML: one row each, the game's colours kept.
AT.wildColour = function (c) { return typeof c == "string" && /^#[0-9a-fA-F]{3,8}$/.test(c) ? c : null; };
// Nexus hands the map's text over HTML-escaped: the game's "&" (a terrain
// in city subdivisions) arrives as "&amp;", five cells instead of one, and
// every row with one grew wider and slid sideways (Ricardo's subdivision
// dump, 2026-11-16). Back to the characters the game sent.
AT.wildEnt = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " };
AT.wildText = function (t) {
  return String(t).replace(/&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z]+);/g, function (m, e) {
    if (e.charAt(0) === "#") { var n = e.charAt(1) === "x" || e.charAt(1) === "X" ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10); return n > 0 && n < 65536 ? String.fromCharCode(n === 160 ? 32 : n) : m; }
    return Object.prototype.hasOwnProperty.call(AT.wildEnt, e.toLowerCase()) ? AT.wildEnt[e.toLowerCase()] : m;
  });
};
AT.wildLines = function (lines) {
  if (!Array.isArray(lines)) return;
  var esc = function (t) { return String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); };
  var rows = [], grid = [], cols = 0;
  for (var i = 0; i < lines.length && i < 80; i++) {
    var L = lines[i] || {}, ch = L.parsed_line && Array.isArray(L.parsed_line.chunks) ? L.parsed_line.chunks : null;
    var fg = null, bg = null, out = "", n = 0, cells = [];
    if (ch) {
      for (var k = 0; k < ch.length; k++) {
        var C = ch[k] || {};
        if (C._txt !== undefined) {
          var t = AT.wildText(C._txt).slice(0, 300);
          if (!t) continue;
          n += t.length;
          for (var q = 0; q < t.length; q++) cells.push([t.charAt(q), fg, bg]);
          out += (fg || bg) ? '<span style="' + (fg ? 'color:' + fg + ';' : '') + (bg ? 'background:' + bg + ';' : '') + '">' + esc(t) + '</span>' : esc(t);
          continue;
        }
        if (C._fg === "reset") { fg = null; bg = null; }
        else if (C._fg !== null && C._fg !== undefined) fg = AT.wildColour(C._fg);
        if (C._bg === "") bg = null;
        else if (C._bg !== null && C._bg !== undefined) bg = AT.wildColour(C._bg);
      }
    } else {
      var plain = String(L.line || "").replace(/\u001b\[[0-9;]*m/g, "").slice(0, 300);
      n = plain.length; out = esc(plain);
      for (var q2 = 0; q2 < plain.length; q2++) cells.push([plain.charAt(q2), null, null]);
    }
    if (n > cols) cols = n;
    rows.push(out);
    grid.push(cells);
  }
  // rows: the lines as coloured text; grid: [row][col] = [char, fg, bg]
  // for the tiles.
  AT.wildPrev = AT.wildMap;         // the map before this step: what's under you now
  AT.wildMap = { rows: rows, grid: grid, cols: cols, at: Date.now() };
  AT.wildStep();
  var wMe = AT.wildMe(grid);       // your mark isn't terrain
  for (var gy = 0; gy < grid.length; gy++) for (var gx = 0; gx < grid[gy].length; gx++) if (!(wMe && wMe.x === gx && wMe.y === gy)) AT.wildNote(grid[gy][gx]);
  run_function("atlas_render", { full: true }, "atlas");
};
// Room.Info in the wilderness: no sketch, no counts; the tab shows the
// game's map (it comes just before this Room.Info).
// Where you are on the map: your @ is white; other @s (purple in city
// subdivisions: other people) aren't you. Else (flying shows another mark) a
// white character that appears only once on the map (roads are white too,
// but many), nearest the middle. The map isn't always centred on you.
AT.wildMe = function (grid) {
  var h = grid.length, w = 0, cnt = {}, cand = [], at = [];
  for (var y = 0; y < h; y++) {
    if (grid[y].length > w) w = grid[y].length;
    for (var x = 0; x < grid[y].length; x++) {
      var c = grid[y][x];
      if (c[0] === "@") { at.push([x, y, /^#f{3}(?:f{3})?$/i.test(c[1] || "") ? 0 : 1]); continue; }
      if (c[0] !== " " && c[0] !== "?" && /^#f{3}(?:f{3})?$/i.test(c[1] || "")) { var k = c[0] + "|" + (c[2] || ""); cnt[k] = (cnt[k] || 0) + 1; cand.push([x, y, k]); }
    }
  }
  var best = 1e9, me = null;
  // The @s: a white one first, then the one nearest the middle.
  for (var j = 0; j < at.length; j++) {
    var dj = at[j][2] * 1e6 + Math.abs(at[j][0] - w / 2) + Math.abs(at[j][1] - h / 2);
    if (dj < best) { best = dj; me = { x: at[j][0], y: at[j][1] }; }
  }
  if (me) return me;
  for (var i = 0; i < cand.length; i++) {
    if (cnt[cand[i][2]] !== 1) continue;
    var d = Math.abs(cand[i][0] - w / 2) + Math.abs(cand[i][1] - h / 2);
    if (d < best) { best = d; me = { x: cand[i][0], y: cand[i][1] }; }
  }
  return me;
};
// The legend, learnt as you walk (the game publishes none): every character
// seen, with its colours; and, for the room you just left, the environment
// the game named for it: the room you left is drawn one step back from you
// on the new map (the step found by AT.wildShift). Kept for the session;
// ATLAS WILDERNESS LEGEND.
if (!AT.wildSeen) AT.wildSeen = {};
AT.wildKey = function (c) { return c[0] + "|" + (c[1] || "") + "|" + (c[2] || ""); };
AT.wildNote = function (c, env) {
  if (!c || c[0] === " " && !c[2]) return;
  var k = AT.wildKey(c), e = AT.wildSeen[k];
  if (!e) { if (Object.keys(AT.wildSeen).length >= 200) return; e = AT.wildSeen[k] = { c: c[0], fg: c[1] || "", bg: c[2] || "", n: 0, envs: {} }; }
  if (env) e.envs[env] = (e.envs[env] || 0) + 1; else e.n++;
};
// How the map moved between two views (A with your mark at a, B with it at
// b): the shift (sx, sy) where B's cells match A's best, B[y][x] = A[y+sy][x+sx],
// both marks left out. The game's map sometimes follows you and sometimes
// stays put while your mark moves across it, jumping when you near its edge
// (Ricardo's screenshots), so any shift up to most of the view is tried.
// null when too little lines up to tell.
AT.wildShift = function (A, a, B, b) {
  var best = null, bestR = 0, H = B.length, W = 0;
  for (var k = 0; k < H; k++) if (B[k].length > W) W = B[k].length;
  var mx = Math.min(16, Math.floor(W * 0.7)), my = Math.min(12, Math.floor(H * 0.7));
  for (var sy = -my; sy <= my; sy++) for (var sx = -mx; sx <= mx; sx++) {
    var same = 0, n = 0;
    for (var y = 0; y < H; y++) {
      var ar = A[y + sy];
      if (!ar) continue;
      for (var x = 0; x < B[y].length; x++) {
        if (x === b.x && y === b.y) continue;
        if (x + sx === a.x && y + sy === a.y) continue;
        var ac = ar[x + sx];
        if (!ac) continue;
        var bc = B[y][x];
        n++;
        if (ac[0] === bc[0] && ac[1] === bc[1] && ac[2] === bc[2]) same++;
      }
    }
    var r = n >= 40 ? same / n - (Math.abs(sx) + Math.abs(sy)) * 0.0005 : 0;   // a hair towards the smaller shift on ties
    if (r > bestR) { bestR = r; best = { sx: sx, sy: sy, r: r }; }
  }
  return best && bestR >= 0.7 ? best : null;
};
// A new map came: how you moved since the last one, and the ground under
// your mark (the last map showed it). Done here, tied to the map, because
// the map comes after the room's own information for the same step (it was
// read one step late before, Ricardo's dump).
AT.wildStep = function () {
  var WM = AT.wildMap, PV = AT.wildPrev, dbg;
  var me = AT.wildMe(WM.grid), pm = PV && PV.grid && Date.now() - PV.at < 60000 ? AT.wildMe(PV.grid) : null;
  var st = me && pm ? AT.wildShift(PV.grid, pm, WM.grid, me) : null;
  if (st) {
    var ox = me.x + st.sx, oy = me.y + st.sy;              // where you are now, on the last map
    if (ox === pm.x && oy === pm.y) {                      // didn't move (LOOK): same ground
      if (AT.wildUnder && AT.wildUnder.map === PV) AT.wildUnder = { map: WM, cell: AT.wildUnder.cell };
    } else {
      var under = PV.grid[oy] ? PV.grid[oy][ox] : null;
      AT.wildUnder = under ? { map: WM, cell: under } : null;   // a way out (?) too: it stays marked under you
    }
  } else AT.wildUnder = null;                              // a jump, or the first map: the ground beside you
  AT.wildDebug = { me: me, pm: pm, st: st, under: AT.wildUnder ? AT.wildUnder.cell : null, why: !pm ? "no map before" : (!st ? "maps don't line up" : "") };
  AT.wildPair();
  // The last few steps, for ATLAS WILDERNESS DUMP (bug reports).
  if (!AT.wildLog) AT.wildLog = [];
  var H = AT.here || {};
  AT.wildLog.push({ id: H.id || 0, name: H.name || "", env: H.env || "", room_at: H.at || 0, at: WM.at, map: WM.grid, debug: AT.wildDebug });
  if (AT.wildLog.length > 8) AT.wildLog.shift();
};
// The legend: the ground under you, named by the room's environment, once
// the map and the room information of the same step have both come (within
// a moment of each other, either order).
AT.wildPair = function () {
  var H = AT.here, WM = AT.wildMap, U = AT.wildUnder;
  if (!H || !H.wild || !H.env || !WM || WM.paired || !U || U.map !== WM || Math.abs((H.at || 0) - WM.at) > 800) return;
  WM.paired = true;
  AT.wildNote(U.cell, H.env);
};
AT.wildRoom = function (id, g) {
  if (AT.sketch) AT.sketchClear();
  AT.wildHook();
  var det = Array.isArray(g.details) ? g.details.map(function (d) { return String(d).slice(0, 30); }).slice(0, 6) : [];
  AT.here = { id: id, area: null, wild: true, name: String(g.name || "").slice(0, 120), env: String(g.environment || "").slice(0, 40),
    details: det, areaName: "", onMap: false, exits: {}, at: Date.now() };
  AT.wildPair();
  run_function("atlas_render", { full: true }, "atlas");
};

// ---- Places on no map: a sketch as you walk ------------------------------
// The Mnemosyne is an instance: each wade is your own, each ripple a fresh
// layout, and the game sends its rooms with no area, so no map has them. Its
// room information still gives the number, name and exits, so Atlas lays
// the rooms out as you walk: the first at 0,0, each next one a step from the
// last in the direction you took (found from either room's exits). Arriving
// in a room that no exit led to (the next ripple, a portal) starts afresh.
// The sketch lives in the map as area AT.SKETCH (-1), never saved, and goes
// when you step back onto the map. (The approach follows LEVI-Achaea's
// Dementia Mapper for Mudlet; no code taken.)
AT.SKETCH = -1;
if (AT.sketch === undefined) AT.sketch = null;
AT.LONG = { n: "north", s: "south", e: "east", w: "west", ne: "northeast", nw: "northwest", se: "southeast", sw: "southwest", u: "up", d: "down", "in": "in", out: "out" };
AT.OFF = { north: [0, 1, 0], south: [0, -1, 0], east: [1, 0, 0], west: [-1, 0, 0], northeast: [1, 1, 0], northwest: [-1, 1, 0], southeast: [1, -1, 0], southwest: [-1, -1, 0], up: [0, 0, 1], down: [0, 0, -1] };
AT.BACK = { north: "south", south: "north", east: "west", west: "east", northeast: "southwest", southwest: "northeast", northwest: "southeast", southeast: "northwest", up: "down", down: "up", "in": "out", out: "in" };
// The boon screen ends a ripple (the trigger "Atlas ripple end"): the next
// room starts a fresh sketch.
if (AT.rippleEnd === undefined) AT.rippleEnd = false;
AT.sketchClear = function () {
  if (!AT.sketch || !AT.map) { AT.sketch = null; return; }
  for (var id in AT.sketch.rooms) if (AT.sketch.rooms.hasOwnProperty(id) && AT.map.rooms[id] && AT.map.rooms[id][0] === AT.SKETCH) delete AT.map.rooms[id];
  AT.map.byArea = null;
  AT.sketch = null;
};
AT.sketchStep = function (id, g) {
  var ex = {};
  if (g.exits && typeof g.exits == "object") for (var k in g.exits) {
    if (!g.exits.hasOwnProperty(k)) continue;
    var d = AT.LONG[String(k).toLowerCase()] || (AT.BACK[String(k).toLowerCase()] ? String(k).toLowerCase() : "");
    var t = atNum(g.exits[k]);
    if (d && t > 0) ex[d] = t;
  }
  var name = String(g.name || "").replace(/\s*\((?:indoors|outdoors|road)\)\s*$/i, "").slice(0, 120);
  var S = AT.sketch, M = AT.map, R = M.rooms[id];
  var from = S && S.cur ? M.rooms[S.cur] : null, dir = "";
  if (from) {
    for (var a in from[6]) if (from[6].hasOwnProperty(a) && from[6][a] === id) { dir = a; break; }
    if (!dir) for (var b in ex) if (ex.hasOwnProperty(b) && ex[b] === S.cur && AT.BACK[b]) { dir = AT.BACK[b]; break; }
  }
  // A room sketched already: just here again (the same room, or a step from
  // the last). A new ripple can reuse room numbers in a new layout (Ricardo:
  // back in the first room, the next ripple drew over the last), so it starts
  // afresh when the ripple ended (the boon screen), when no exit led here,
  // or when the room has another name now.
  if (S && R && R[0] === AT.SKETCH && !AT.rippleEnd && (S.cur === id || dir) && !(name && R[4] && name !== R[4])) {
    R[4] = name || R[4]; R[6] = ex; S.cur = id; return;
  }
  if (AT.rippleEnd) { AT.rippleEnd = false; from = null; }
  if (!from || !dir || R) {                     // nothing led here, or a new ripple: a new sketch
    AT.sketchClear();
    S = AT.sketch = { rooms: {}, cur: 0, title: String(g.area || "").slice(0, 80), at: Date.now() };
    from = null;
  }
  var x = 0, y = 0, z = 0;
  if (from) {
    var o = AT.OFF[dir];
    if (o) { x = from[1] + o[0]; y = from[2] + o[1]; z = from[3] + o[2]; }
    else {
      // in/out: the nearest free spot beside the room it came from.
      var taken = {};
      for (var q in S.rooms) if (S.rooms.hasOwnProperty(q)) { var Q = M.rooms[q]; taken[Q[1] + "," + Q[2] + "," + Q[3]] = 1; }
      var tries = [[1, 0], [0, -1], [-1, 0], [0, 1], [1, -1], [-1, -1], [-1, 1], [1, 1]];
      x = from[1] + 1; y = from[2]; z = from[3];
      for (var t2 = 0; t2 < tries.length; t2++) if (!taken[(from[1] + tries[t2][0]) + "," + (from[2] + tries[t2][1]) + "," + from[3]]) { x = from[1] + tries[t2][0]; y = from[2] + tries[t2][1]; break; }
    }
  }
  M.rooms[id] = [AT.SKETCH, x, y, z, name, 0, ex, 0, 2];
  M.byArea = null;
  S.rooms[id] = true;
  S.cur = id;
};

// ---- Exploration per area (the Areas tab) -------------------------------
// The rooms you've explored in an area that are on the community map (so a
// percentage never passes 100%), from the game's list. Saved when it changes.
AT.countLive = function (aid) {
  if (!AT.map || !AT.known[aid]) return -1;
  var ids = AT.areaRooms(aid), n = 0;
  for (var i = 0; i < ids.length; i++) if (AT.exAll[ids[i]]) n++;
  return n;
};
// The live count can be partial: the game sends lists per game area, and a
// crowdmap area is known once any list covers one of its rooms, so a
// neighbour's list holding one Azdun Dungeon room counted 1 of 190 and saved
// it over the real count (Ricardo). Exploring is never undone in the game, so
// the saved count only ever rises.
AT.recount = function (aid) {
  var n = AT.countLive(aid);
  if (n < 0 || (AT.counts.hasOwnProperty(aid) && AT.counts[aid] >= n)) return false;
  AT.counts[aid] = n;
  set_variable("atlas_counts", JSON.stringify(AT.counts));
  return true;
};
// Explored in an area: the higher of the live and saved counts, never more
// than the rooms on the map; -1 unknown.
AT.count = function (aid) {
  var n = AT.countLive(aid);
  if (AT.counts.hasOwnProperty(aid) && AT.counts[aid] > n) n = AT.counts[aid];
  if (n < 0) return -1;
  var mapped = AT.map ? AT.areaRooms(aid).length : n;
  return n > mapped ? mapped : n;
};
// The game's word order: the crowdmap's "Delos, the Isle of" reads "the Isle of Delos".
AT.title = function (aid) {
  if (aid === AT.SKETCH) return (AT.sketch && AT.sketch.title) || "off the map";
  // One name per area, always the community map's (the game's name for the
  // area you're in made the same area read two ways, Ricardo).
  // "Delos, the Isle of (Scarlattan Theatre)" -> "the Isle of Delos (Scarlattan
  // Theatre)", "Gheladan, Mount" -> "Mount Gheladan"; a name that isn't one of
  // these ("Bataoac, the Northern Giant") stays as it is.
  var n = AT.areaName(aid), m = /^(.+?), ((?:the|mount)\b(?:.*?\bof)?)(\s*\([^)]*\))?$/i.exec(n);
  return m ? (m[2] + " " + m[1] + (m[3] || "")).replace(/\s+/g, " ").trim() : n;
};
// Sorting by name ignores a leading "the".
AT.sortKey = function (aid) { return AT.title(aid).toLowerCase().replace(/^the\s+/, ""); };
// An area named at the start of a command's text: "here", its number, or its
// name (the community map's or the game's, "the" optional, any case; the
// longest name that fits). Returns { aid, rest } or null.
AT.findArea = function (text) {
  var t = String(text || "").trim(), tl = t.toLowerCase().replace(/\s+/g, " ");
  var m = /^here(?:\s+(.*))?$/i.exec(t);
  if (m) return AT.here && AT.here.area ? { aid: AT.here.area, rest: (m[1] || "").trim() } : null;
  m = /^(\d+)(?:\s+(.*))?$/.exec(t);
  if (m && AT.map && AT.map.areas[atNum(m[1])]) return { aid: atNum(m[1]), rest: (m[2] || "").trim() };
  if (!AT.map) return null;
  var best = null, bestLen = 0;
  for (var a in AT.map.areas) {
    if (!AT.map.areas.hasOwnProperty(a)) continue;
    var names = [AT.map.areas[a].toLowerCase(), AT.title(atNum(a)).toLowerCase()];
    names.push(names[1].replace(/^the /, ""));
    for (var i = 0; i < names.length; i++) {
      var n = names[i].replace(/\s+/g, " ");
      if (n.length > bestLen && (tl === n || tl.indexOf(n + " ") === 0)) { best = atNum(a); bestLen = n.length; }
    }
  }
  return best ? { aid: best, rest: t.substring(bestLen).trim() } : null;
};
AT.saveTags = function () {
  var any = false;
  for (var a in AT.tags) if (AT.tags.hasOwnProperty(a)) { any = true; break; }
  if (any) set_variable("atlas_tags", JSON.stringify(AT.tags)); else delete_variable("atlas_tags");
  run_function("atlas_areas_render", [], "atlas");
};
AT.tag = function (aid, words) {
  var have = AT.tags[aid] || [], added = [], bad = [];
  for (var i = 0; i < words.length; i++) {
    var w = String(words[i] || "").toLowerCase();
    if (!/^[a-z0-9][a-z0-9_-]*$/.test(w)) { bad.push(words[i]); continue; }
    if (have.indexOf(w) < 0) { have.push(w); added.push(w); }
  }
  if (added.length) { AT.tags[aid] = have; AT.saveTags(); display_notice("[atlas] " + AT.title(aid) + " tagged " + added.join(", ") + ".", "lime"); }
  if (bad.length) display_notice("[atlas] not a tag: " + bad.join(", ") + " (one word each: letters, digits, - and _).", "orange");
  if (!added.length && !bad.length) display_notice("[atlas] " + AT.title(aid) + " has those tags already.", "cyan");
};
AT.untag = function (aid, words) {
  var have = AT.tags[aid] || [], gone = [];
  if (words.length === 1 && words[0].toLowerCase() === "all") { gone = have.slice(); have = []; }
  else for (var i = 0; i < words.length; i++) { var k = have.indexOf(String(words[i]).toLowerCase()); if (k >= 0) { gone.push(have[k]); have.splice(k, 1); } }
  if (!gone.length) { display_notice("[atlas] " + AT.title(aid) + " has no such tag" + (have.length ? " (its tags: " + have.join(", ") + ")" : "") + ".", "orange"); return; }
  if (have.length) AT.tags[aid] = have; else delete AT.tags[aid];
  AT.saveTags();
  display_notice("[atlas] " + AT.title(aid) + ": removed tag " + gone.join(", ") + ".", "lime");
};
AT.setHidden = function (aid, on) {
  if (on) AT.hidden[aid] = true; else delete AT.hidden[aid];
  var out = [];
  for (var a in AT.hidden) if (AT.hidden.hasOwnProperty(a)) out.push(atNum(a));
  if (out.length) set_variable("atlas_hidden", JSON.stringify(out)); else delete_variable("atlas_hidden");
  run_function("atlas_areas_render", [], "atlas");
};
// How the Areas tab orders areas within each group (Ricardo): "name",
// "pct" (least explored first), "pct-desc" (most first) or "left" (most
// rooms left to explore first). Saved as atlas_sort (absent: name).
AT.sorts = ["name", "pct", "pct-desc", "left"];
AT.sort = AT.sorts.indexOf(get_variable("atlas_sort")) > 0 ? get_variable("atlas_sort") : "name";
// The tab's % flips the direction when it's on already; useSort sets one as given.
AT.setSort = function (k) {
  if (k === "pct" && (AT.sort === "pct" || AT.sort === "pct-desc")) k = AT.sort === "pct" ? "pct-desc" : "pct";
  AT.useSort(k);
};
AT.useSort = function (k) {
  if (AT.sorts.indexOf(k) < 0) return;
  AT.sort = k;
  if (k === "name") delete_variable("atlas_sort"); else set_variable("atlas_sort", k);
  run_function("atlas_areas_render", [], "atlas");
};
AT.isFolded = function (key) {
  if (AT.folded.hasOwnProperty(key)) return AT.folded[key];
  return key === "unvisited" || key === "uncounted" || key === "hidden";
};
AT.fold = function (key) {
  AT.folded[key] = !AT.isFolded(key);
  set_variable("atlas_folded", JSON.stringify(AT.folded));
  run_function("atlas_areas_render", [], "atlas");
};
// Show a room in the Atlas tab (a party member's, #451): its area and level,
// centred on it. The next move brings the view back to you.
AT.showRoom = function (id) {
  var R = AT.room(id);
  if (!R) return;
  AT.view.area = R.a; AT.view.z = R.z; AT.view.cx = R.x; AT.view.cy = -R.y;
  run_function("atlas_render", { full: true }, "atlas");
};
// Show an area in the Atlas tab without going there: its level with most
// rooms, centred on them. The next move brings the view back to you.
AT.showArea = function (aid) {
  var ids = AT.areaRooms(aid);
  if (!ids.length) return;
  var byZ = {}, z = 0, most = -1;
  for (var i = 0; i < ids.length; i++) { var R = AT.map.rooms[ids[i]]; byZ[R[3]] = (byZ[R[3]] || 0) + 1; }
  for (var k in byZ) if (byZ.hasOwnProperty(k) && byZ[k] > most) { most = byZ[k]; z = Number(k); }
  var x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
  for (var j = 0; j < ids.length; j++) {
    var Q = AT.map.rooms[ids[j]];
    if (Q[3] !== z) continue;
    if (Q[1] < x0) x0 = Q[1]; if (Q[1] > x1) x1 = Q[1];
    if (-Q[2] < y0) y0 = -Q[2]; if (-Q[2] > y1) y1 = -Q[2];
  }
  AT.view.area = aid; AT.view.z = z;
  AT.view.cx = (x0 + x1) / 2; AT.view.cy = (y0 + y1) / 2;
  var span = Math.max(x1 - x0, y1 - y0) + 3;
  AT.view.span = span < AT.spanMin ? AT.spanMin : (span > AT.spanMax ? AT.spanMax : span);
  run_function("atlas_render", { full: true }, "atlas");
  display_notice("[atlas] showing " + AT.title(aid) + " in the Atlas tab (⌖ or your next step brings you back).", "cyan");
};
// The view follows you: your area, your level, centred on your room.
// (SVG coordinates: x east, y south, so the map's y is turned over.)
AT.placeView = function () {
  var H = AT.here;
  if (!H) return;
  var R = AT.room(H.id);
  if (R) { AT.view.area = R.a; AT.view.z = R.z; AT.view.cx = R.x; AT.view.cy = -R.y; }
  else if (H.area) { AT.view.area = H.area; }
};

// ---- Walking ---------------------------------------------------------
// Opt in (ATLAS WALK CUSTOM): until then a click sends the game's PATH FIND.
// One click, one destination (docs/safety.md): Atlas finds the shortest
// route on its own map, sends one step, waits for the game to put you in the
// next room, sends the next, and stops on arrival. It also stops when you
// leave the route (you moved, were moved, followed someone), when a step
// gets no answer (AT.walkWait), on ATLAS STOP, and when Loom is paused. With
// no route on the map, the game's PATH FIND is asked instead.
// Ordinary exits and wormholes; other special exits come later.
AT.walkWait = 4000;
// Wormholes (the crowdmap's special exit "worm warp", 650 of them, nearly all
// both ways): a warp counts as AT.wormCost steps when routes are compared, and
// its answer is waited for longer (AT.warpWait). Shortcuts are off until you
// turn them on, since most characters can't use them (Ricardo): ATLAS
// WORMHOLES ON (setting atlas_worms = "on"). Other special exits: not yet;
// never "buy …" or the crowdmap's "script:" exits (Ricardo).
// Cost: the warp is instant, but you can't move for ~4.3 s after it while
// equilibrium comes back (Ricardo's log 17:51), and a step takes ~0.42 s on
// a walk: about 10 steps.
AT.wormCost = 10;
AT.warpWait = 6000;          // a warp is instant (Ricardo): no room in 6 s, it isn't there
// Shortcuts the crowdmap has that the game doesn't (Ricardo: no wormhole at
// 9553, the map says there is one): a special step with no answer is marked
// broken, left out of routes, and the walk goes another way from where you
// are (at most AT.detourMax times a walk). Kept in the browser (key "broken",
// { "room|command": when }) for AT.brokenDays; ATLAS BROKEN lists them,
// ATLAS BROKEN CLEAR forgets them. An ordinary exit is marked only when the
// game didn't list it for the room you were in (Room.Info's exits): a step
// through a listed exit that fails is you (stunned, prone), not the map.
AT.detourMax = 3;
AT.brokenDays = 30;
if (!AT.broken || typeof AT.broken != "object") AT.broken = {};
AT.brokenLoad = function () {
  AT.idb("readonly", "broken").then(function (v) {
    if (!v || typeof v != "object") return;
    var old = Date.now() - AT.brokenDays * 86400000, gone = false;
    for (var k in v) if (v.hasOwnProperty(k) && /^\d+\|.{1,60}$/.test(k)) { if (atNum(v[k]) > old) AT.broken[k] = atNum(v[k]); else gone = true; }
    if (gone) AT.brokenSave();
  });
};
AT.brokenSave = function () { AT.idb("readwrite", "broken", AT.broken); };
AT.markBroken = function (room, cmd) { AT.broken[room + "|" + cmd] = Date.now(); AT.brokenSave(); };
// A warp is instant but takes equilibrium, and you can't move until it's
// back ("You are recovering equilibrium and cannot move yet.", Ricardo's log
// 17:51). So every step waits until Char.Vitals shows equilibrium (AT.eq),
// at most AT.eqWait. Atlas marks it lost itself as it sends a warp, since the
// room can arrive before the vitals that say so. null: not known yet (taken
// as there). If the game refuses a step for it anyway (the trigger "Atlas
// walk no equilibrium"), it keeps that move and makes it when equilibrium
// returns (the log: you moved without a new command), so Atlas waits for the
// room rather than resending, and resends only if none comes in AT.queuedMs.
AT.eqWait = 15000;
if (AT.eq === undefined) AT.eq = null;
AT.queuedMs = 1500;
// ---- Teleports: shortcuts from anywhere (off until you turn them on) -----
// PIERCE THE VEIL (Ricardo): in dragonform, to Dragonspire Mount (12695) in
// the Parthren Gare, whose ordinary exits lead to many places. On unless
// you turn it off (Ricardo: no harm, the class is the check): used only while
// Char.Status says your class is a dragon ("Black Dragon"; AT.cls, or the
// self package's when Atlas loads later; unknown counts as no), and only
// from where a walk starts. ATLAS VEIL OFF (setting atlas_veil = "off").
// A teleport that doesn't land you within AT.teleWait isn't marked broken
// (it's usually you, interrupted, not the map): the walk goes another way.
AT.teleWait = 10000;         // the Veil takes 3 s (Ricardo)
AT.veilCost = 8;             // 3 s at ~0.42 s a step, and the step itself
AT.useVeil = get_variable("atlas_veil") !== "off";
AT.setVeil = function (on) { AT.useVeil = !!on; if (on) delete_variable("atlas_veil"); else set_variable("atlas_veil", "off"); };
if (AT.cls === undefined) AT.cls = null;
AT.isDragon = function () {
  var c = AT.cls;
  if (c === null) { var S = client.loom && client.loom.self; c = S && S.info && S.info["class"] ? String(S.info["class"]) : null; }
  return c !== null && /dragon/i.test(c);
};
AT.teleports = [
  { cmd: "pierce the veil", to: 12695, name: "the Veil", cost: function () { return AT.veilCost; }, on: function () { return AT.useVeil && AT.isDragon(); } }
];
AT.teleport = function (cmd) {
  for (var i = 0; i < AT.teleports.length; i++) if (AT.teleports[i].cmd === cmd) return AT.teleports[i];
  return null;
};
AT.vitals = function (v) {
  AT.eq = String(v.eq) == "1";
  var W = AT.walk;
  if (!AT.eq || !W || !W.eqWait) return;
  W.eqWait = false;
  if (W.t) { clearTimeout(W.t); W.t = null; }
  if (!W.queued) { AT.walkStep(); return; }
  // The game holds the refused step and makes it now: wait for the room.
  W.queued = false;
  var step = W.i;
  W.t = setTimeout(function () { if (AT.walk === W && W.i === step) AT.walkStep(true); }, AT.queuedMs);
};
// The game refused a step: "You are recovering equilibrium and cannot move yet."
AT.walkNoEq = function () {
  var W = AT.walk;
  if (!W) return;
  AT.eq = false;
  W.eqWait = true;
  W.queued = true;
  if (W.t) clearTimeout(W.t);
  if (W.retry) { clearTimeout(W.retry); W.retry = null; }
  var step = W.i;
  W.t = setTimeout(function () {
    if (AT.walk === W && W.i === step && W.eqWait) AT.walkEnd("equilibrium didn't come back in " + AT.label(W.rooms[W.i]));
  }, AT.eqWait);
};
AT.useWorms = get_variable("atlas_worms") === "on";
AT.setWorms = function (on) {
  AT.useWorms = !!on;
  if (on) set_variable("atlas_worms", "on"); else delete_variable("atlas_worms");
};
// The cost of a special exit for routes, 0 when Atlas doesn't take it.
// The crowdmap's other special exits (enter grate, jump north, pull curtain,
// touch rift, climb down, push barrel, say oniar…): ordinary ways through the
// world anyone can take, so on unless you turn them off (Ricardo; ATLAS EXITS
// OFF, setting atlas_exits = "off"). The step is the exit's command, sent as
// it is; one that doesn't move you is marked broken and walked around, as a
// missing wormhole. Never "buy …" (it spends) or "script: …" (Mudlet code),
// nor "kneel …" (may need you to follow that god): Ricardo.
AT.exitCost = 2;
AT.useExits = get_variable("atlas_exits") !== "off";
AT.setExits = function (on) { AT.useExits = !!on; if (on) delete_variable("atlas_exits"); else set_variable("atlas_exits", "off"); };
AT.exitNever = /^(buy\b|kneel\b|script:)/i;
AT.specialCost = function (cmd) {
  if (cmd === "worm warp") return AT.useWorms ? AT.wormCost : 0;
  if (!AT.useExits || AT.exitNever.test(cmd) || !/^[a-z]/i.test(cmd)) return 0;
  return AT.exitCost;
};
AT.arrivedMs = 250;
AT.setOwnWalk = function (on) {
  AT.ownWalk = !!on;
  if (on) set_variable("atlas_walk", "custom"); else { delete_variable("atlas_walk"); if (AT.walk) AT.walkEnd("ATLAS WALK PATHFIND"); }
};
if (AT.walk === undefined) AT.walk = null;
AT.label = function (id) { var R = AT.room(id); return (R && R.n ? R.n + " " : "") + "(" + id + ")"; };
// The shortest route from one room to another over ordinary exits, around
// locked doors: { rooms: [from, …, to], dirs: [dir, …] }, or null.
AT.route = function (from, to, opt) {
  if (!AT.map || !AT.map.rooms[to] || from === to) return null;
  return AT.routeAny(from, function (u) { return u === to; }, opt);
};
// The shortest route to the nearest room for which goal(room) is true (not
// the room you start in): { rooms, dirs, to }, or null. One search, however
// many rooms qualify: an area's rooms, the rooms an NPC is listed in.
AT.routeAny = function (from, goal, opt) {
  var M = AT.map;
  if (!M || !M.rooms[from]) return null;
  var dist = {}, prev = {}, how = {}, heap = [[0, from]], to = null;
  dist[from] = 0;
  var noTele = (opt && opt.noTele) || {};
  function push(x) { heap.push(x); var i = heap.length - 1; while (i) { var p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; var t = heap[p]; heap[p] = heap[i]; heap[i] = t; i = p; } }
  function pop() {
    var top = heap[0], last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      for (var i = 0; ;) {
        var a = 2 * i + 1, b = a + 1, m = i;
        if (a < heap.length && heap[a][0] < heap[m][0]) m = a;
        if (b < heap.length && heap[b][0] < heap[m][0]) m = b;
        if (m === i) break;
        var t = heap[m]; heap[m] = heap[i]; heap[i] = t; i = m;
      }
    }
    return top;
  }
  while (heap.length) {
    var top = pop(), d = top[0], u = top[1];
    if (d > dist[u]) continue;
    if (u !== from && goal(u)) { to = u; break; }
    var R = M.rooms[u];
    if (!R) continue;
    var ex = R[6] || {}, doors = R[10] || {}, sp = R[7] || {};
    for (var dir in ex) {
      if (!ex.hasOwnProperty(dir) || doors[dir] === 3 || AT.broken[u + "|" + dir]) continue;
      var v = ex[dir], V = M.rooms[v];
      if (!V || V[0] === AT.SKETCH) continue;
      var nd = d + 1;
      if (dist[v] === undefined || nd < dist[v]) { dist[v] = nd; prev[v] = u; how[v] = dir; push([nd, v]); }
    }
    // Special exits Atlas uses: the command is the step (AT.specialCost).
    for (var cmd in sp) {
      if (!sp.hasOwnProperty(cmd)) continue;
      var cost = AT.specialCost(cmd);
      if (!(cost > 0) || AT.broken[u + "|" + cmd]) continue;
      var v2 = sp[cmd], V2 = M.rooms[v2];
      if (!V2 || V2[0] === AT.SKETCH) continue;
      var nd2 = d + cost;
      if (dist[v2] === undefined || nd2 < dist[v2]) { dist[v2] = nd2; prev[v2] = u; how[v2] = cmd; push([nd2, v2]); }
    }
    // Teleports work from anywhere at the same cost, so only from where you
    // start (AT.teleports).
    if (u === from) for (var ti = 0; ti < AT.teleports.length; ti++) {
      var T = AT.teleports[ti];
      if (noTele[T.cmd] || !T.on() || !M.rooms[T.to] || T.to === from) continue;
      var nd3 = d + T.cost();
      if (dist[T.to] === undefined || nd3 < dist[T.to]) { dist[T.to] = nd3; prev[T.to] = u; how[T.to] = T.cmd; push([nd3, T.to]); }
    }
  }
  if (to === null) return null;
  var rooms = [to], dirs = [];
  for (var c = to; c !== from; c = prev[c]) { dirs.unshift(how[c]); rooms.unshift(prev[c]); }
  return { rooms: rooms, dirs: dirs, to: to };
};
AT.go = function (id) {
  id = atNum(id);
  if (!(id > 0)) return;
  if (get_variable("pauseTriggers") == "on") { display_notice("[atlas] Loom is paused (LOOM PAUSE OFF to walk).", "orange"); return; }
  var R = AT.room(id), label = AT.label(id);
  if (AT.here && AT.here.id === id) { display_notice("[atlas] you're in " + label + " already.", "cyan"); return; }
  if (R && R.a === AT.SKETCH) { display_notice("[atlas] " + label + " is on no map: PATH FIND can't walk there. Use its exits.", "orange"); return; }
  if (AT.walk) AT.walkEnd(null);
  if (!AT.ownWalk) {
    send_command("path find " + id, 1);
    display_notice("[atlas] walking to " + label + ".", "cyan");
    return;
  }
  var P = AT.here ? AT.route(AT.here.id, id) : null;
  if (!P) {
    send_command("path find " + id, 1);
    display_notice("[atlas] no route to " + label + " on the map: asking the game (PATH FIND).", "cyan");
    return;
  }
  AT.walk = { to: id, rooms: P.rooms, dirs: P.dirs, i: 0, t: null, at: 0 };
  display_notice("[atlas] walking to " + label + ": " + P.dirs.length + " step" + (P.dirs.length === 1 ? "" : "s") + ". ATLAS STOP to stop.", "cyan");
  AT.walkStep();
  run_function("atlas_render", {}, "atlas");
};
// ---- Going to an area or a denizen (ATLAS GO <name>) --------------------
// An area: the nearest of its rooms by the route Atlas would take (your
// shortcut settings included), then walked as ATLAS GO <room> walks.
// A denizen: the crowdmap's denizen list (denizen.json beside the map:
// [{ name, loc: room }], no longer updated since its service closed, so a
// denizen that wanders or moved since may be elsewhere). Downloaded the
// first time it's needed and kept in the browser (key "denizens", with the
// map version it came with).
if (AT.den === undefined) AT.den = null;      // [[name lower, name, room]]
AT.denLoad = function (cb) {
  if (AT.den) { cb(true); return; }
  var v = AT.map ? AT.map.v : "";
  AT.idb("readonly", "denizens").then(function (c) {
    if (c && c.v === v && Array.isArray(c.list) && c.list.length) { AT.den = c.list; cb(true); return; }
    if (typeof fetch != "function") { cb(false); return; }
    AT.fetchJson(AT.base + "denizen.json").then(function (j) {
      var list = [];
      if (Array.isArray(j)) for (var i = 0; i < j.length; i++) {
        var e = j[i], n = e && String(e.name || "").slice(0, 120), r = e && atNum(e.loc);
        if (n && r > 0) list.push([n.toLowerCase(), n, r]);
      }
      if (!list.length) { cb(false); return; }
      AT.den = list;
      AT.idb("readwrite", "denizens", { v: v, at: Date.now(), list: list });
      cb(true);
    }, function () { cb(false); });
  });
};
// ATLAS GO <text>: a room number, an area's name (or HERE / its number is
// not taken: numbers are rooms), else a denizen's name.
AT.goPlace = function (text) {
  var t = String(text || "").trim();
  if (/^\d+$/.test(t)) { AT.go(t); return; }
  if (!AT.map) { display_notice("[atlas] the map isn't loaded (ATLAS RELOAD).", "orange"); return; }
  if (!AT.here || !AT.map.rooms[AT.here.id]) { display_notice("[atlas] Atlas doesn't know where you are on the map: take a step.", "orange"); return; }
  if (get_variable("pauseTriggers") == "on") { display_notice("[atlas] Loom is paused (LOOM PAUSE OFF to walk).", "orange"); return; }
  var fa = /^\d/.test(t) ? null : AT.findArea(t), aids = [];
  if (fa && !fa.rest) aids = [fa.aid];
  else if (!/^\d/.test(t)) aids = AT.areasNamed(t);
  if (aids.length) { AT.goArea(aids); return; }
  // Areas whose name has words starting with what you typed ("azdun": the
  // Azdun Dungeon, the Azdun Catacombs): offered to pick from, with any
  // denizens that match, rather than walking to a denizen you didn't mean.
  var like = /^\d/.test(t) ? [] : AT.areasLike(t);
  display_notice("[atlas] looking for " + t + "…", "cyan");
  AT.denLoad(function (ok) {
    if (like.length) { AT.suggest(t, like, ok ? AT.denFind(t) : []); return; }
    if (!ok) { display_notice("[atlas] the crowdmap's denizen list couldn't be loaded: ATLAS GO <room number> or <area>.", "orange"); return; }
    AT.goDenizen(t);
  });
};
// Areas by their short name, the crowdmap's name before the comma ("Ashtan"
// for "Ashtan, the City of", "Delos" for "Delos, the Isle of"), any case.
AT.areasNamed = function (t) {
  var tl = String(t || "").toLowerCase().replace(/\s+/g, " ").trim().replace(/^the /, ""), out = [];
  if (!tl || !AT.map) return out;
  for (var a in AT.map.areas) {
    if (!AT.map.areas.hasOwnProperty(a)) continue;
    var short = String(AT.map.areas[a]).split(",")[0].toLowerCase().replace(/\s+/g, " ").trim().replace(/^the /, "");
    if (short === tl) out.push(atNum(a));
  }
  return out;
};
// Areas with a word starting with each word you typed, by short name (one
// entry per short name, since ATLAS GO <short name> takes the nearest of
// those): [{ short, title, n }] in name order, at most AT.suggestMax.
AT.suggestMax = 8;
AT.areasLike = function (t) {
  var words = String(t || "").toLowerCase().replace(/^the\s+/, "").split(/[^a-z0-9']+/).filter(Boolean), seen = {}, out = [];
  if (!words.length || !AT.map) return out;
  for (var a in AT.map.areas) {
    if (!AT.map.areas.hasOwnProperty(a)) continue;
    var full = String(AT.map.areas[a]), tokens = full.toLowerCase().split(/[^a-z0-9']+/).filter(Boolean), all = true;
    for (var i = 0; i < words.length && all; i++) {
      var hit = false;
      for (var j = 0; j < tokens.length && !hit; j++) if (tokens[j].indexOf(words[i]) === 0) hit = true;
      all = hit;
    }
    if (!all) continue;
    var short = full.split(",")[0].replace(/\s+/g, " ").trim();
    var key = short.toLowerCase().replace(/^the /, "");
    if (seen[key]) { seen[key].n++; continue; }
    seen[key] = { short: short.replace(/^the /i, ""), title: AT.title(atNum(a)), n: 1 };
    out.push(seen[key]);
  }
  out.sort(function (p, q) { return p.short.toLowerCase() < q.short.toLowerCase() ? -1 : 1; });
  return out.slice(0, AT.suggestMax);
};
// Offer areas (and denizens) to pick: clickable lines where Nexus can show
// them (onclick → window.loomAtlas.pick(i), as Shopping's buttons; the last
// list offered is kept in AT.picks), else a notice to type from.
AT.suggest = function (t, areas, dens) {
  var esc = function (v) { return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var picks = [], seen = {}, i;
  for (i = 0; i < areas.length; i++) picks.push({ cmd: "ATLAS GO " + areas[i].short.toLowerCase(), text: areas[i].title + (areas[i].n > 1 ? " (" + areas[i].n + " areas)" : ""), kind: "area" });
  for (i = 0; i < dens.length && picks.length < AT.suggestMax + 3; i++) {
    if (seen[dens[i][1]]) continue;
    seen[dens[i][1]] = true;
    picks.push({ cmd: "ATLAS GO " + dens[i][1], text: dens[i][1], kind: "denizen" });
  }
  AT.picks = picks.map(function (p) { return p.cmd.replace(/^ATLAS GO /, ""); });
  var head = "[atlas] no area called " + t + ". Did you mean:";
  var html = (typeof nexusclient != "undefined" && nexusclient && typeof nexusclient.add_html_line == "function");
  if (html) {
    var rows = picks.map(function (p, i) {
      return '  <span onclick="window.loomAtlas&&window.loomAtlas.pick(' + i + ')" title="' + esc(p.cmd) + '" style="cursor:pointer;color:#7fd4ff;text-decoration:underline">' + esc(p.text) + '</span>' +
        (p.kind === "denizen" ? ' <span style="color:#888">(denizen)</span>' : '');
    });
    nexusclient.add_html_line('<span style="color:cyan;white-space:pre-wrap">' + esc(head) + '\n' + rows.join("\n") + '</span>');
  } else display_notice(head + " " + picks.map(function (p) { return p.cmd; }).join("; ") + ".", "cyan");
};
// The nearest room of one of these areas (several share a short name).
AT.goArea = function (aids) {
  var M = AT.map, here = AT.here.id, want = {};
  for (var i = 0; i < aids.length; i++) want[aids[i]] = true;
  if (want[M.rooms[here][0]]) { display_notice("[atlas] you're in " + AT.title(M.rooms[here][0]) + " already.", "cyan"); return; }
  var P = AT.routeAny(here, function (u) { return !!want[M.rooms[u][0]]; });
  if (!P) { display_notice("[atlas] no route on the map into " + AT.title(aids[0]) + ".", "orange"); return; }
  display_notice("[atlas] " + AT.title(M.rooms[P.to][0]) + ": the nearest room is " + AT.label(P.to) + ".", "cyan");
  AT.go(P.to);
};
// Words of a name start where the query starts ("cheska" finds "Cheska, the
// Innkeeper"; "keeper" doesn't).
AT.denFind = function (q) {
  var ql = String(q).toLowerCase().replace(/\s+/g, " ").trim(), out = [];
  if (!ql || !AT.den) return out;
  var re = new RegExp("(^|[^a-z0-9'])" + ql.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  for (var i = 0; i < AT.den.length; i++) if (re.test(AT.den[i][0]) && AT.map.rooms[AT.den[i][2]]) out.push(AT.den[i]);
  return out;
};
AT.goDenizen = function (q) {
  var found = AT.denFind(q), here = AT.here && AT.here.id;
  if (!found.length) { display_notice("[atlas] nothing called " + q + " on the crowdmap's denizen list, nor an area by that name.", "orange"); return; }
  var at = {}, i;
  for (i = 0; i < found.length; i++) (at[found[i][2]] || (at[found[i][2]] = [])).push(found[i][1]);
  if (at[here]) { display_notice("[atlas] " + at[here][0] + " is listed here, in " + AT.label(here) + ".", "cyan"); return; }
  var P = AT.routeAny(here, function (u) { return !!at[u]; });
  var to = P ? P.to : (Object.keys(at).length === 1 ? atNum(Object.keys(at)[0]) : 0);
  if (!to) { display_notice("[atlas] no route on the map to " + found.length + " denizen" + (found.length === 1 ? "" : "s") + " called " + q + ".", "orange"); return; }
  var others = [];
  for (i = 0; i < found.length && others.length < 3; i++) if (found[i][2] !== to && others.indexOf(found[i][1]) < 0) others.push(found[i][1]);
  var more = found.length - at[to].length;
  display_notice("[atlas] " + at[to][0] + ": listed in " + AT.label(to) + " (the crowdmap's list; denizens move)" +
    (more > 0 ? ". Also matching: " + others.join("; ") + (more > others.length ? " and " + (more - others.length) + " more" : "") + "." : "."), "cyan");
  AT.go(to);
};
// Moving too fast ("Now now, don't be so hasty!", the trigger "Atlas walk too
// hasty"): the step wasn't taken, so it's sent again after AT.hastyMs, at
// most AT.hastyMax times in a row (Ricardo's log: two quick steps, the third
// refused 0.15 s after the second arrived).
AT.hastyMs = 300;
AT.hastyMax = 20;
AT.walkHasty = function () {
  var W = AT.walk;
  if (!W) return;
  if (W.t) { clearTimeout(W.t); W.t = null; }
  if (W.retry) return;                              // one resend at a time
  W.hasty = (W.hasty || 0) + 1;
  // A refused warp took no equilibrium: back to what the vitals say next.
  if (!AT.BACK[W.dirs[W.i]] && AT.eq === false) AT.eq = null;
  if (W.hasty > AT.hastyMax) { AT.walkEnd("the game kept saying you're moving too fast"); return; }
  var step = W.i;
  W.retry = setTimeout(function () {
    W.retry = null;
    if (AT.walk === W && W.i === step) AT.walkStep(true);
  }, AT.hastyMs);
};
// The route to draw on the map: the walk under way, else the last ATLAS ROUTE
// while you're still where it starts ({ rooms, dirs, from: steps taken, to }).
AT.preview = AT.preview || null;
AT.routeShown = function () {
  var W = AT.walk;
  if (W) return { rooms: W.rooms, dirs: W.dirs, from: W.i, to: W.to };
  var P = AT.preview;
  if (P && AT.here && P.rooms[0] === AT.here.id) return { rooms: P.rooms, dirs: P.dirs, from: 0, to: P.to };
  AT.preview = null;
  return null;
};
// Send the next step (opening a door the map marks closed first; not again
// on a resend).
AT.walkStep = function (again) {
  var W = AT.walk;
  if (!W) return;
  if (get_variable("pauseTriggers") == "on") { AT.walkEnd("Loom was paused"); return; }
  if (!again) { W.hasty = 0; if (W.retry) { clearTimeout(W.retry); W.retry = null; } }
  var from = W.rooms[W.i], dir = W.dirs[W.i], R = AT.map && AT.map.rooms[from];
  if (AT.eq === false) {
    // Off equilibrium (after a warp): wait for it (AT.vitals sends the step).
    W.eqWait = true;
    if (W.t) clearTimeout(W.t);
    var held = W.i;
    W.t = setTimeout(function () {
      if (AT.walk === W && W.i === held && W.eqWait) AT.walkEnd("equilibrium didn't come back in " + AT.label(from));
    }, AT.eqWait);
    return;
  }
  if (!again && R && R[10] && R[10][dir] === 2) send_command("open door " + dir, 1);
  // Did the game list this exit for the room you're in? (Not: the map may be
  // wrong; a failure then marks it rather than stopping the walk.)
  W.listed = !(AT.BACK[dir] && AT.here && AT.here.id === from && AT.here.dirs && !AT.here.dirs[dir]);
  send_command(dir, 1);
  if (dir === "worm warp") AT.eq = false;      // known to cost equilibrium (the Veil: not known)
  W.at = Date.now();
  if (W.t) clearTimeout(W.t);
  var step = W.i;
  W.t = setTimeout(function () {
    if (AT.walk !== W || W.i !== step) return;
    if (AT.BACK[dir] && W.listed) AT.walkEnd("no answer to " + dir + " from " + AT.label(from) + " (blocked, or you couldn't move)");
    else AT.walkDetour(from, dir);
  }, AT.BACK[dir] ? AT.walkWait : (AT.teleport(dir) ? AT.teleWait : AT.warpWait));
};
// "There is no wormhole here." (the trigger "Atlas walk no wormhole"): at
// once, rather than after AT.warpWait.
AT.walkNoWorm = function () {
  var W = AT.walk;
  if (!W || W.dirs[W.i] !== "worm warp") return;
  if (W.t) { clearTimeout(W.t); W.t = null; }
  AT.walkDetour(W.rooms[W.i], "worm warp");
};
// A shortcut that isn't there: marked broken, and a new route from this room.
AT.walkDetour = function (from, cmd) {
  var W = AT.walk;
  if (!W) return;
  var T = AT.teleport(cmd);
  if (T) {
    // Not marked: another way for this walk.
    W.noTele = W.noTele || {};
    W.noTele[cmd] = true;
    if (AT.eq === false) AT.eq = null;
    var PT = AT.route(from, W.to, { noTele: W.noTele });
    if (!PT) { AT.walkEnd(T.name + " didn't take you to " + AT.label(T.to) + ", and there's no other route"); return; }
    W.rooms = PT.rooms; W.dirs = PT.dirs; W.i = 0;
    display_notice("[atlas] " + T.name + " didn't take you to " + AT.label(T.to) + " (interrupted?): walking another way, " + PT.dirs.length + " step" + (PT.dirs.length === 1 ? "" : "s") + ".", "orange");
    AT.walkStep();
    run_function("atlas_render", {}, "atlas");
    return;
  }
  AT.markBroken(from, cmd);
  if (!AT.BACK[cmd] && AT.eq === false) AT.eq = null;     // the warp didn't happen
  W.detours = (W.detours || 0) + 1;
  var what = cmd === "worm warp" ? "no wormhole in " + AT.label(from) : (AT.BACK[cmd] ? "no exit " + cmd + " in " + AT.label(from) : "\"" + cmd + "\" didn't work in " + AT.label(from));
  if (W.detours > AT.detourMax) { AT.walkEnd(what + ", and too many shortcuts failed on this walk"); return; }
  var P = AT.route(from, W.to, { noTele: W.noTele });
  if (!P) { AT.walkEnd(what + " (marked: ATLAS BROKEN), and no other route"); return; }
  W.rooms = P.rooms; W.dirs = P.dirs; W.i = 0;
  display_notice("[atlas] " + what + ", though the map has one: marked (ATLAS BROKEN), going another way, " + P.dirs.length + " step" + (P.dirs.length === 1 ? "" : "s") + ".", "orange");
  AT.walkStep();
  run_function("atlas_render", {}, "atlas");
};
// Each room you arrive in (from roomInfo).
AT.walkArrive = function (id) {
  var W = AT.walk;
  if (!W) return;
  if (id === W.to) { AT.walkEnd(""); return; }
  if (id === W.rooms[W.i]) return;                 // the same room again
  if (id === W.rooms[W.i + 1]) { W.i++; AT.walkStep(); return; }
  AT.walkEnd("you left the route in " + AT.label(id));
};
// why: "" arrived, null replaced by a new walk (quiet), else the reason it stopped.
AT.walkEnd = function (why) {
  var W = AT.walk;
  if (!W) return;
  if (W.t) clearTimeout(W.t);
  if (W.retry) clearTimeout(W.retry);
  AT.walk = null;
  // Arrived: the room's information reaches Atlas before its text, so the
  // notice waits a moment to show under the room rather than above it.
  if (why === "") { var arrived = AT.label(W.to); setTimeout(function () { display_notice("[atlas] arrived at " + arrived + ".", "lime"); }, AT.arrivedMs); }
  else if (why) display_notice("[atlas] stopped walking to " + AT.label(W.to) + ": " + why + ".", "orange");
  run_function("atlas_render", {}, "atlas");
};

AT.setFog = function (on) {
  AT.fog = !!on;
  if (AT.fog) delete_variable("atlas_fog"); else set_variable("atlas_fog", "off");
  run_function("atlas_render", { full: true }, "atlas");
};

// ---- The view: zoom, pan, levels ----------------------------------------
// Pan and zoom change the drawn map's viewBox in place; the next full draw
// takes them from AT.view.
AT.viewBox = function () {
  var v = AT.view;
  return (v.cx - v.span / 2).toFixed(2) + " " + (v.cy - v.span / 2).toFixed(2) + " " + v.span.toFixed(2) + " " + v.span.toFixed(2);
};
AT.svgs = function () {
  try { return Array.prototype.slice.call(document.querySelectorAll("svg.loom-atlas-svg")); } catch (e) { return []; }
};
// Zoom and the end of a drag draw the tab again: Nexus shows a tab's HTML
// as given, and changes made in place may not show until the next draw.
AT.drawSoon = function () {
  if (AT.drawT) return;
  AT.drawT = setTimeout(function () { AT.drawT = null; run_function("atlas_render", { full: true }, "atlas"); }, 30);
};
AT.zoom = function (f) {
  var s = AT.view.span * f;
  AT.view.span = s < AT.spanMin ? AT.spanMin : (s > AT.spanMax ? AT.spanMax : s);
  AT.drawSoon();
};
AT.centre = function () {
  AT.placeView();
  run_function("atlas_render", { full: true }, "atlas");
};
AT.level = function (dir) {
  var zs = AT.levels(AT.view.area);
  var i = zs.indexOf(AT.view.z);
  var j = i < 0 ? 0 : i + dir;
  if (j < 0 || j >= zs.length) return;
  AT.view.z = zs[j];
  run_function("atlas_render", { full: true }, "atlas");
};
// The levels (z) an area has rooms on, lowest first.
AT.levels = function (aid) {
  var ids = AT.areaRooms(aid), seen = {}, out = [];
  for (var i = 0; i < ids.length; i++) { var z = AT.map.rooms[ids[i]][3]; if (!seen[z]) { seen[z] = 1; out.push(z); } }
  return out.sort(function (a, b) { return a - b; });
};

// Dragging pans; a press that moved isn't a click.
AT.drag = null;
AT.dragged = false;
AT.down = function (ev) {
  if (ev.button !== undefined && ev.button !== 0) return;
  var el = ev.currentTarget, r = el.getBoundingClientRect();
  AT.drag = { x: ev.clientX, y: ev.clientY, cx: AT.view.cx, cy: AT.view.cy, upp: AT.view.span / Math.max(r.width, r.height, 1), moved: false };
};
AT.move = function (ev) {
  var D = AT.drag;
  if (!D) return;
  var dx = ev.clientX - D.x, dy = ev.clientY - D.y;
  if (!D.moved && Math.abs(dx) + Math.abs(dy) < 5) return;
  D.moved = true;
  AT.view.cx = D.cx - dx * D.upp;
  AT.view.cy = D.cy - dy * D.upp;
  var vb = AT.viewBox(), s = AT.svgs();
  for (var i = 0; i < s.length; i++) s[i].setAttribute("viewBox", vb);
};
AT.up = function () {
  var D = AT.drag;
  AT.drag = null;
  if (D && D.moved) {
    AT.dragged = true;
    setTimeout(function () { AT.dragged = false; }, 0);
    run_function("atlas_render", { full: true }, "atlas");
  }
};
AT.wheel = function (ev) {
  try { ev.preventDefault(); } catch (e) {}
  AT.zoom(ev.deltaY > 0 ? 1.15 : 1 / 1.15);
};

// ---- What other packages see ----------------------------------------------
//   look.room(id) -> { id, area, areaName, x, y, z, name } or undefined
//   look.here()   -> { id, area, name } or undefined
//   look.explored(area) -> { explored, mapped } or undefined (list not seen)
AT.look = {
  room: function (id) { var R = AT.room(id); return R ? { id: R.id, area: R.a, areaName: AT.areaName(R.a), x: R.x, y: R.y, z: R.z, name: R.n } : undefined; },
  here: function () { return AT.here ? { id: AT.here.id, area: AT.here.area, name: AT.here.name } : undefined; },
  mark: function (id) { var m = AT.marks[id]; return m ? { icon: m[0], label: AT.icons[m[0]][0], note: m[1] } : undefined; },
  explored: function (aid) { var n = AT.count(aid); return n < 0 ? undefined : { explored: n, mapped: AT.areaRooms(aid).length }; },
  tags: function (aid) { return (AT.tags[aid] || []).slice(); }
};

// The tab's clicks: its page shares window with the scripts.
try {
  window.loomAtlas = {
    go: function (id) { if (!client.loom.atlas.dragged) client.loom.atlas.go(id); },
    zoom: function (f) { client.loom.atlas.zoom(f); },
    centre: function () { client.loom.atlas.centre(); },
    level: function (d) { client.loom.atlas.level(d); },
    fog: function () { client.loom.atlas.setFog(!client.loom.atlas.fog); },
    reload: function () { client.loom.atlas.load(true); },
    fold: function (i) { var g = client.loom.atlas.groupsDrawn || []; if (g[i] !== undefined) client.loom.atlas.fold(g[i]); },
    show: function (aid) { client.loom.atlas.showArea(aid); },
    sort: function (k) { client.loom.atlas.setSort(k); },
    showRoom: function (id) { client.loom.atlas.showRoom(id); },
    down: function (ev) { client.loom.atlas.down(ev); },
    move: function (ev) { client.loom.atlas.move(ev); },
    up: function (ev) { client.loom.atlas.up(ev); },
    wheel: function (ev) { client.loom.atlas.wheel(ev); },
    pick: function (i) { var p = client.loom.atlas.picks || []; if (p[i] !== undefined) client.loom.atlas.goPlace(p[i]); }
  };
} catch (e) {}

AT.wildHook();
AT.seedExplored();
if (AT.map) { AT.rebuildKnown(); for (var atS in AT.known) if (AT.known.hasOwnProperty(atS)) AT.recount(atNum(atS)); }
if (!AT.envLoaded) { AT.envLoaded = true; AT.envLoad(); AT.officialLoad(); AT.brokenLoad(); }
if (client.loom.notify) client.loom.notify("atlas");
