// Every line: while primed and not yet running, one of your own attack lines
// (hunting's patterns, read only) starts the run.
var B = client.loom && client.loom.basher;
if (B && B.on && !B.run && B.isAttack(String(args[1] || ""))) B.begin();
