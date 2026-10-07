// Known last line of the DATE block - this is what closes the capture.
if (client.lg && client.lg.inBlock) {
  gag_current_line();
  client.lg.inBlock = false;
}
