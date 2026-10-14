// defcon_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, class tables, defaults.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.defcon) client.loom.defcon = {};
client.loom.registry.defcon = { version: "0.3.27", keyword: "DEFCON", desc: "{{description}}" };

var D = client.loom.defcon;

// Class tables: defcon_classes.js and classes/*.js.
run_function("defcon_classes", [], "defcon");

if (!D.queue) D.queue = [];

// Class: followed from GMCP in onGMCP, and kept in defcon_class because the
// game sends Char.Status only at login and on a change. The first time,
// loom's old activeClass seeds it (read only).
if (!D.cls) D.cls = get_variable("defcon_class") || get_variable("activeClass") || "";
if (D.cls && !get_variable("defcon_class")) set_variable("defcon_class", D.cls);

// DEFCON UP on the first class message of each session (the old package sent
// INITDEF on every load). On unless switched off.
if (!get_variable("defcon_autoup")) set_variable("defcon_autoup", "on");
