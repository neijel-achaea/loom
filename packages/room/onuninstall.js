// The tar watcher stops with the package; room_name, room_desc, room_probe and room_loyal_ignore are left
// intact.
if (client.loom && client.loom.room && client.loom.room.tarWatch) { clearInterval(client.loom.room.tarWatch); client.loom.room.tarWatch = null; }
if (client.loom && client.loom.room) { clearTimeout(client.loom.room.probeT); clearTimeout(client.loom.room.probeLater); client.loom.room.probing = null; client.loom.room.probeQ = []; }
// Leave LOOM and the integrations at once, not at the next load (#137):
// loom takes the entry out and redraws the tabs that showed this package's answers.
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("room");
  else delete client.loom.registry.room;
}
