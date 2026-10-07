run_function("self_init", [], "self");
client.self.score.xprank = args[1];
client.self.score.explorer = args[2];
client.self.score.t = Math.floor(new Date().getTime() / 1000);
run_function("self_render", [], "self");