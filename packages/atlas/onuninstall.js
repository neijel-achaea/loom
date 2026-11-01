// The atlas_* variables and the map cached in this browser are left intact.
// Leave LOOM and the integrations at once, not at the next load (#137).
if (client.loom && client.loom.atlas && client.loom.atlas.syncT) { clearTimeout(client.loom.atlas.syncT); client.loom.atlas.syncT = null; }
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("atlas");
  else delete client.loom.registry.atlas;
}
