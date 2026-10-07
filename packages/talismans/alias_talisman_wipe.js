var arg = args[1] || "";
run_function("tal_ensure", [], "talismans");
if (arg === "confirm") {
  client.tal.reset();
  run_function("tal_sync", [], "talismans");
  display_notice("[talismans] all tracked pieces wiped", "red");
} else {
  display_notice("[talismans] this clears ALL tracked pieces. Type 'talwipe confirm' to proceed.", "yellow");
}