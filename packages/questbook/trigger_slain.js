// "You have slain <mob>." ticks a KILL step of the quest you're following.
if (client.loom && client.loom.questbook && client.loom.questbook.onSlain) client.loom.questbook.onSlain(String(args[1] || ""));
