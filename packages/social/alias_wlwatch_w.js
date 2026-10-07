var g = args[1].toLowerCase();
if (!client.wl) { display_notice("[social] not ready yet - trigger any line to build", "cyan"); }
else if (client.wl.watch[g] === undefined) { display_notice("[social] no such group: " + g, "cyan"); }
else { client.wl.watch[g] = true; client.wl.saveWatch(); display_notice("[social] now watching " + g, "cyan"); }