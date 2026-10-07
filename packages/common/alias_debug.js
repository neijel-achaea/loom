var status = args[1];

if (status == "on" || status == "off") {
  set_variable("debug", status);
  display_notice("[common] debug " + status);
} else {
  display_notice("[common] use DEBUG ON/OFF.")  
}