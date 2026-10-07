run_function("fsh_ensure", [], "fishingstats");
var who = args[1] || "";
var hex = args[2] || "";
if (!who) {
  var listed = [];
  var q;
  for (q in client.fsh.anglers) { if (client.fsh.anglers.hasOwnProperty(q)) { listed.push(q + " " + (client.fshCol[q] || "default")); } }
  display_notice("[fishingstats] colours: " + (listed.length ? listed.join(", ") : "none yet") + ". Usage: fpcolour Oceana #e8a13f, or fpcolour Oceana reset.", "cyan");
} else if (!hex) {
  display_notice("[fishingstats] " + who + " is " + (client.fshCol[who] || "on the default palette") + ". Give a hex value like #e8a13f, or reset.", "cyan");
} else {
  if (hex === "reset") { client.fshCol[who] = null; }
  else { client.fshCol[who] = hex; }
  try { set_variable("fsh_colours", JSON.stringify(client.fshCol)); } catch (e) {}
  run_function("fsh_render", [], "fishingstats");
  display_notice("[fishingstats] " + who + " is now " + (hex === "reset" ? "back on the default palette" : hex) + ".", "cyan");
}