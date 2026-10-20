// loom_packages -- which Loom packages are really installed. The registry
// keeps a package until the next page load, even after it was uninstalled,
// so LOOM and LOOM UPDATES check Nexus's own package list when it has one
// (client._packages, as LOOM PERF reads it) and fall back to the registry.
// Retired packages still installed are named, so the player can remove them.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.loom) client.loom.loom = {};
var L = client.loom.loom;

// Retired package -> the one that replaced it ("" when none did). Only the
// packages Loom itself retired with 0.1.0 of magi: a player's own package
// may carry any other name (roleplay is free again, for #262 and for
// players' own).
L.retired = { crystalism: "magi", artificing: "magi", elementalism: "" };

// Nexus's package names as registry keys ("numpad movement" ->
// "numpad_movement"), or null when this Nexus doesn't offer the list.
L.nexusPackages = function () {
  try {
    var pls = client._packages.list();
    if (!pls || typeof pls.length != "number") return null;
    var out = {};
    for (var i = 0; i < pls.length; i++) out[String(pls[i].name || "").toLowerCase().replace(/\s+/g, "_")] = true;
    return out;
  } catch (e) { return null; }
};

// The registered packages that are installed now, retired ones left out.
L.installed = function () {
  var reg = client.loom.registry || {}, nx = L.nexusPackages(), out = [];
  for (var n in reg) {
    if (!reg.hasOwnProperty(n) || L.retired.hasOwnProperty(n)) continue;
    if (!nx || nx[n]) out.push(n);
  }
  return out.sort();
};

// Retired packages still installed: [{ name, by }]. Only Loom's own copy
// counts: it must have registered this page (a player's package of the same
// name doesn't), and, when Nexus's list is there, still be installed.
L.retiredHere = function () {
  var reg = client.loom.registry || {}, nx = L.nexusPackages(), out = [];
  for (var n in L.retired) {
    if (!L.retired.hasOwnProperty(n)) continue;
    if (reg[n] && (!nx || nx[n])) out.push({ name: n, by: L.retired[n] });
  }
  return out;
};
