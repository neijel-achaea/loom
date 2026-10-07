if (client.wl && client.wl.timer) clearInterval(client.wl.timer);
client.wl = null;
display_notice("[social] cleared - rebuilds on next line (run LOOK if idle)", "cyan");