// Stop the loop, so nothing is sent once the package is gone.
var B = client.loom && client.loom.basher;
if (B && B.loop) { clearInterval(B.loop); B.loop = null; }
if (B) { B.on = false; B.run = false; }
// F1 back to hunting's own key, if it was the STOP key.
if (client.loom && client.loom.registry && client.loom.registry.hunting) { try { run_function("hunting_buttons", [], "hunting"); } catch (e) {} }
// Leave LOOM and the integrations at once, not at the next load (#137):
// loom takes the entry out and redraws the tabs that showed this package's answers.
if (client.loom && client.loom.registry) {
  if (typeof client.loom.gone == "function") client.loom.gone("basher");
  else delete client.loom.registry.basher;
}
