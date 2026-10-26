// The gathering_* variables are left intact.
// Leave LOOM and the integrations at once, not at the next load (#137).
if (client.loom && client.loom.gathering) { client.loom.gathering.on = false; client.loom.gathering.queue = []; client.loom.gathering.current = null; }
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("gathering");
  else delete client.loom.registry.gathering;
}
