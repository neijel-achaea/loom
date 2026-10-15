var H = client.loom.harvesting;
set_variable("harvesting_min", H.min);
set_variable("harvesting_map", H.map);
set_variable("harvesting_stock", H.stock);
// Stock and minimums are what harvesting's look reports (#46): tell loom,
// guarded (harvesting works without it).
if (client.loom.notify) client.loom.notify("harvesting");
