run_function("fsh_ensure", [], "fishingstats");
var had = client.fsh.n;
run_function("fsh_archive", [], "fishingstats");
if (had > 0) { display_notice("[fishingstats] session filed to the log (" + had + " landed). New session started.", "cyan"); }
else { display_notice("[fishingstats] nothing landed, so nothing was filed. Session restarted.", "yellow"); }