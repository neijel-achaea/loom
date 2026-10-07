var tail = get_variable("party_ih_tail") || 0;
if ((Date.now() / 1000) - tail < 2) {
  gag_current_line();
  set_variable("party_ih_tail", 0);
}