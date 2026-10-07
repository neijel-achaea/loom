var plant = args[1];
var currentArea = get_variable("currentArea");
var currentRoomName = get_variable("currentRoomName");
var currentRoomId = get_variable("currentRoomId");
var today = client.lg.day;

var n = today - 1;
var yy = Math.floor(n / 300);
var rem = n - yy * 300;
var mi = Math.floor(rem / 25);
var dd = (rem % 25) + 1;
var stamp = today > 0 ? (dd + " " + client.lg.months[mi] + ", " + yy + " AF") : "date not yet known";

send_command("writelog wildwalkers " + stamp + " - Replanted " + plant + " at " + currentRoomName + " (" + currentRoomId + ") in " + currentArea);