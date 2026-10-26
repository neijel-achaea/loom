// Harvesting loads off (conventions: switches that act load off), so a page
// reload never leaves it running unnoticed.
set_variable("harvesting_on", "off");
run_function("harvesting_setup", [], "harvesting");
