if (args.gmcp_method == "Char.Vitals") {
  var stats = args.gmcp_args.charstats;
  var rage = null;
  if (stats) {
    for (var i = 0; i < stats.length; i++) {
      var m = stats[i].match(/^Rage:\s*(\d+)/);
      if (m) { rage = parseInt(m[1], 10); }
    }
  }
  if (rage !== null) {
    set_variable("my_rage", rage);
    run_function("hl_buttons", [], "hunting");
  }
}