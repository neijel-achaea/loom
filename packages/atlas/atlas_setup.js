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
client.loom.registry.atlas = { version: "0.1.1", keyword: "ATLAS", desc: "{{description}}",
  redraw: function () { run_function("atlas_render", { full: true }, "atlas"); } };
var AT = client.loom.atlas;

AT.base = "https://ire-mudlet-mapping.github.io/AchaeaCrowdmap/Map/";
// Saved: atlas_fog = "off" while fog of war is off (absent: on).
AT.fog = get_variable("atlas_fog") !== "off";
// Kept across a rerun of setup (a reimport): the map in memory, where you
// are, the explored lists, the view.
if (AT.map === undefined) AT.map = null;
if (!AT.state) AT.state = "idle";          // idle | loading | ready | failed
if (AT.note === undefined) AT.note = "";
if (AT.here === undefined) AT.here = null;
if (!AT.explored || typeof AT.explored != "object") AT.explored = {};
if (!AT.view || typeof AT.view != "object") AT.view = { area: null, z: 0, cx: 0, cy: 0, span: 18 };
AT.spanMin = 6;
AT.spanMax = 160;

function atNum(v) { var n = parseInt(v, 10); return isFinite(n) ? n : 0; }
function atFloat(v) { var n = Number(v); return isFinite(n) ? n : 0; }

// ---- The map ---------------------------------------------------------
// In memory and in the cache, the crowdmap is kept compact:
//   { v: version, at: ms, areas: { id: name },
//     rooms: { id: [area, x, y, z, name, env, exits, specials] },
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
  AT.source = source;
  AT.state = "ready";
  AT.note = "";
  if (AT.here) AT.placeView();
  if (client.loom.notify) client.loom.notify("atlas");
  run_function("atlas_render", { full: true }, "atlas");
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
    if (AT.envRead(t)) {
      AT.idb("readwrite", "envs", AT.envs);
      run_function("atlas_render", { full: true }, "atlas");
    }
  }).catch(function () {});
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
      var s = AT.explored[atNum(a)] || (AT.explored[atNum(a)] = {});
      for (var r in E[a]) if (E[a].hasOwnProperty(r) && atNum(r) > 0) s[atNum(r)] = true;
    }
  } catch (e) {}
};
AT.exploredCount = function (aid) {
  var s = AT.explored[aid];
  return s ? Object.keys(s).length : -1;
};
// Room.Info: where you are; an area's explored list when it comes with it.
AT.roomInfo = function (g) {
  var id = atNum(g.num);
  if (!(id > 0)) return;
  var co = String(g.coords || "").split(",");
  var aid = atNum(co[0]);
  var R = AT.room(id);
  if (R) aid = R.a;
  AT.here = { id: id, area: aid > 0 ? aid : null, name: String(g.name || "").replace(/\s*\((?:indoors|outdoors|road)\)\s*$/i, "").slice(0, 120),
    areaName: String(g.area || "").slice(0, 80), onMap: !!R };
  if (Array.isArray(g.explored) && AT.here.area) {
    var s = {};
    for (var i = 0; i < g.explored.length; i++) { var x = atNum(g.explored[i]); if (x > 0) s[x] = true; }
    AT.explored[AT.here.area] = s;
  }
  // As Nexus does: the room you're in is explored (once the area's list is known).
  if (AT.here.area && AT.explored[AT.here.area]) AT.explored[AT.here.area][id] = true;
  if (AT.here.area) AT.envFetch(AT.here.area);
  AT.placeView();
  run_function("atlas_render", {}, "atlas");
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
  explored: function (aid) { var n = AT.exploredCount(aid); return n < 0 ? undefined : { explored: n, mapped: AT.areaRooms(aid).length }; }
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
    down: function (ev) { client.loom.atlas.down(ev); },
    move: function (ev) { client.loom.atlas.move(ev); },
    up: function (ev) { client.loom.atlas.up(ev); },
    wheel: function (ev) { client.loom.atlas.wheel(ev); }
  };
} catch (e) {}

AT.seedExplored();
if (!AT.envLoaded) { AT.envLoaded = true; AT.envLoad(); }
if (client.loom.notify) client.loom.notify("atlas");
