run_function("fsh_ensure", [], "fishingstats");
if ((args[1] || "") === "confirm") {
  client.fshLog = [];
  try { set_variable("fsh_log", "[]"); } catch (e) {}
  run_function("fsh_log_render", [], "fishingstats");
  display_notice("[fishingstats] session log cleared. The current session is untouched.", "red");
} else {
  display_notice("[fishingstats] this clears ALL filed sessions. Type 'fplogwipe confirm' to proceed.", "yellow");
}