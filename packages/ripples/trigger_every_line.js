// Every line: the work is in ripples_setup's R.line (#136: this runs on every game line, so it stays short).
if (!client.loom || !client.loom.ripples || !client.loom.ripples.line) run_function("ripples_setup", [], "ripples");
if (client.loom.ripples.line(args[0])) gag_current_line();
