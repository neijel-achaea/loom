// Every line: the work is in social_line (#136: this runs on every game line, so it stays short).
var lkH = client.loom && client.loom.hooks && client.loom.hooks.social;
if (!lkH || !lkH.line) { run_function("social_line", [], "social"); lkH = client.loom.hooks.social; }
lkH.line(args);
