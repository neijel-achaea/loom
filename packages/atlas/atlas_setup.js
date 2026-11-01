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
client.loom.registry.atlas = { version: "0.4.0", keyword: "ATLAS", desc: "{{description}}",
  redraw: function () { run_function("atlas_render", { full: true }, "atlas"); run_function("atlas_areas_render", [], "atlas"); } };
var AT = client.loom.atlas;

AT.base = "https://ire-mudlet-mapping.github.io/AchaeaCrowdmap/Map/";
// Saved (per character, as every Nexus variable):
//   atlas_fog = "off" while fog of war is off (absent: on);
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
//     rooms: { id: [area, x, y, z, name, env, exits, specials, fromGame] },
//     (fromGame 1: a room the game's own map added, see "The game's own map")
//     env: { envId: [r, g, b] } }
// exits = { direction: room id }; specials = { command: room id } or 0.
// Everything from the download is treated as data and checked as it's
// copied: ids are positive whole numbers, names are strings, capped.
AT.compact = function (src, colors, v) {
  if (!Array.isArray(src)) return null;
  var out = { v: String(v || ""), at: Date.now(), areas: {}, rooms: {}, env: {}, n: 0 };
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
      out.rooms[id] = [aid, atFloat(r.x), atFloat(r.y), atFloat(r.z), String(r.name || "").slice(0, 120), atNum(r.env), ex, sp];
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
  return { id: atNum(id), a: R[0], x: R[1], y: R[2], z: R[3], n: R[4], e: R[5], ex: R[6] || {}, sp: R[7] || {} };
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
      if (cached && !force && (v === null || v === cached.v)) {
        AT.useMap(cached, v === null ? "cache (the community map couldn't be checked for updates)" : "cache");
        return;
      }
      if (v === null) throw new Error("the community map can't be reached");
      return Promise.all([AT.fetchJson(AT.base + "mapExport.json"), AT.fetchJson(AT.base + "colors.json").catch(function () { return null; })]).then(function (r) {
        if (gen !== AT.gen) return;
        var m = AT.compact(r[0], r[1], v);
        if (!m) throw new Error("the community map came in a shape Atlas doesn't know");
        AT.idb("readwrite", "crowdmap", m);
        var was = cached ? cached.v : "";
        AT.useMap(m, "download");
        display_notice("[atlas] community map " + (was && was !== m.v ? "updated to version " + m.v + " (was " + was + ")" : "version " + m.v + " loaded") + ": " + m.n.toLocaleString("en-US") + " rooms in " + Object.keys(m.areas).length + " areas.", "lime");
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
    if (C2) {
      // Exits: the game's win in their direction.
      var ex = C2[6] || (C2[6] = {});
      for (var d in G2[5]) if (G2[5].hasOwnProperty(d) && ex[d] !== G2[5][d]) { ex[d] = G2[5][d]; exits++; }
      continue;
    }
    // A room the crowdmap lacks: in the crowdmap area of its neighbours
    // (the one most of them are in), else the game's area number.
    var votes = {}, best = 0, area = M.areas[gaid] ? gaid : 0;
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
  if (!(id > 0)) return;
  var co = String(g.coords || "").split(",");
  var aid = atNum(co[0]);
  var R = AT.room(id);
  var gaid = aid > 0 ? aid : (R ? R.a : 0);      // the game's area: whose list this is
  if (R) aid = R.a;                             // the crowdmap's area: what's drawn
  var wasG = AT.hereGame || null;
  AT.hereGame = gaid || null;
  AT.here = { id: id, area: aid > 0 ? aid : null, name: String(g.name || "").replace(/\s*\((?:indoors|outdoors|road)\)\s*$/i, "").slice(0, 120),
    areaName: String(g.area || "").slice(0, 80), onMap: !!R, exits: {} };
  // The exits the game shows for this room: { destination: true }.
  if (g.exits && typeof g.exits == "object") for (var ex in g.exits) if (g.exits.hasOwnProperty(ex) && atNum(g.exits[ex]) > 0) AT.here.exits[atNum(g.exits[ex])] = true;
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
  if (gaid) AT.envFetch(gaid);          // the official file is per game area
  AT.placeView();
  run_function("atlas_render", {}, "atlas");
  // The Areas tab: when a count changed, or you crossed into another area.
  var counted = AT.here.area ? AT.recount(AT.here.area) : false;
  if (counted || AT.areasHere !== AT.here.area) { AT.areasHere = AT.here.area; run_function("atlas_areas_render", [], "atlas"); }
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
AT.recount = function (aid) {
  var n = AT.countLive(aid);
  if (n < 0 || AT.counts[aid] === n) return false;
  AT.counts[aid] = n;
  set_variable("atlas_counts", JSON.stringify(AT.counts));
  return true;
};
// Explored in an area: live when its list came this session, else saved; -1 unknown.
AT.count = function (aid) {
  var n = AT.countLive(aid);
  if (n >= 0) return n;
  return AT.counts.hasOwnProperty(aid) ? AT.counts[aid] : -1;
};
// The game's word order: the crowdmap's "Delos, the Isle of" reads "the Isle of Delos".
AT.title = function (aid) {
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
AT.isFolded = function (key) {
  if (AT.folded.hasOwnProperty(key)) return AT.folded[key];
  return key === "unvisited" || key === "uncounted" || key === "hidden";
};
AT.fold = function (key) {
  AT.folded[key] = !AT.isFolded(key);
  set_variable("atlas_folded", JSON.stringify(AT.folded));
  run_function("atlas_areas_render", [], "atlas");
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
AT.go = function (id) {
  id = atNum(id);
  if (!(id > 0)) return;
  if (get_variable("pauseTriggers") == "on") { display_notice("[atlas] Loom is paused (LOOM PAUSE OFF to walk).", "orange"); return; }
  var R = AT.room(id), label = (R && R.n ? R.n + " " : "") + "(" + id + ")";
  if (AT.here && AT.here.id === id) { display_notice("[atlas] you're in " + label + " already.", "cyan"); return; }
  send_command("path find " + id, 1);
  display_notice("[atlas] walking to " + label + ".", "cyan");
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
    down: function (ev) { client.loom.atlas.down(ev); },
    move: function (ev) { client.loom.atlas.move(ev); },
    up: function (ev) { client.loom.atlas.up(ev); },
    wheel: function (ev) { client.loom.atlas.wheel(ev); }
  };
} catch (e) {}

AT.seedExplored();
if (AT.map) { AT.rebuildKnown(); for (var atS in AT.known) if (AT.known.hasOwnProperty(atS)) AT.recount(atNum(atS)); }
if (!AT.envLoaded) { AT.envLoaded = true; AT.envLoad(); AT.officialLoad(); }
if (client.loom.notify) client.loom.notify("atlas");
