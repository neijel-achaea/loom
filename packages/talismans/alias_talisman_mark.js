run_function("tal_ensure", [], "talismans");
client.talForceMark = true;
run_function("tal_sync", [], "talismans");
display_notice("[talismans] history point recorded (" + (client.talNowC + client.talNowR) + " pieces).", "cyan");