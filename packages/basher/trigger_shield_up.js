// "A nearly invisible magical shield forms around <mob>.": hold attacks on it.
var B = client.loom && client.loom.basher;
if (B && B.shieldUp) B.shieldUp(args[1]);
