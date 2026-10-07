run_function("tal_ensure", [], "talismans");
var a = args[1] || "";
if (a === "on") { client.talGraphOn = true; }
else if (a === "off") { client.talGraphOn = false; }
else { client.talGraphOn = !client.talGraphOn; }
try { set_variable("tal_graph_on", client.talGraphOn ? "1" : "0"); } catch (e) {}
run_function("tal_render", [], "talismans");
display_notice("[talismans] panel graph " + (client.talGraphOn ? "shown" : "hidden") + ".", "cyan");