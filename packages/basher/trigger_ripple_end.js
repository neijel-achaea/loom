// The Mnemosyne's boon screen ends a ripple (Ricardo: the tab kept the last
// ripple's enemies): the kill order shows only the types met from here on.
// Shown as it is.
if (!client.loom || !client.loom.basher) run_function("basher_setup", [], "basher");
var B = client.loom.basher;
if (B.area === B.NOAREA) { B.seen = {}; B.autoTop = ""; if (B.draw) B.draw(); }
