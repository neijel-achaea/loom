var CR = client.loom.crystalism;
if (CR.state === "ir") {
  CR.state = "touch";
  send_command("touch crystal");
}
