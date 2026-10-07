var pause = get_variable("pauseTriggers");

if (pause == "off") {
  var me = get_variable("party_me");
  var on = get_variable("party_on");
  var hp = to_number(get_variable("my_hp"));
  var maxhp = to_number(get_variable("my_maxhp"));
  run_function("party_resolve", [], "partycomms");
  if (me && on != 0 && maxhp > 0) {
    var mp = to_number(get_variable("my_mp"));
    var maxmp = to_number(get_variable("my_maxmp"));
    var ep = to_number(get_variable("my_ep"));
    var maxep = to_number(get_variable("my_maxep"));
    var wp = to_number(get_variable("my_wp"));
    var maxwp = to_number(get_variable("my_maxwp"));
    var rage = to_number(get_variable("my_rage")) || 0;
    var nl = get_variable("my_nl") || 0;
    var tid = get_variable("tar") || 0;
    var tnm = get_variable("tarname");
    if (!tnm) { tnm = "-"; }
    var now = Date.now() / 1000;
    var last = get_variable("party_last_send") || 0;
    var prev = get_variable("party_last_sent") || {};
    var hpp = Math.round(hp * 100 / maxhp);
    var mpp = 0;
    if (maxmp > 0) { mpp = Math.round(mp * 100 / maxmp); }
    var moved = false;
    if (Math.abs(hpp - (prev.hp || 0)) >= 5) { moved = true; }
    if (Math.abs(mpp - (prev.mp || 0)) >= 5) { moved = true; }
    if (tid != prev.tid) { moved = true; }
    if (tnm != prev.tname) { moved = true; }
    if (now - last >= 10) { moved = true; }
    if (moved && now - last >= 1) {
      var msg = "pt [PARTYINFO] " + me;
      msg = msg + " " + hp + "/" + maxhp;
      msg = msg + " " + mp + "/" + maxmp;
      msg = msg + " " + ep + "/" + maxep;
      msg = msg + " " + wp + "/" + maxwp;
      msg = msg + " " + rage;
      msg = msg + " " + nl;
      msg = msg + " | " + tid + " " + tnm;
      send_command(msg, 1);
      var sent = {};
      sent.hp = hpp;
      sent.mp = mpp;
      sent.tid = tid;
      sent.tname = tnm;
      set_variable("party_last_send", now);
      set_variable("party_last_sent", sent);
    }
    run_function("party_render", [], "partycomms");
  }
}