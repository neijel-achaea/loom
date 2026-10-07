display_notice("[eleusis] on=" + get_variable("mono_on")
  + " thr=" + get_variable("mono_threshold")
  + " flagged=" + Object.keys(get_variable("mono_bad") || {}).length
  + " ignored=" + Object.keys(get_variable("mono_ignore") || {}).join(",")
  + " queue=" + JSON.stringify(get_variable("mono_queue"))
  + " await=" + JSON.stringify(get_variable("mono_await"))
  + " roomId=" + get_variable("currentRoomId")
  + " roomName=" + get_variable("currentRoomName"), "cyan");
