// Every line: the work is in coffers_setup's CO.line (#136: this runs on every game line, so it stays short).
if (!client.loom || !client.loom.coffers || !client.loom.coffers.line) run_function("coffers_setup", [], "coffers");
client.loom.coffers.line(args[0]);
