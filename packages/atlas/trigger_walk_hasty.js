// "Now now, don't be so hasty!": the game refused a step for moving too fast
// (celerity: the number of rooms you can move in a burst, 2 for most, more
// for some races and gear). While Atlas walks its route the line is hidden
// and the same step sent again a moment later; moving by hand, it shows.
if (!client.loom || !client.loom.atlas || !client.loom.atlas.look) run_function("atlas_setup", [], "atlas");
if (client.loom.atlas.walk) { gag_current_line(); client.loom.atlas.walkHasty(); }
