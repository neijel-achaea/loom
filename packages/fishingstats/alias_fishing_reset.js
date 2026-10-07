run_function("fsh_ensure", [], "fishingstats");
if ((args[1] || "") === "confirm") {
  client.fsh = { start: Math.floor(new Date().getTime() / 1000), anglers: {}, species: {}, recent: [], n: 0 };
  try { set_variable("fsh_session", JSON.stringify(client.fsh)); } catch (e) {}
  run_function("fsh_render", [], "fishingstats");
  display_notice("[fishingstats] new session started.", "cyan");
} else {
  display_notice("[fishingstats] this clears the current session tally. Type 'fpreset confirm' to proceed.", "yellow");
}