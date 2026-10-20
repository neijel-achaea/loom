// vision_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, defaults.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.vision) client.loom.vision = {};
client.loom.registry.vision = { version: "0.2.3", keyword: "VISION", desc: "{{description}}" };
if (!get_variable("vision_on")) set_variable("vision_on", "on");
if (!get_variable("vision_hide")) set_variable("vision_hide", "on");
if (!get_variable("vision_alert")) set_variable("vision_alert", "on");
// Where enemy alerts go: any channel command that takes text (pt, clt3, ...).
if (!get_variable("vision_channel")) set_variable("vision_channel", "pt");
