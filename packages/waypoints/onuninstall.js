// The waypoints_* variables are left intact.
// Leave LOOM and the integrations at once, not at the next load (#137).
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("waypoints");
  else delete client.loom.registry.waypoints;
}
