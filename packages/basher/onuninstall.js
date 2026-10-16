// Stop the loop, so nothing is sent once the package is gone.
var B = client.loom && client.loom.basher;
if (B && B.loop) { clearInterval(B.loop); B.loop = null; }
if (B) B.on = false;
