var S = client.loom.sigils;
var v = parseInt(S.argv[0], 10);
if (!isNaN(v) && v > 0) set_variable("sigils_threshold", v);
display_notice("[sigils] threshold: " + get_variable("sigils_threshold") + " months.", (!isNaN(v) && v > 0) ? "lime" : "cyan");
