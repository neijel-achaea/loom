var pause = get_variable("pauseTriggers");
var autogold = get_variable("autogold");
var backpack = get_variable("backpack");

if (pause == "off") {
  if (autogold == "all")
  {
    send_command("queue add be get gold", 1); 
    send_command("queue add be put gold in " + backpack, 1); 
  }
    
  if (autogold == "on" && client.mykill && Date.now() - client.mykill < 5000) { 
    client.mykill = 0; 
    send_command("queue add be get gold", 1); 
    send_command("queue add be put gold in " + backpack, 1); 
  }
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}