// Known failure lines settle the GATHER at once; any other answer is
// settled at the prompt (gathering_setup, GA.prompt).
if (client.loom && client.loom.gathering && client.loom.gathering.current) client.loom.gathering.fail(client.loom.gathering.current);
