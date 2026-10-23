// vials_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, and your vials: which vial
// holds which elixir (vials_map, a JSON object of elixir -> vial number).
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.vials) client.loom.vials = {};
client.loom.registry.vials = { version: "0.2.4", keyword: "VIALS", desc: "{{description}}" };
var VI = client.loom.vials;
if (!VI.map) {
  var viRaw;
  try { viRaw = get_variable("vials_map"); } catch (e) { viRaw = undefined; }
  try { VI.map = JSON.parse(viRaw) || {}; } catch (e) { VI.map = {}; }
  if (Object.prototype.toString.call(VI.map) !== "[object Object]") VI.map = {};
}
// Sips and months per elixir from the last VIALS LEARN (vials_info), shown by
// VIALS; vials set by hand have none.
if (!VI.info) {
  try { VI.info = JSON.parse(get_variable("vials_info") || "{}") || {}; } catch (e) { VI.info = {}; }
}
if (VI.learn === undefined) VI.learn = null;
