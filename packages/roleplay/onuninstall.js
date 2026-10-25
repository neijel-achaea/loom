// Stop the ambient emotes; the roleplay_* variables are left intact.
if (client.loom && client.loom.roleplay) {
  try { clearTimeout(client.loom.roleplay.timer); } catch (e) {}
  client.loom.roleplay.on = false;
}
// Leave LOOM and the integrations at once, not at the next load (#137).
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("roleplay");
  else delete client.loom.registry.roleplay;
}
