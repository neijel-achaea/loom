run_function("fsh_ensure", [], "fishingstats");
var lbv = parseInt(args[2], 10) || 0;
var ozv = parseInt(args[3], 10) || 0;
client.fshIn = { angler: args[1], species: args[4], oz: lbv * 16 + ozv };
run_function("fsh_record", [], "fishingstats");
display_notice("[fishingstats] recorded " + args[1] + " " + lbv + "lb " + ozv + "oz " + args[4] + ".", "cyan");