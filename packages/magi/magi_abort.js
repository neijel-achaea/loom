var MG = client.loom.magi;
clearTimeout(MG.watchdog);
clearTimeout(MG.settle);
clearTimeout(MG.pumpT);
display_notice("[magi] refine stopped: " + (MG.abortWhy || "cancelled") + ".", "orange");
MG.abortWhy = null;
MG.state = "idle";
MG.queue = [];
