run_function("lvl_ensure", [], "levelgraph");
client.lvlForceMark = true;
run_function("lvl_sample", [], "levelgraph");
display_notice("[level] sample recorded. Session buffer " + client.lvlMin.length + " point(s), long term " + client.lvlDay.length + " day(s).", "cyan");