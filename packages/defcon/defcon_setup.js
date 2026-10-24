// defcon_setup -- run from onLoad and onInstall, and by any reflex that finds
// the namespace missing. Namespace, registry, class tables, defaults.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.defcon) client.loom.defcon = {};
client.loom.registry.defcon = { version: "1.0.0", keyword: "DEFCON", desc: "{{description}}" };

var D = client.loom.defcon;

// Class tables: defcon_classes.js and classes/*.js.
run_function("defcon_classes", [], "defcon");

if (!D.queue) D.queue = [];

// Class: followed from GMCP in onGMCP, and kept in defcon_class because the
// game sends Char.Status only at login and on a change. The first time,
// loom's old activeClass seeds it (read only).
if (!D.cls) D.cls = get_variable("defcon_class") || get_variable("activeClass") || "";
if (D.cls && !get_variable("defcon_class")) set_variable("defcon_class", D.cls);

// DEFCON INIT on the first class message of each session (the old package
// sent INITDEF on every load). On unless switched off. Until 0.4.0 this was
// defcon_autoup: carried over once.
var dcAu = get_variable("defcon_autoup");
if (dcAu !== null && dcAu !== undefined) {
  if (!get_variable("defcon_autoinit")) set_variable("defcon_autoinit", String(dcAu));
  delete_variable("defcon_autoup");
}
if (!get_variable("defcon_autoinit")) set_variable("defcon_autoinit", "on");

// The read-only look other packages see through loom (#176): never its
// variables. Defined on every run.
//   look.wanted() -> { level, table, defs } at the current class's DEFCON
//     level: defs are the defences of the effective table (defaults plus
//     your changes) with a tier >= the level, the ones DEFCON keeps up.
//     undefined while no table is loaded or no level is set in this class.
// Some defences go by one name in curing (the table's) and another in the
// game's defence list (GMCP, DEF): the look reports the defence-list name,
// so Self can match it. Add pairs here as they turn up.
D.defNames = { mass: "density" };
D.look = {
  wanted: function () {
    if (!D.tbl || !D.tbl.defs || D.level === undefined || D.level === null) return undefined;
    var out = [];
    for (var i = 0; i < D.tbl.defs.length; i++) {
      if (D.tbl.defs[i][1] < D.level) continue;
      var nm = String(D.tbl.defs[i][0]).toLowerCase();
      out.push(D.defNames[nm] || nm);
    }
    return { level: D.level, table: D.tbl.name, defs: out };
  }
};
