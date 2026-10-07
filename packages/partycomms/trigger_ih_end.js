if (get_variable("party_ih") == 1) {
  gag_current_line();
  set_variable("party_ih", 0);
  set_variable("party_ih_tail", Date.now() / 1000);
}