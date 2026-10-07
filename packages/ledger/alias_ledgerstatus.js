run_function("lg_build", [], "ledger");
var items = [];
try { items = JSON.parse(get_variable("lg_items")) || []; } catch (e) { items = []; }
display_notice("[ledger] day " + client.lg.day + " | items " + items.length + " | seq " + get_variable("lg_seq") + " | armed " + (client.lg.armed ? "yes" : "no") + " | inblock " + (client.lg.inBlock ? "yes" : "no") + " | debug " + (client.lg.debug ? "ON" : "OFF"), "cyan");
