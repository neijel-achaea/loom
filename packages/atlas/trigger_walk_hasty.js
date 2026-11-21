// "Now now, don't be so hasty!": the game refused a step for moving too fast
// (celerity lets a couple of quick steps through, then slows you). While
// Atlas walks its route, the same step is sent again a moment later.
// Shown as it is.
if (!client.loom || !client.loom.atlas || !client.loom.atlas.look) run_function("atlas_setup", [], "atlas");
if (client.loom.atlas.walk) client.loom.atlas.walkHasty();
