var CR = client.loom.crystalism;
if (CR.state === "ir") {
  // The rift's counts are settled: keep them, and tell loom (#44).
  try { set_variable("crystalism_rift", JSON.stringify(CR.rift)); } catch (e) {}
  if (client.loom.notify) client.loom.notify("crystalism");
  CR.state = "touch";
  send_command("touch crystal");
}
