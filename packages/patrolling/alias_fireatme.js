var currentArea = get_variable("currentArea");
var currentRoomName = get_variable("currentRoomName");
var currentRoomId = get_variable("currentRoomId");

send_command("clan switch wildwalkers");
send_command("clt Fire at me! " + currentRoomName + " (" + currentRoomId + ") at " + currentArea);
