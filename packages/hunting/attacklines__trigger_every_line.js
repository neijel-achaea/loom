// Every line: the work is in hunting_line (#136: this runs on every game line, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.hunting;
if (!lkH || !lkH.line) { run_function("hunting_line", [], "hunting"); lkH = client.loom.hooks.hunting; }
lkH.line(args);
