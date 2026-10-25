run_function("roleplay_setup", [], "roleplay");
// The two-line scripts' work (#136): made afresh, so a reimport replaces it.
run_function("roleplay_gmcp", [], "roleplay");
if (client.loom.roleplay && client.loom.roleplay.on) display_notice("[roleplay] ambient emotes ON, as you left them. ROLEPLAY AEM OFF to stop.", "cyan");
