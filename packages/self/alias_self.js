// SELF [subcommand ...]: the one command for this package. The words go
// through client.loom.self.args, since run_function cannot pass parameters.
if (!client.loom || !client.loom.self || !client.loom.self.keep) run_function("self_setup", [], "self");
client.loom.self.args = args[1] || "";
run_function("self_cmd", [], "self");
