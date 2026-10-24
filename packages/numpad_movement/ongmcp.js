// Registers the package on the first GMCP message after an import; Nexus
// doesn't run onInstall when importing over an existing package.
if (!client.loom || !client.loom.registry || !client.loom.registry.numpad_movement) {
  if (!client.loom) client.loom = {};
  if (!client.loom.registry) client.loom.registry = {};
  client.loom.registry.numpad_movement = { version: "1.0.0", keyword: "", desc: "{{description}}" };
}
