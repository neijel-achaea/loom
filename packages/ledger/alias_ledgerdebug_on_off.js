run_function("lg_build", [], "ledger");
var v = args[1].toLowerCase();
client.lg.debug = (v === "on");
set_variable("lg_debug", client.lg.debug ? "1" : "0");
display_notice("[ledger] debug " + (client.lg.debug ? "ON" : "OFF"), "cyan");
