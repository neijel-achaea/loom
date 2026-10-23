// The social_* variables are left intact; the QW poll and its safety timer stop.
if (client.loom && client.loom.social && client.loom.social.timer) { clearInterval(client.loom.social.timer); client.loom.social.timer = null; }
if (client.loom && client.loom.social && client.loom.social.safetyT) { clearTimeout(client.loom.social.safetyT); client.loom.social.safetyT = null; }
// Leave LOOM and the integrations at once, not at the next load (#137):
// loom takes the entry out and redraws the tabs that showed this package's answers.
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("social");
  else delete client.loom.registry.social;
}
