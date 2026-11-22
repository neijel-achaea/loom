// "There is no wormhole here.": the crowdmap has one the game doesn't.
// While Atlas walks through it, the wormhole is marked broken at once and the
// walk goes another way (Ricardo). Shown as it is.
if (!client.loom || !client.loom.atlas || !client.loom.atlas.look) run_function("atlas_setup", [], "atlas");
if (client.loom.atlas.walk) client.loom.atlas.walkNoWorm();
