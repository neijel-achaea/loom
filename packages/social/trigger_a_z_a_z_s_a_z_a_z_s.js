if (client.hl && client.hl.capturing) {
  var parts = args[1].split(",");
  for (var i = 0; i < parts.length; i++) {
    var nm = parts[i].trim().toLowerCase();
    if (nm.length && nm !== "none") client.hl.enemies[nm] = true;
  }
}