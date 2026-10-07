// Builds client.self (live state), client.selfWant (watched defences) and
// client.selfKeep (afflictions kept on purpose) once; safe to call often.
function siList(name, def) {
  var raw;
  try { raw = get_variable(name); } catch (e) { raw = undefined; }
  var str = (raw === undefined || raw === null) ? def : String(raw);
  var out = {};
  var parts = str.split(",");
  for (var i = 0; i < parts.length; i++) { var n = parts[i].replace(/^\s+|\s+$/g, "").toLowerCase(); if (n) { out[n] = true; } }
  return out;
}
if (!client.self) { client.self = { affs: {}, defs: {}, lost: {}, stats: [], statsKey: "", info: {}, score: {}, needDiag: false, seenAffs: false, seenDefs: false }; }
if (!client.self.score) { client.self.score = {}; }
// Watched defences are kept per class (dragonform counts as its own class),
// in self_want_<class>. A class with no list yet starts from the old shared
// list, so nothing set before this change is lost.
var siCls = String((client.self.info && client.self.info["class"]) || "any").toLowerCase().replace(/[^a-z0-9]+/g, "_");
if (!client.selfWant || client.selfWantCls !== siCls) {
  var siRaw;
  try { siRaw = get_variable("self_want_" + siCls); } catch (e) { siRaw = undefined; }
  client.selfWant = (siRaw === undefined || siRaw === null) ? siList("self_want", "") : siList("self_want_" + siCls, "");
  client.selfWantCls = siCls;
}
if (!client.selfKeep) { client.selfKeep = siList("self_keep", "deafness,blindness,insomnia"); }