// Capitalised as the game writes names, since other packages compare it.
var newName = args[1].charAt(0).toUpperCase() + args[1].slice(1).toLowerCase();
set_variable("my_name", newName);
run_function("self_render", [], "self");
display_notice("[self] Name set: " + newName, "cyan");