// security_setup -- run from onLoad and onInstall, and by any reflex that
// finds the namespace missing. Namespace, registry, migration, configuration.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.security) client.loom.security = {};
client.loom.registry.security = { version: "0.2.0", keyword: "SECURITY" };
var SE = client.loom.security;

// One-time migration from the pre-0.2 names, then cleared.
var seAt = get_variable("antitheft");
if (seAt !== null && seAt !== undefined) {
  if (!get_variable("security_antitheft")) set_variable("security_antitheft", (seAt == 1 || seAt == "1") ? "on" : "off");
  delete_variable("antitheft");
}
var seBp = get_variable("backpack");
if (seBp) {
  if (!get_variable("security_backpack")) set_variable("security_backpack", seBp);
  delete_variable("backpack");
}
if (get_variable("my_selfishness") !== null && get_variable("my_selfishness") !== undefined) delete_variable("my_selfishness");

if (!get_variable("security_antitheft")) set_variable("security_antitheft", "off");
if (get_variable("security_backpack") === null || get_variable("security_backpack") === undefined) set_variable("security_backpack", "");
if (get_variable("security_backpack_desc") === null || get_variable("security_backpack_desc") === undefined) set_variable("security_backpack_desc", "");
// Worn items antitheft puts back on: [{ desc: "a silver ring ...", wear: "wear ring123" }].
// desc is the text after "You remove " in the game's line.
if (!get_variable("security_items")) set_variable("security_items", []);
// House state commands (SECURITY HOUSE IN/OUT).
if (!get_variable("security_house")) set_variable("security_house", { "in": "", "out": "" });

SE.items = get_variable("security_items");
// Published for other packages (hunting puts autogold into it).
SE.backpack = get_variable("security_backpack");
if (SE.selfish === undefined) SE.selfish = false;
