// "You place your ingredients into …, leaving you with …": a brew landed.
var RM = client.loom && client.loom.remedies;
if (RM && RM.brewed) RM.brewed();
