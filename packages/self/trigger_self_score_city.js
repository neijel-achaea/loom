run_function("self_init", [], "self");
client.self.score.cityRank = args[1];
client.self.score.cityTitle = args[2];
client.self.score.t = Math.floor(new Date().getTime() / 1000);
run_function("self_render", [], "self");