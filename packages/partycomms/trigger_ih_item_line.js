var at = get_variable("party_ih_at") || 0;
if (get_variable("party_ih") == 1 && (Date.now() / 1000) - at < 3) {
  gag_current_line();
  var tar = "" + (get_variable("tar") || "");
  if (tar == args[1] + args[2] || tar == args[2]) {
    set_variable("tarname", args[3]);
    set_variable("tarname_for", get_variable("tar"));
  }
}