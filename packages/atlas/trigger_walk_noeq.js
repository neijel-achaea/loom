// "You are recovering equilibrium and cannot move yet.": a step sent off
// equilibrium (after a warp). While Atlas walks, the line is hidden and the
// walk waits: the game makes the move itself once equilibrium is back.
if (!client.loom || !client.loom.atlas || !client.loom.atlas.look) run_function("atlas_setup", [], "atlas");
if (client.loom.atlas.walk) { gag_current_line(); client.loom.atlas.walkNoEq(); }
