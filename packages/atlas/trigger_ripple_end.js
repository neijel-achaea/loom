// The Mnemosyne's boon screen ends a ripple: the next ripple is a new layout,
// so Atlas sketches it afresh from the next room (#451). Shown as it is.
if (!client.loom || !client.loom.atlas || !client.loom.atlas.look) run_function("atlas_setup", [], "atlas");
if (client.loom.atlas.sketch) client.loom.atlas.rippleEnd = true;
