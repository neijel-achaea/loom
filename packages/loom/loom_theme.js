// loom_theme -- city themes for the custom tabs (#310).
//
// A theme gives every tab one city's palette. It covers each tab's identity
// colours only (accent, headings, text, rules, bar tracks, backgrounds and
// button surfaces); colours that mean something (good, warning, bad,
// standings bands, social groups, the target glow, gold, damage dealt and
// taken) are never themed.
//
// Tabs read client.loom.theme, an object of roles, or null for no theme:
//   var TH = (client.loom && client.loom.theme) || {};
//   var ACC = TH.acc || "#e0b46c";   // the tab's own colour when no theme
// so with no theme, or without loom, every tab looks as it always has.
//
// Roles: acc (accent: titles, big figures), deep (headings, header rules,
// outlines), hi (brightest text), txt (body text), muted, dim, rule (lines
// and borders), track (bar tracks), bg (panel background), panel (button and
// chip fill), edge (button border), sel (selected or highlighted row).
//
// The choice: loom_theme = auto (default: follow the city, from Char.Status),
// off (each tab's own colours) or a city name. loom_city keeps the last city
// seen ("none" when cityless), since Char.Status carries it only at login.
if (!client.loom) client.loom = {};
if (!client.loom.loom) client.loom.loom = {};
var L = client.loom.loom;

L.themes = {
  ashtan:    { label: "Ashtan, purples",       acc: "#b89ae8", deep: "#5b4685", hi: "#f3effa", txt: "#e5e0ee", muted: "#8b8598", dim: "#665f73", rule: "#2a2336", track: "#1e1928", bg: "#110e16", panel: "#1a1621", edge: "#362d45", sel: "#251d33" },
  cyrene:    { label: "Cyrene, blues",         acc: "#7fb0e8", deep: "#3a5f8a", hi: "#eef4fb", txt: "#dde6ef", muted: "#7f8b98", dim: "#5c6875", rule: "#1f2a37", track: "#16202b", bg: "#0c1117", panel: "#151d27", edge: "#2c3a4b", sel: "#172638" },
  eleusis:   { label: "Eleusis, forest greens", acc: "#5fb59a", deep: "#2e6152", hi: "#e6f2ec", txt: "#dce7e0", muted: "#82918a", dim: "#5d6b64", rule: "#1f2e28", track: "#15211c", bg: "#0c1310", panel: "#15201b", edge: "#2b3d35", sel: "#17302a" },
  hashan:    { label: "Hashan, steel greys",   acc: "#aebccb", deep: "#59636f", hi: "#f0f3f6", txt: "#e0e4e8", muted: "#868c94", dim: "#62686f", rule: "#262a30", track: "#1b1e22", bg: "#0f1113", panel: "#181b1f", edge: "#343a42", sel: "#22272e" },
  mhaldor:   { label: "Mhaldor, oxblood reds", acc: "#cf6f86", deep: "#6e2a3a", hi: "#f8ecef", txt: "#ece0e3", muted: "#93838a", dim: "#6e5f65", rule: "#33202a", track: "#24171d", bg: "#140c0f", panel: "#1e1317", edge: "#422a33", sel: "#2e1820" },
  targossas: { label: "Targossas, golds",      acc: "#ecd27e", deep: "#7c6830", hi: "#fbf4dc", txt: "#ebe5d2", muted: "#918a74", dim: "#6b6553", rule: "#2e2919", track: "#221e12", bg: "#13110a", panel: "#1d1a10", edge: "#3b3420", sel: "#2b2612" }
};

// PK MODE's theme (Ricardo, 2026-10-28): while hunting's PK MODE is on,
// every tab takes this palette whatever LOOM THEME says, so it's plain you
// are set for PvP. Hot magenta: no city's hue, and no colour that means
// something (the target's red glow, warnings, good/bad) is near it. Not a
// LOOM THEME choice. L.themePk follows hunting's HU.pk (off at every load).
L.themePkPalette = { label: "PK MODE, hot magenta", acc: "#ff4fa3", deep: "#8a2457", hi: "#ffeef7", txt: "#f1e1ea", muted: "#9a8590", dim: "#71606a", rule: "#3a1d2c", track: "#2a1420", bg: "#160a10", panel: "#22101a", edge: "#4d2338", sel: "#381427" };
L.themePk = !!(client.loom.hunting && client.loom.hunting.pk);
L.themeSetPk = function (on) {
  on = !!on;
  if (on === L.themePk) return false;
  L.themePk = on;
  return L.themeApply();
};

// The saved choice: "auto", "off" or a city.
L.themeChoice = function () {
  var c = String(get_variable("loom_theme") || "auto").toLowerCase();
  return (c === "off" || L.themes[c]) ? c : "auto";
};

// The city whose theme is in use, or "" for none.
L.themeName = function () {
  if (L.themePk) return "pk";
  var c = L.themeChoice();
  if (c === "off") return "";
  if (c === "auto") c = String(get_variable("loom_city") || "").toLowerCase();
  return L.themes[c] ? c : "";
};

// Publish the theme and, when it changed, redraw every tab.
L.themeApply = function () {
  var n = L.themeName();
  var t = null;
  var pal = n === "pk" ? L.themePkPalette : L.themes[n];
  if (n && pal) {
    t = {};
    for (var k in pal) if (k !== "label") t[k] = pal[k];
  }
  client.loom.theme = t;
  if (n === (L.themeNow || "")) return false;
  L.themeNow = n;
  var reg = client.loom.registry || {};
  for (var p in reg) if (reg[p] && typeof reg[p].redraw === "function" && L.redraw) L.redraw(p);
  return true;
};

// Char.Status gives the city as "Eleusis (12)", "Eleusis" or "(none)".
L.themeSeeCity = function (raw) {
  var c = String(raw || "").replace(/\s*\(.*\)\s*$/, "").trim().toLowerCase() || "none";
  if (c === (String(get_variable("loom_city") || "").toLowerCase())) return;
  set_variable("loom_city", c);
  L.themeApply();
};

L.themeApply();
