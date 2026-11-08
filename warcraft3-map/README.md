# Pikasoo Kingdoms — Warcraft III melee map (12 players)

- File: `(12)PikasooKingdoms.w3x` — Warcraft III 1.26 / 1.27 (The Frozen Throne)
- 256 x 256, the biggest size 1.26 allows. The whole land between the castles is built up as city districts
  (street grid + houses in the style of each region). 6 regions, each with its own
  ground and trees: green heartland (centre), snowy north, Ashenvale-like west, golden autumn east,
  barren desert south and a tropical coast in the south east.
  - 12 castles: stone walls, a water moat with causeways at the 4 gates, corner towers and farms
  - a big walled capital with a moat and an inner keep in the middle (tavern, marketplace, goblin shops, fountain, houses, villagers)
  - 3 walled towns in the corners and a harbour town with a goblin shipyard on the south-east coast
  - a river from the north down to the sea with 3 stone bridges, a lake, forests, roads
  - 11 expansions + 3 rich mines guarded by creeps; trees never fall
- Humans are Blood Elves: Kunkka (free main hero with his own skills: Torrent, Tidebringer,
  X Marks the Spot, Ghost Ship), Arthas, Uther, Kael'thas, golden knights.
- Orcs are randomly Horde (normal) or Fel Orcs (Chaos Grunt/Raider/Kodo/Warlock, heroes:
  Chaos Blademaster, Grom, Azgalor, Magtheridon). Computer Fel Orcs keep normal peons and get a
  small attack script so they still fight.
- A human player who picks Night Elf becomes Naga: Illidan (horns + wings, toggle Metamorphosis
  with F, no time limit, from level 2, no mana), Medusa and a Naga Royal Guard.

## Install
Copy the `.w3x` into `Warcraft III\Maps\Download\`, then Single Player → Custom Game (or LAN).

## Rebuild
`python3 build_map.py` (no dependencies).
