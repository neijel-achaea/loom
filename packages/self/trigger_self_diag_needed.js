if (!client.loom || !client.loom.self || !client.loom.self.keep) run_function("self_setup", [], "self");
client.loom.self.needDiag = true;
display_notice("[self] a venom's effects are unknown: DIAG!", "orange");
run_function("self_render", [], "self");