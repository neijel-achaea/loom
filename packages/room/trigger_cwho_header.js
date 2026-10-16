// CWHO's header ("Citizen Rank CT Class"): the citizen rows that follow
// tell who carries a newbie title (#242). Rows count for two seconds after
// it (CWHO arrives in one go); nothing is sent for it.
if (!client.loom || !client.loom.room || !client.loom.room.raw) run_function("room_setup", [], "room");
client.loom.room.cwhoAt = Date.now();
client.loom.room.cwhoDirty = false;
