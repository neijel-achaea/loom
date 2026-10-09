var D = client.loom.defcon;
run_function("defcon_table", [], "defcon");
display_notice("[defcon] DEFCON " + ((D.level === null || D.level === undefined) ? "5 (default, not applied yet in this class)" : D.level)
  + ", class " + D.tbl.name + (D.tbl.known ? "" : " (not configured yet: general defences)")
  + ", autoup " + String(get_variable("defcon_autoup")).toUpperCase() + ". DEFCON HELP for commands.", "cyan");
