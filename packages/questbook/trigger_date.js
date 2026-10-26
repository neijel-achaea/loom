// The game's date ("Today is the 5th of Valnuary, …" from DATE, or the new
// day's "It is now the …"): tells Questbook when 1st Sarapin is, for yearly
// quests.
if (client.loom && client.loom.questbook && client.loom.questbook.seeDate) client.loom.questbook.seeDate(String(args[2] || ""));
