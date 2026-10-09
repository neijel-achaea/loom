// numpad_movement_setup -- run from onLoad and onInstall. The package is only
// keybindings, so this just registers it (it has no command of its own).
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
client.loom.registry.numpad_movement = { version: "0.2.0", keyword: "" };
if (!client.loom.numpad_movement) client.loom.numpad_movement = {};
