var g = args[1].toLowerCase(), n = args[2].toLowerCase();
if (client.hl[g]) { client.hl[g][n] = true; client.hl.save(g); display_notice("[social] +" + n + " -> " + g, "cyan"); }
else display_notice("[social] no group: " + g, "cyan");