run_function("fsh_ensure", [], "fishingstats");
if (args[1]) {
  client.fshMe = args[1];
  try { set_variable("fsh_me", args[1]); } catch (e) {}
  run_function("fsh_render", [], "fishingstats");
  display_notice("[fishingstats] your angler name is set to " + args[1] + "; your row is highlighted.", "cyan");
} else { display_notice("[fishingstats] highlighted angler is " + (client.fshMe || "not set") + ". Usage: fpme Neijel.", "cyan"); }