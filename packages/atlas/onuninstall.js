// The atlas_* variables and the map cached in this browser are left intact.
// Leave LOOM and the integrations at once, not at the next load (#137).
if (client.loom && client.loom.atlas && client.loom.atlas.drawT) { clearTimeout(client.loom.atlas.drawT); client.loom.atlas.drawT = null; }
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("atlas");
  else delete client.loom.registry.atlas;
}
