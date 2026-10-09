// vials_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, and your vials: which vial
// holds which elixir (vials_map, a JSON object of elixir -> vial number).
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.vials) client.loom.vials = {};
client.loom.registry.vials = { version: "0.2.1", keyword: "VIALS", desc: "{{description}}" };
var VI = client.loom.vials;
if (!VI.map) {
  var viRaw;
  try { viRaw = get_variable("vials_map"); } catch (e) { viRaw = undefined; }
  try { VI.map = JSON.parse(viRaw) || {}; } catch (e) { VI.map = {}; }
  if (Object.prototype.toString.call(VI.map) !== "[object Object]") VI.map = {};
}
