// Nothing to tear down but the registry entry.
// Leave LOOM and the integrations at once, not at the next load (#137):
// loom takes the entry out and redraws the tabs that showed this package's answers.
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("numpad_movement");
  else delete client.loom.registry.numpad_movement;
}
