var p = client.patrol;
if (p) {
  if (p.learn) {
    p.learn = false;
    display_notice('[patrolling] onLoad entry ->  "' + (p.env || "unknown") + '": ' + JSON.stringify(p.present) + ',');
  } else {
    var env = p.env || "unknown";
    var exp = p.expected[env];
    var out = [];
    var color = "#55ff55";                 // green = all good
    if (!exp) {
      out.push("no expected list for '" + env + "' — add one in onLoad");
      color = "#ffcc55";                   // amber = environment not in your table yet
    } else {
      var missing = exp.filter(function (x) { return p.present.indexOf(x) < 0; });
      if (missing.length) { out.push("missing " + missing.join(", ")); color = "#ff5555"; }  // red
      else out.push("all present");
    }
    if (p.shrines.length) { out.push("SHRINE/TOTEM: " + p.shrines.join(" ; ")); color = "#ff5555"; }
    display_notice("[patrolling] Patrol [" + env + "]: " + out.join("  |  "), color);
  }
}