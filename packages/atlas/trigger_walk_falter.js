// "Your concentration falters, and the nacreous vapour surrounding you
// unravels into thin ribbons.": TOUCH HOURGLASS broke off. While Atlas walks
// through it, Loom is unpaused and the walk goes another way. Shown as it is.
if (!client.loom || !client.loom.atlas || !client.loom.atlas.look) run_function("atlas_setup", [], "atlas");
if (client.loom.atlas.walk) client.loom.atlas.walkFalter();
