// "You have slain <mob>." ticks a KILL step of the quest you're following.
if (client.loom && client.loom.quests && client.loom.quests.onSlain) client.loom.quests.onSlain(String(args[1] || ""));
