// The remedies_* variables are left intact.
if (client.loom && client.loom.remedies) { client.loom.remedies.run = null; client.loom.remedies.reading = null; }
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("remedies");
  else delete client.loom.registry.remedies;
}
