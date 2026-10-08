// CIVIC [ministry or command ...]: the one command for this package.
if (!client.loom || !client.loom.civic) run_function("civic_setup", [], "civic");
var C = client.loom.civic;
var raw = String(args[1] || "").trim();
var parts = raw.split(/\s+/);
var sub = String(parts[0] || "").toLowerCase();
// Keep the original words too: titles and names keep their capitals.
C.argv = parts.slice(1);

if (sub === "" || sub === "status") run_function("civic_status", [], "civic");
else if (sub === "help") run_function("civic_help", [], "civic");
else if (sub === "aide") run_function("civic_aide", [], "civic");
else if (sub === "greet") run_function("civic_greet", [], "civic");
else display_notice("[civic] unknown command '" + sub + "'. CIVIC HELP for commands.", "orange");
