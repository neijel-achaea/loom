// The tar watcher stops with the package; room_name and room_desc are left
// intact.
if (client.loom && client.loom.room && client.loom.room.tarWatch) { clearInterval(client.loom.room.tarWatch); client.loom.room.tarWatch = null; }
