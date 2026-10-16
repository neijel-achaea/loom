// "The magical shield surrounding <mob> fades away.": attack it again.
var B = client.loom && client.loom.basher;
if (B && B.shieldDown) B.shieldDown(args[1]);
