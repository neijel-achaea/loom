// Every line: the work is in chronicle_setup's CR.line (#136: this runs on every game line, so it stays short).
if (!client.loom || !client.loom.chronicle || !client.loom.chronicle.line) run_function("chronicle_setup", [], "chronicle");
client.loom.chronicle.line(args[0]);
