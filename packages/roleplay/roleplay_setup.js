// roleplay_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, one-time migration of
// aem_on, and the class the emotes follow.
//
// The emotes choose their wording by class (a dragon's are different), from
// client.loom.roleplay.cls: Char.Status's class, kept in roleplay_class
// because the game sends it only at login and when it changes.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.roleplay) client.loom.roleplay = {};
client.loom.registry.roleplay = { version: "0.2.2", keyword: "ROLEPLAY", desc: "{{description}}" };
var RP = client.loom.roleplay;
function rpGet(n) { var v; try { v = get_variable(n); } catch (e) { v = undefined; } return (v === undefined || v === null || ("" + v) === "undefined") ? "" : "" + v; }

// One-time migration: aem_on -> roleplay_aem_on.
var rpOld = rpGet("aem_on");
if (rpOld !== "") {
  if (rpGet("roleplay_aem_on") === "") set_variable("roleplay_aem_on", rpOld);
  delete_variable("aem_on");
}
// The class: the one kept, or loom's activeClass the first time (read only).
if (RP.cls === undefined) {
  RP.cls = rpGet("roleplay_class") || rpGet("activeClass");
  if (RP.cls) set_variable("roleplay_class", RP.cls);
}
// The old engine lived at window.AEM; stop it so it doesn't keep emoting
// alongside the new one after a reimport.
if (typeof window !== "undefined" && window.AEM) {
  try { clearTimeout(window.AEM.timer); } catch (e) {}
  window.AEM = null;
}
