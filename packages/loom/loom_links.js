// loom_links -- the integrations catalogue and its on/off switches (#37).
// Run from onLoad and onInstall. Every integration lives in this package
// and registers here with L.addLink; it is on as soon as both of its
// packages are installed, unless the player switched it off. Only the
// switched-off ids are stored (loom_links_off, a JSON list), so an
// integration added in a later version starts on.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.loom) client.loom.loom = {};
var L = client.loom.loom;

// The catalogue: id -> { id, src, dst, desc, issue, change }, plus the ids
// in the order they were added (the order LOOM LINKS lists them in).
// Rebuilt on every load, so a removed integration leaves nothing behind.
L.links = {};
L.linkOrder = [];

// Register an integration. e = { id, src, dst, desc, issue, change }:
// src and dst are package names as in client.loom.registry; change, if
// given, is called with true/false when the player switches the link on or
// off, so the integration can withdraw what it created or redraw a tab.
L.addLink = function (e) {
  if (!e || !e.id) return;
  var id = String(e.id).toLowerCase();
  if (!L.links[id]) L.linkOrder.push(id);
  L.links[id] = { id: id, src: e.src, dst: e.dst, desc: e.desc || "", issue: e.issue || 0, change: e.change };
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
  return true;
};

// Integrations register below, one L.addLink each, as they land in 0.5.
