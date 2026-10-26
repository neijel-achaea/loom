// waypoints_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Waypoints (#369): rooms you save by number
// with a name you give them (and an optional note), listed by area in the
// Waypoints tab; a click walks you there with PATH FIND.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.waypoints) client.loom.waypoints = {};
client.loom.registry.waypoints = { version: "0.2.0", keyword: "WAYPOINTS", desc: "{{description}}",
  redraw: function () { run_function("waypoints_render", [], "waypoints"); } };
var WP = client.loom.waypoints;

// Saved: waypoints_list = [{ id, name, note, room, area, env, at, tags }], where
// room, area and env are the game's, read when the waypoint was added;
// tags are your own words (lower case, several per waypoint);
// waypoints_folded = [area, …, "tag:<tag>", …], the groups folded in the tab
// ("tag:" alone is the untagged group); waypoints_view = "tag" when the tab
// groups by tag (absent: by area). A variable that
// isn't readable starts afresh (#135).
WP.readList = function (name) {
  var v = get_variable(name);
  if (typeof v == "string") { try { v = JSON.parse(v); } catch (e) { v = null; } }
  return Array.isArray(v) ? v : [];
};
WP.list = [];
var wpRaw = WP.readList("waypoints_list");
for (var wpI = 0; wpI < wpRaw.length; wpI++) {
  var wpE = wpRaw[wpI];
  if (!wpE || typeof wpE != "object" || !/^\d+$/.test(String(wpE.id || "")) || !String(wpE.name || "").trim()) continue;
  var wpT = [];
  if (Array.isArray(wpE.tags)) for (var wpK = 0; wpK < wpE.tags.length; wpK++) { var wpTg = String(wpE.tags[wpK] || "").toLowerCase(); if (/^[a-z0-9][a-z0-9_-]*$/.test(wpTg) && wpT.indexOf(wpTg) < 0) wpT.push(wpTg); }
  WP.list.push({ id: String(wpE.id), name: String(wpE.name).trim(), note: String(wpE.note || ""), room: String(wpE.room || ""), area: String(wpE.area || ""), env: String(wpE.env || ""), at: Number(wpE.at) || 0, tags: wpT });
}
WP.folded = {};
var wpF = WP.readList("waypoints_folded");
for (var wpJ = 0; wpJ < wpF.length; wpJ++) if (typeof wpF[wpJ] == "string") WP.folded[wpF[wpJ]] = true;
WP.view = get_variable("waypoints_view") === "tag" ? "tag" : "area";
if (WP.here === undefined) WP.here = null;

WP.save = function () {
  if (WP.list.length) set_variable("waypoints_list", JSON.stringify(WP.list)); else delete_variable("waypoints_list");
  if (client.loom.notify) client.loom.notify("waypoints");
  run_function("waypoints_render", [], "waypoints");
};
WP.saveFolded = function () {
  var out = [];
  for (var a in WP.folded) if (WP.folded.hasOwnProperty(a) && WP.folded[a]) out.push(a);
  if (out.length) set_variable("waypoints_folded", JSON.stringify(out)); else delete_variable("waypoints_folded");
};
WP.roomName = function (n) { return String(n || "").replace(/\s*\((?:indoors|outdoors)\)\s*$/i, ""); };
WP.byId = function (id) {
  for (var i = 0; i < WP.list.length; i++) if (WP.list[i].id === String(id)) return WP.list[i];
  return null;
};
WP.byName = function (name) {
  var n = String(name || "").trim().toLowerCase();
  for (var i = 0; i < WP.list.length; i++) if (WP.list[i].name.toLowerCase() === n) return WP.list[i];
  return null;
};
// A waypoint by its name or its room number.
WP.find = function (q) {
  q = String(q || "").trim();
  return (/^\d+$/.test(q) && WP.byId(q)) || WP.byName(q);
};
// "<name or number> <rest>": the longest waypoint name (or a number) the
// text starts with, and what follows it; names can have spaces.
WP.split = function (text) {
  var t = String(text || "").trim(), tl = t.toLowerCase(), best = null;
  for (var i = 0; i < WP.list.length; i++) {
    var n = WP.list[i].name.toLowerCase();
    if ((tl === n || tl.indexOf(n + " ") === 0) && (!best || n.length > best.name.length)) best = WP.list[i];
  }
  if (best) return { w: best, rest: t.substring(best.name.length).trim() };
  var m = /^(\d+)(?:\s+(.*))?$/.exec(t);
  if (m && WP.byId(m[1])) return { w: WP.byId(m[1]), rest: (m[2] || "").trim() };
  return null;
};
WP.label = function (w) { return w.name + " (" + w.id + ")"; };

WP.add = function (name) {
  name = String(name || "").trim();
  var H = WP.here;
  if (!H || !H.id) { display_notice("[waypoints] no room yet: move or LOOK first.", "orange"); return; }
  var had = WP.byId(H.id);
  if (had) { display_notice("[waypoints] this room is saved already, as " + had.name + ". WAYPOINTS RENAME " + had.name + " <new name> to rename it.", "orange"); return; }
  // No name (ADD HERE, or a bare ADD): the room's own title, with its
  // number when another waypoint has that name already (Ricardo).
  var named = !!name;
  if (!name) name = H.name || ("Room " + H.id);
  if (!named && WP.byName(name)) name = name + " " + H.id;
  if (/^\d+$/.test(name)) { display_notice("[waypoints] give it a name, not a number: the number is the room's.", "orange"); return; }
  if (WP.byName(name)) { display_notice("[waypoints] " + WP.byName(name).name + " is taken: pick another name.", "orange"); return; }
  WP.list.push({ id: H.id, name: name, note: "", room: H.name, area: H.area, env: H.env, at: Date.now(), tags: [] });
  WP.save();
  display_notice("[waypoints] saved " + name + " (" + H.id + ", " + (H.name || "?") + (H.area ? ", " + H.area : "") + ")." + (named ? "" : " WAYPOINTS RENAME " + name + " <new name> to give it your own."), "lime");
};
WP.remove = function (w) {
  for (var i = 0; i < WP.list.length; i++) {
    if (WP.list[i] === w) { WP.list.splice(i, 1); break; }
  }
  WP.save();
  display_notice("[waypoints] removed " + WP.label(w) + ".", "lime");
};
WP.go = function (w) {
  if (get_variable("pauseTriggers") == "on") { display_notice("[waypoints] Loom is paused (LOOM PAUSE OFF to walk).", "orange"); return; }
  if (WP.here && WP.here.id === w.id) { display_notice("[waypoints] you're at " + WP.label(w) + " already.", "cyan"); return; }
  send_command("path find " + w.id, 1);
  display_notice("[waypoints] walking to " + WP.label(w) + ".", "cyan");
};
// Tags: words of letters, digits, - and _, kept in lower case.
WP.tagWord = function (t) { t = String(t || "").toLowerCase(); return /^[a-z0-9][a-z0-9_-]*$/.test(t) ? t : ""; };
WP.tag = function (w, words) {
  var added = [], bad = [];
  for (var i = 0; i < words.length; i++) {
    var t = WP.tagWord(words[i]);
    if (!t) { bad.push(words[i]); continue; }
    if (w.tags.indexOf(t) < 0) { w.tags.push(t); added.push(t); }
  }
  if (added.length) WP.save();
  if (added.length) display_notice("[waypoints] " + w.name + " tagged " + added.join(", ") + ".", "lime");
  if (bad.length) display_notice("[waypoints] not a tag: " + bad.join(", ") + " (one word each: letters, digits, - and _).", "orange");
  if (!added.length && !bad.length) display_notice("[waypoints] " + w.name + " has those tags already.", "cyan");
};
WP.untag = function (w, words) {
  var gone = [];
  if (words.length === 1 && words[0].toLowerCase() === "all") { gone = w.tags.slice(); w.tags = []; }
  else for (var i = 0; i < words.length; i++) { var t = words[i].toLowerCase(), k = w.tags.indexOf(t); if (k >= 0) { w.tags.splice(k, 1); gone.push(t); } }
  if (gone.length) { WP.save(); display_notice("[waypoints] " + w.name + ": removed tag " + gone.join(", ") + ".", "lime"); }
  else display_notice("[waypoints] " + w.name + " has no such tag" + (w.tags.length ? " (its tags: " + w.tags.join(", ") + ")" : "") + ".", "orange");
};
WP.setView = function (v) {
  WP.view = v === "tag" ? "tag" : "area";
  if (WP.view === "tag") set_variable("waypoints_view", "tag"); else delete_variable("waypoints_view");
  run_function("waypoints_render", [], "waypoints");
};
WP.fold = function (area) {
  WP.folded[area] = !WP.folded[area];
  WP.saveFolded();
  run_function("waypoints_render", [], "waypoints");
};

// The read-only look other packages see through loom: never its variables.
//   look.at(id) -> { name, note } when that room is a waypoint, else undefined.
WP.look = {
  at: function (id) { var w = WP.byId(id); return w ? { name: w.name, note: w.note } : undefined; }
};

// The tab's clicks. Its page shares window with the scripts but can't reach
// client.loom in every Nexus, so these closures carry them.
try {
  window.loomWaypoints = {
    go: function (id) { var w = client.loom.waypoints.byId(id); if (w) client.loom.waypoints.go(w); },
    remove: function (id) { var w = client.loom.waypoints.byId(id); if (w) client.loom.waypoints.remove(w); },
    view: function (v) { client.loom.waypoints.setView(v); },
    fold: function (i) { var g = client.loom.waypoints.areasDrawn || []; if (g[i] !== undefined) client.loom.waypoints.fold(g[i]); },
    // Remembered box: room's own buttons, through loom (link room-waypoints).
    mark: function (what) {
      var L = client.loom.loom, r = (L && L.answer) ? L.answer("waypoints", "waypoints.remembered") : undefined;
      if (r && typeof r[what] == "function") r[what]();
    },
    // ADD HERE: saved under the room's own title (rename by command).
    add: function () { client.loom.waypoints.add(""); }
  };
} catch (e) {}
if (client.loom.notify) client.loom.notify("waypoints");
