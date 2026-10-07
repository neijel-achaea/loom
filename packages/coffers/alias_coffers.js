client.gcArgs = [String(args[1] || "").toLowerCase(), String(args[2] || "").toLowerCase(), String(args[3] || "").toLowerCase()];
run_function("gc_cmd", [], "coffers");