// Register with loom (the package has no command of its own). Done here
// directly: the package is named "numpad movement", with a space.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
client.loom.registry.numpad_movement = { version: "1.0.0", keyword: "", desc: "{{description}}" };
