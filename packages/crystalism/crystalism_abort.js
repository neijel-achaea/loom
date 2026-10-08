var CR = client.loom.crystalism;
clearTimeout(CR.watchdog);
clearTimeout(CR.settle);
clearTimeout(CR.pumpT);
display_notice("[crystalism] refine stopped: " + (CR.abortWhy || "cancelled") + ".", "orange");
CR.abortWhy = null;
CR.state = "idle";
CR.queue = [];
