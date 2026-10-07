var g = args[1].toLowerCase(), n = args[2].toLowerCase();
if (client.hl[g] && client.hl[g][n]) { delete client.hl[g][n]; client.hl.save(g); display_notice("[social] -" + n + " from " + g, "cyan"); }