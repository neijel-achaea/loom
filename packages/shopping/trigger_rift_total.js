// "You store 10 kola, bringing the total in the rift to 2,408." (and remove):
// the item's new total in the rift (#440). args[3] the item, args[4] the total.
if (!client.loom || !client.loom.shopping || !client.loom.shopping.list) run_function("shopping_setup", [], "shopping");
client.loom.shopping.riftTotal(args[3], args[4]);
