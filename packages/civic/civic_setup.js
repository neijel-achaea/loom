// civic_setup -- run from onLoad and onInstall: namespace, registry and the
// per-city defaults. Each ministry keeps its settings in civic_<ministry>_*.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.civic) client.loom.civic = {};
client.loom.registry.civic = { version: "0.2.6", keyword: "CIVIC", desc: "{{description}}" };

// Known values per city. Players fill in their own city with CIVIC AIDE
// TITLE / CLAN; send yours back so it can be added here.
client.loom.civic.cities = {
  eleusis: { aide_title: "Verdant Emissary", aide_clan: "saiha" }
};
