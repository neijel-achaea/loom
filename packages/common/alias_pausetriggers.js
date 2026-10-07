var status = args[1];

if (status == "on" || status == "off") {
  set_variable("pauseTriggers", status);
  display_notice("[common] pauseTriggers " + status, "cyan");
} else {
  display_notice("[common] use PAUSETRIGGERS ON/OFF.", "cyan")  
}