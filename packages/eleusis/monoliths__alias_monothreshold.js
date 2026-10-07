if (args[1]) set_variable("mono_threshold", parseInt(args[1], 10));
var thr = get_variable("mono_threshold");
if (thr === null || thr === undefined) { thr = 10; set_variable("mono_threshold", 10); }
display_notice("[eleusis] Threshold: " + thr + " months.", "cyan");