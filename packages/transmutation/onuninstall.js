// The transmutation_* variables are left intact.
// Leave LOOM and the integrations at once, not at the next load (#137).
if (client.loom && client.loom.transmutation) { client.loom.transmutation.on = false; client.loom.transmutation.want = null; client.loom.transmutation.current = null; client.loom.transmutation.probing = null; }
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("transmutation");
  else delete client.loom.registry.transmutation;
}
