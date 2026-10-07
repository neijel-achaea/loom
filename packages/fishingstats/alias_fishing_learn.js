run_function("fsh_ensure", [], "fishingstats");
var a = args[1] || "";
if (a === "show") {
  var buf = client.fshBuf || [];
  display_notice("[fishingstats] " + buf.length + " line(s) captured:", "cyan");
  for (var i = 0; i < buf.length; i++) { display_notice("| " + buf[i], "yellow"); }
} else if (a === "clear") {
  client.fshBuf = [];
  display_notice("[fishingstats] buffer cleared.", "cyan");
} else {
  if (a === "on") { client.fshLearn = true; }
  else if (a === "off") { client.fshLearn = false; }
  else { client.fshLearn = !client.fshLearn; }
  if (client.fshLearn) { client.fshBuf = []; }
  display_notice("[fishingstats] capture " + (client.fshLearn ? "ON. Catch a fish, have someone else catch one, then FPLEARN OFF and FPLEARN SHOW." : "off. FPLEARN SHOW dumps what was captured."), "cyan");
}