var C = client.loom.civic;
var title = get_variable("civic_aide_title");
var clan = get_variable("civic_aide_clan");
display_notice("[civic] city: " + (C.city || "not seen yet"), "cyan");
display_notice("  aide: " + (get_variable("civic_aide_on") == "on" ? "ON duty" : "off duty")
  + ", title " + (title ? "'" + title + "'" : "not set")
  + ", novice clan " + (clan ? clan : "not set"), "cyan");
display_notice("  CIVIC HELP for commands.", "cyan");
