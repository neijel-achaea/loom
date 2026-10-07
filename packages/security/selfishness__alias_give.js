var mySelfishness = get_variable("my_selfishness");
var wrapArgs = args[1];

if (mySelfishness == "1") {
  send_command("queue add eq generosity");
  send_command("queue add eq give " + wrapArgs);
  send_command("queue add eq selfishness");
} else {
  send_command("queue add eq give " + wrapArgs);
}