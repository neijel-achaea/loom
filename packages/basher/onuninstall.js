// Stop the loop, so nothing is sent once the package is gone.
var B = client.loom && client.loom.basher;
if (B && B.loop) { clearInterval(B.loop); B.loop = null; }
if (B) { B.on = false; B.run = false; }
// F1 back to hunting's own key, if it was the STOP key.
if (client.loom && client.loom.registry && client.loom.registry.hunting) { try { run_function("hunting_buttons", [], "hunting"); } catch (e) {} }
