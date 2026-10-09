// loom: the suite package. Holds the LOOM command, the shared settings and,
// from v0.4, the integrations between packages. No package requires it.
if (!client.loom) client.loom = {};
if (!client.loom.registry) client.loom.registry = {};
if (!client.loom.loom) client.loom.loom = {};
client.loom.registry.loom = { version: "0.2.2", keyword: "LOOM" };

set_variable("pauseTriggers", "off");
