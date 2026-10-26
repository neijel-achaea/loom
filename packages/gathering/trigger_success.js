// A gather succeeded: harvesting's own wording for most materials, its own
// lines for clay and dust. Only ours if gathering sent the GATHER.
if (client.loom && client.loom.gathering && client.loom.gathering.success) client.loom.gathering.success();
