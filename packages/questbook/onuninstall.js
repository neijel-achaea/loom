// The quests_* variables are left intact; the tab's minute clock stops.
if (client.loom && client.loom.questbook && client.loom.questbook.clock) { clearInterval(client.loom.questbook.clock); client.loom.questbook.clock = null; }
// Leave LOOM and the integrations at once, not at the next load (#137).
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("questbook");
  else delete client.loom.registry.questbook;
}
