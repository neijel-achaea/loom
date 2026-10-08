var P = client.loom.patrolling;
display_notice("[patrolling] " + String(get_variable("patrolling_on")).toUpperCase()
  + ", clan " + (get_variable("patrolling_clan") || "none")
  + ", god " + (get_variable("patrolling_god") || "none (every shrine flagged)")
  + ", here: " + (P.room.area || "?") + " / " + (P.room.env || "?") + ". PATROLLING HELP for commands.", "cyan");
