if (args.gmcp_method == "Room.Info") {
  var currentRoomId = args.gmcp_args.num;
  var currentRoomName = args.gmcp_args.name;
  var currentArea = args.gmcp_args.area;
  var currentEnvironment = args.gmcp_args.environment;
  set_variable("currentRoomId", currentRoomId);
  set_variable("currentRoomName", currentRoomName);
  set_variable("currentArea", currentArea);
  set_variable("currentEnvironment", currentEnvironment);
  run_function("mono_enter", [], "eleusis");
  run_function("hv_room", [], "harvesting");
}

if (args.gmcp_method == "Char.Vitals") {
  var dragonMode = get_variable("dragonMode");
  if (dragonMode == "auto") {
    run_function("best_dragon_mode", null, "common");
    run_function("set_buttons", null, "common");
  }
}

if (args.gmcp_method == "Char.Status" && args.gmcp_args.class) {
  var previousClass = get_variable("activeClass");
  var activeClass = args.gmcp_args.class;

  if (activeClass != previousClass) {
    set_variable("activeClass", activeClass);
    display_notice("New Class: " + activeClass, "green");    

    // Set buttons
    run_function("set_buttons", null, "common");

    // Adjust Ambient Emotes
    send_command("aem reload");
  }
}