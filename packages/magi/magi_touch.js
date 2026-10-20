var MG = client.loom.magi;
if (MG.state === "ir") {
  // The rift's counts are settled: keep them, and tell loom (#44).
  try { set_variable("magi_rift", JSON.stringify(MG.rift)); } catch (e) {}
  if (client.loom.notify) client.loom.notify("magi");
  MG.state = "touch";
  send_command("touch crystal");
}
