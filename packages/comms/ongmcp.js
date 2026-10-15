// Channel traffic for the Comms tab (#157), from GMCP only:
//   Comm.Channel.Text {channel, talker, text}: one line (text is the whole game
//     line with its ANSI colours: "\u001b[0;1;33mDol tells you, ...")
//   Comm.Channel.List [{name, caption, command}]: the channels' own names
//   Char.Name / Char.Status: your name, so your own lines can be told apart
var cmM = "";
var cmA = null;
try { cmM = args.gmcp_method; cmA = args.gmcp_args; } catch (e) { cmM = ""; }
if (cmM === "Comm.Channel.Text" || cmM === "Comm.Channel.List" || cmM === "Char.Name" || cmM === "Char.Status") {
  if (typeof cmA === "string") { try { cmA = JSON.parse(cmA); } catch (e) { } }
  if (!client.loom || !client.loom.comms || !client.loom.comms.chans) run_function("comms_setup", [], "comms");
  var CM = client.loom.comms;
  if (cmM !== "Char.Status") CM.raw[cmM] = cmA;
  if (cmM === "Comm.Channel.Text" && cmA && cmA.channel) {
    run_function("comms_add", cmA, "comms");
  } else if (cmM === "Comm.Channel.List" && cmA && cmA.length) {
    for (var cmI = 0; cmI < cmA.length; cmI++) {
      if (cmA[cmI] && cmA[cmI].name && cmA[cmI].caption) CM.captions[String(cmA[cmI].name)] = String(cmA[cmI].caption);
    }
    run_function("comms_render", [], "comms");
  } else if ((cmM === "Char.Name" || cmM === "Char.Status") && cmA && cmA.name) {
    var cmN = String(cmA.name).split(/\s+/)[0];
    if (cmN && cmN !== CM.me) { CM.me = cmN; set_variable("comms_name", cmN); }
  }
}
