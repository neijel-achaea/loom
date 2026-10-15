var P = client.loom.patrolling;
display_notice("[patrolling] " + String(get_variable("patrolling_on")).toUpperCase()
  + ", clan " + (get_variable("patrolling_clan") || "none")
  + ", gods " + (function () { var f = 0, h = 0; for (var g in (P.gods || {})) { if (P.gods.hasOwnProperty(g)) { if (P.gods[g] === "hostile") h++; else f++; } } return f + " friendly, " + h + " hostile"; })()
  + ", here: " + (P.room.area || "?") + " / " + (P.room.env || "?") + ". PATROLLING HELP for commands.", "cyan");
