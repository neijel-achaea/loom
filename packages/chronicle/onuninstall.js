// The chronicle_* variables are left intact; what's unsaved is saved now.
if (client.loom && client.loom.chronicle) {
  var crU = client.loom.chronicle;
  if (crU.saveT) { clearTimeout(crU.saveT); crU.saveT = null; if (crU.save) crU.save(); }
  if (crU.drawT) { clearTimeout(crU.drawT); crU.drawT = null; }
  if (crU.retryT) { clearTimeout(crU.retryT); crU.retryT = null; }
  crU.queue = [];
  crU.capt = null;
}
// Leave LOOM and the integrations at once, not at the next load (#137).
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("chronicle");
  else delete client.loom.registry.chronicle;
}
