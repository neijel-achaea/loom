var arg = args[1] || "";
if (arg === "confirm") {
  set_variable("hs_areas", "{}"); set_variable("hs_log", "[]");
  run_function("hs_render", [], "huntstats");
  display_notice("[huntstats] history wiped", "red");
} else {
  display_notice("[huntstats] This clears ALL saved area stats and the session log. Type HUNTWIPE CONFIRM to proceed.", "yellow");
}