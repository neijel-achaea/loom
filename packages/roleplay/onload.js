run_function("roleplay_setup", [], "roleplay");
// Ambient emotes that were on keep running after a reload.
if (get_variable("roleplay_aem_on") === "1") run_function("roleplay_aem", [], "roleplay");
