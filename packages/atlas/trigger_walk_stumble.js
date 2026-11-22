// "You stumble through the fog, attempting to find a way out.": fog made the
// step fail (Ricardo). While Atlas walks, the same step is tried again, or,
// if the fog put you elsewhere, the walk goes on from there. Shown as it is.
if (!client.loom || !client.loom.atlas || !client.loom.atlas.look) run_function("atlas_setup", [], "atlas");
if (client.loom.atlas.walk) client.loom.atlas.walkStumble();
