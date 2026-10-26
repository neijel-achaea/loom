// The quests_* variables are left intact; the tab's minute clock stops.
if (client.loom && client.loom.quests && client.loom.quests.clock) { clearInterval(client.loom.quests.clock); client.loom.quests.clock = null; }
// Leave LOOM and the integrations at once, not at the next load (#137).
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("quests");
  else delete client.loom.registry.quests;
}
