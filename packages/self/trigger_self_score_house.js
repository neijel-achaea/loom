if (!client.loom || !client.loom.self || !client.loom.self.keep) run_function("self_setup", [], "self");
client.loom.self.score.houseRank = args[1];
client.loom.self.score.houseTitle = args[2];
client.loom.self.score.t = Math.floor(new Date().getTime() / 1000);
run_function("self_render", [], "self");