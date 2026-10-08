if (!client.loom || !client.loom.security || !client.loom.security.items) run_function("security_setup", [], "security");
var SE = client.loom.security;
SE.wrap = "sell " + args[1];
run_function("security_wrap", [], "security");
