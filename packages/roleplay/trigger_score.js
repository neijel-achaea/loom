// SCORE's gender line ("| Gender : male  Race : Tsol'aa ..."): GMCP doesn't
// send your gender, so the pronouns for AUTO come from here.
if (!client.loom || !client.loom.roleplay || !client.loom.roleplay.learnGender) run_function("roleplay_setup", [], "roleplay");
client.loom.roleplay.learnGender(args[1]);
