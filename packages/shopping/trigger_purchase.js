// "You purchase 10 cloth for 450 gold." in a commodity shop (#473): it comes
// off the list as other purchases do. args[1] how many, args[2] what.
if (!client.loom || !client.loom.shopping || !client.loom.shopping.list) run_function("shopping_setup", [], "shopping");
client.loom.shopping.received(args[1] + " " + args[2]);
