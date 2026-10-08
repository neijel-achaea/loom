// security_wrap -- sends SE.wrap (give/sell/drop/offer ...), lifting
// selfishness around it when it is up.
var SE = client.loom.security;
if (SE.selfish) {
  send_command("queue add eq generosity");
  send_command("queue add eq " + SE.wrap);
  send_command("queue add eq selfishness");
} else {
  send_command("queue add eq " + SE.wrap);
}
