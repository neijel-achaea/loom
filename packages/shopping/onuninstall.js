// The shopping_* variables are left intact.
if (client.loom && client.loom.shopping) { client.loom.shopping.q = null; client.loom.shopping.choices = null; }
// Leave LOOM and the integrations at once, not at the next load (#137).
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("shopping");
  else delete client.loom.registry.shopping;
}
