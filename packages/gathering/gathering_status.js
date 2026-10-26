if (!client.loom || !client.loom.gathering || !client.loom.gathering.envs) run_function("gathering_setup", [], "gathering");
var GA = client.loom.gathering;
var gaOut = [], gaSeen = {};
for (var gaEnv in GA.envs) {
  for (var gaI = 0; gaI < GA.envs[gaEnv].length; gaI++) {
    var gaM = GA.envs[gaEnv][gaI];
    if (gaSeen[gaM]) continue;
    gaSeen[gaM] = true;
    var gaH = GA.have(gaM);
    if (gaH == null || gaH < GA.minOf(gaM)) gaOut.push(gaM + " " + (gaH == null ? "?" : gaH) + "/" + GA.minOf(gaM));
  }
}
display_notice("[gathering] " + (GA.on ? "ON" : "OFF") + ", default minimum " + GA.defMin + ", environment here: " + (GA.here || "?") + ". GATHERING HELP for commands.", "cyan");
display_notice(gaOut.length ? "[gathering] below minimum: " + gaOut.join(", ") : "[gathering] everything at or above its minimum.", "cyan");
