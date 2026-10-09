if (!client.loom || !client.loom.self || !client.loom.self.keep) run_function("self_setup", [], "self");
client.loom.self.needDiag = false;
run_function("self_render", [], "self");