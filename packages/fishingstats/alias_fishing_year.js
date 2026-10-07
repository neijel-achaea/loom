run_function("fsh_ensure", [], "fishingstats");
if (args[1]) {
  client.fsh.year = parseInt(args[1], 10);
  run_function("fsh_render", [], "fishingstats");
  display_notice("[fishingstats] session year set to " + client.fsh.year + " AF.", "cyan");
} else {
  display_notice("[fishingstats] session year is " + (client.fsh.year || "unknown") + ". It is picked up from the RANKINGS FISHING header, or set it with fpyear 1014.", "cyan");
}