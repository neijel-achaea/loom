var pause = get_variable("pauseTriggers");
var party_on = get_variable("party_on");

if (pause == "off") {
  var tar = get_variable("tar");
  var now = Date.now() / 1000;
  if (!tar) {
    set_variable("tarname", "");
    set_variable("tarname_for", "");
  } else {
    if (party_on == "1") {
      var forid = get_variable("tarname_for");
      var asked = get_variable("party_ih_at") || 0;
      if (tar != forid && now - asked >= 2) {
        set_variable("party_ih", 1);
        set_variable("party_ih_at", now);
        send_command("ih", 1);
      }
    }
  }
} else {
  display_notice("[common] Triggers are currently paused.", "orange");
}