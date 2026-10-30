# Shopping

*A shopping list priced from the city's directory, grouped by shop in a tab.*

<!-- loom:version shopping -->
*This page describes shopping 0.1.6.*
<!-- /loom:version -->

## What it is

Shopping keeps a list of what you mean to buy, and where. `SHOPPING ADD 5 tinderbox` looks the item up with the game's `DIRECTORY` in the city you're in (the table is hidden while it's read) and puts it under the shop that sells it cheapest. The custom tab named **Shopping** groups the list by shop, so you can see what to buy in each one and how much gold it's likely to cost.

- **By shop.** Each shop with its subtotal and the area it was looked up in, then its items: how many, the price of one, and the line total. The title line counts items and shops and gives the likely total.
- **Every shop kept.** Each item keeps every shop the directory listed, with its price and, for bulk items, its stock. Hover an item to see them, cheapest first.
- **Cheapest, then fewest stops.** An item goes to the cheapest shop; among shops at that price, those with enough stock come first, and then a shop the list visits anyway, so equal prices don't add a stop. This is worked out again whenever the list changes, so an item added earlier moves when a later one makes another shop a stop anyway. When even the chosen shop has too few in stock, the row shows ⚠.
- **Bulk items.** Herbs and other goods sold in bulk are priced for one (`9gp ea`), and the directory puts the shop's stock in front of the name (`1387 kuzu roots`). Shopping takes the count off, so the same goods from different shops are one item: `10 × kuzu roots`.
- **Which one?** A word can match different items (`DIRECTORY VIAL` lists oaken, sandstone and marble vials). Shopping then lists them, cheapest first, in a box at the top of the tab and as notices: click one, or `SHOPPING PICK <number>`. At one price, items sold at a shop already on your list come first, marked ⚑.
- **Adding again.** Adding an item that's already on the list adds to its quantity and takes the fresh price and shops.
- **Removing.** Hover a row for its `×`, or `SHOPPING REMOVE <number|item> [n]` to take some or all of it off.
- **Skipping a shop.** The `×` on a shop's line (or `SHOPPING SKIP <shop|number>`) leaves that shop out: its items move to their next cheapest shops, and the notice says how much more that costs. Items sold nowhere else stay, marked. Skipped shops are listed under the list; click one (or `SHOPPING UNSKIP <shop>|ALL`) to use it again.

Prices are the directory's: a shopkeeper's own policy (discounts, surcharges) can change them, so the totals are an estimate. Each shop's line has a **WALK** button that sends the game's `WALKTO <shop>` once (or `SHOPPING WALK <shop|number>`); the game stops the walk at a closed door or anything else in the way. Inside a shop on the list, its heading reads ◉ HERE and each of its items gets a **BUY** button that sends `BUY <how many> <the word you added it by>` once (or `SHOPPING BUY <number|item>`, refused elsewhere); when the game says you paid and received it (`You pay 80 sovereigns and receive a group of 10 cohosh roots.`), the item comes off the list, or only what you got of it when that's fewer. A shop is recognised by its room's name; when a shop's room has another name, stand in it and type `SHOPPING HERE <shop>` once. Otherwise Shopping sends only `DIRECTORY` when you add something.

## Commands

<!-- loom:commands shopping -->
| Command | What it does |
|---|---|
| `SHOPPING` | the list by shop, numbered, with subtotals and the likely total |
| `SHOPPING ADD [n] <item>` | look it up with DIRECTORY (in a city) and list n of it under its cheapest shop; again adds to the quantity |
| `SHOPPING PICK <number>` | when the directory found different items for a word, the one you mean (or click it in the tab) |
| `SHOPPING REMOVE <number\|item> [n]` | take an item off the list, or only n of it (also the × on its row in the tab) |
| `SHOPPING WALK <shop\|number>` | walk to a shop on the list (WALKTO <shop>), as WALK on its line in the tab |
| `SHOPPING BUY <number\|item>` | in its shop: buy the wanted amount (BUY <n> <word you added it by>), as BUY on its line |
| `SHOPPING HERE [shop\|number]` | which shop you're in; with a shop: this room is it (when its room name differs) |
| `SHOPPING SKIP [shop\|number]` | leave a shop out: its items move to their next cheapest shops (× on its line); bare: the skipped ones |
| `SHOPPING UNSKIP <shop>\|ALL` | use a skipped shop again (or click it under the list) |
| `SHOPPING CLEAR CONFIRM` | wipe the whole list |
| `SHOPPING RESET` | reload the saved list, redraw the tab |
| `SHOPPING DEBUG` | internal state |
| **Prices are the directory's: a shopkeeper's policy can change them. WALK and BUY send one command per click; nothing runs on its own.** | |
| **The tab is a custom tab named Shopping.** | |
<!-- /loom:commands -->

`SHOPPING` alone lists everything by shop, numbered; those numbers work with `REMOVE` and `PICK`. `SHOPPING REMOVE 3` takes item 3 off, `SHOPPING REMOVE 3 2` two of it, `SHOPPING REMOVE tinderbox` the item whose description has that word (when only one does).

## Setting it up

1. **Import `shopping.nxs`** (see [Getting started](getting-started.md)).
2. **Create a custom tab named `Shopping`** (exactly that name); it fills in at once.
3. In a city, `SHOPPING ADD [n] <item>` with the word you'd give `DIRECTORY`.

## Daily use

Build the list as you think of things, wherever in the city you are: the directory covers the whole city or area you're in. Before a shopping trip, the tab tells you which shops to visit and roughly how much gold to bring. Take items off as you buy them, or wipe the list with `SHOPPING CLEAR CONFIRM` when you're done.

## Working with other packages

Shopping reads nothing from other packages. Like every package that sends a command and reads its answer, it waits while another package is waiting on an answer of its own, and others wait for its `DIRECTORY`.

## Troubleshooting

- **The tab stays empty.** Check the custom tab is named exactly `Shopping`, then `SHOPPING RESET`.
- **"The directory lists nothing".** `DIRECTORY` only covers the city or area you're in; try `DIRECTORY <word>` yourself to see the game's answer.
- **An item is under the wrong shop or price.** Add it again to refresh its price and shops, or remove it and add it anew. `SHOPPING DEBUG` shows the lookup in progress.
