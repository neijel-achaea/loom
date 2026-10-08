var D = client.loom.defcon;
run_function("defcon_table", [], "defcon");
var dcStored = get_variable("defcon_level");
display_notice("[defcon] DEFCON " + ((dcStored === null || dcStored === undefined) ? "5 (default, not applied yet)" : dcStored)
  + ", class " + D.tbl.name + (D.tbl.known ? "" : " (not configured: general defences)")
  + ", autoup " + String(get_variable("defcon_autoup")).toUpperCase() + ". DEFCON HELP for commands.", "cyan");
