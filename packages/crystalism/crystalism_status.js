if (!client.loom || !client.loom.crystalism || !client.loom.crystalism.shapes) run_function("crystalism_setup", [], "crystalism");
var CR = client.loom.crystalism;
display_notice("[crystalism] refine " + (CR.state === "idle" ? "idle" : CR.state + (CR.queue.length ? " (" + CR.queue.length + " commands left)" : ""))
  + ", pearl pickup " + String(get_variable("crystalism_pearls")).toUpperCase()
  + ", portal for city members " + String(get_variable("crystalism_portal")).toUpperCase() + ", minimum " + CR.defMin + " a shape. CRYSTALISM HELP for commands.", "cyan");
