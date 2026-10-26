// waypoints_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Waypoints (#369): rooms you save by number
// with a name you give them (and an optional note), listed by area in the
// Waypoints tab; a click walks you there with PATH FIND.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.waypoints) client.loom.waypoints = {};
client.loom.registry.waypoints = { version: "0.1.0", keyword: "WAYPOINTS", desc: "{{description}}",
  redraw: function () { run_function("waypoints_render", [], "waypoints"); } };
var WP = client.loom.waypoints;

// Saved: waypoints_list = [{ id, name, note, room, area, env, at }], where
// room, area and env are the game's, read when the waypoint was added;
// waypoints_folded = [area, …], the areas folded in the tab. A variable that
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
  WP.list.push({ id: String(wpE.id), name: String(wpE.name).trim(), note: String(wpE.note || ""), room: String(wpE.room || ""), area: String(wpE.area || ""), env: String(wpE.env || ""), at: Number(wpE.at) || 0 });
}
WP.folded = {};
var wpF = WP.readList("waypoints_folded");
for (var wpJ = 0; wpJ < wpF.length; wpJ++) if (typeof wpF[wpJ] == "string") WP.folded[wpF[wpJ]] = true;
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
  if (!name) { display_notice("[waypoints] WAYPOINTS ADD <name> saves the room you're in.", "orange"); return; }
  var had = WP.byId(H.id);
  if (had) { display_notice("[waypoints] this room is saved already, as " + had.name + ". WAYPOINTS RENAME " + had.name + " <new name> to rename it.", "orange"); return; }
  if (/^\d+$/.test(name)) { display_notice("[waypoints] give it a name, not a number: the number is the room's.", "orange"); return; }
  if (WP.byName(name)) { display_notice("[waypoints] " + WP.byName(name).name + " is taken: pick another name.", "orange"); return; }
  WP.list.push({ id: H.id, name: name, note: "", room: H.name, area: H.area, env: H.env, at: Date.now() });
  WP.save();
  display_notice("[waypoints] saved " + name + " (" + H.id + ", " + (H.name || "?") + (H.area ? ", " + H.area : "") + ").", "lime");
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
    fold: function (i) { var g = client.loom.waypoints.areasDrawn || []; if (g[i] !== undefined) client.loom.waypoints.fold(g[i]); },
    // Remembered box: room's own buttons, through loom (link room-waypoints).
    mark: function (what) {
      var L = client.loom.loom, r = (L && L.answer) ? L.answer("waypoints", "waypoints.remembered") : undefined;
      if (r && typeof r[what] == "function") r[what]();
    },
    // ADD HERE: "waypoints add " in the input line, for the name.
    add: function () {
      var inp = window.loomWaypoints.input();
      if (!inp) { display_notice("[waypoints] couldn't find the input line: type WAYPOINTS ADD <name>.", "orange"); return; }
      var v = "waypoints add ";
      try {
        var desc = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(inp), "value");
        if (desc && desc.set) desc.set.call(inp, v); else inp.value = v;
      } catch (e) { inp.value = v; }
      try { inp.dispatchEvent(new Event("input", { bubbles: true })); } catch (e) {}
      try { inp.focus(); inp.setSelectionRange(v.length, v.length); } catch (e) {}
    },
    input: function () {
      var ids = ["userinput", "user_input", "input", "command_input"];
      for (var i = 0; i < ids.length; i++) {
        var e = document.getElementById(ids[i]);
        if (e && (e.tagName === "TEXTAREA" || e.tagName === "INPUT")) return e;
      }
      var li = window.loomWaypointsLastInput;
      if (li && li.isConnected && li.offsetParent !== null) return li;
      var sels = ["textarea", "input[type=text], input:not([type])"];
      for (var s = 0; s < sels.length; s++) {
        var all = document.querySelectorAll(sels[s]);
        for (var j = 0; j < all.length; j++) { if (all[j].offsetParent !== null) return all[j]; }
      }
      return null;
    }
  };
  if (!window.loomWaypointsFocus) {
    window.loomWaypointsFocus = true;
    document.addEventListener("focusin", function (ev) {
      var t = ev.target;
      if (t && (t.tagName === "TEXTAREA" || (t.tagName === "INPUT" && (!t.type || t.type === "text")))) window.loomWaypointsLastInput = t;
    }, true);
  }
} catch (e) {}
if (client.loom.notify) client.loom.notify("waypoints");
