// Nothing to tear down; the dmgchart_* variables are left intact.
// Leave LOOM and the integrations at once, not at the next load (#137):
// loom takes the entry out and redraws the tabs that showed this package's answers.
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("dmgchart");
  else delete client.loom.registry.dmgchart;
}
