if (!client.loom || !client.loom.dmgchart || !client.loom.dmgchart.saved) run_function("dmgchart_setup", [], "dmgchart");
client.loom.dmgchart.ev = { dir: "out", type: String(args[2]).replace("physical ", ""), amt: parseInt(args[1], 10) };
run_function("dmgchart_add", [], "dmgchart");
