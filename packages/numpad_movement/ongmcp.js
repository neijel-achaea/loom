// Registers the package on the first GMCP message after an import, as the
// packages with commands do; Nexus doesn't run onInstall when importing over
// an existing package, and this one has nothing else that runs.
if (!client.loom || !client.loom.registry || !client.loom.registry.numpad_movement) run_function("numpad_movement_setup", [], "numpad_movement");
